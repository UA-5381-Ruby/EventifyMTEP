# frozen_string_literal: true

module Api
  module V1
    class EventsController < ApplicationController
      include Paginatable

      class MediaUploadError < StandardError; end

      MAX_BANNER_SIZE = 5.megabytes
      ALLOWED_BANNER_TYPES = %w[image/jpeg image/png image/webp image/gif image/svg+xml].freeze

      rescue_from MediaUploadError do |e|
        render json: { errors: [e.message] }, status: :unprocessable_content
      end

      rescue_from ActiveRecord::RecordNotFound do
        render json: { error: t('api.v1.errors.brands.not_found_or_access_denied') }, status: :forbidden
      end

      before_action :require_authentication!, only: %i[create update]
      before_action :set_event, only: %i[show update]

      def index
        paginated = paginate(EventFilter.new(index_params, current_user).call)
        render json: { data: paginated[:records].as_json(methods: [:banner_url]), meta: paginated[:meta] }
      end

      def show
        render json: @event.as_json(methods: [:banner_url], include: event_serialization_includes), status: :ok
      end

      def create
        @event = build_event
        if @event.save
          render json: @event.as_json(methods: [:banner_url]), status: :created
        else
          render json: { errors: @event.errors }, status: :unprocessable_content
        end
      end

      def update
        authorize_brand_access!(@event.brand_id)

        if @event.update(update_event_attrs)
          render json: @event.as_json(methods: [:banner_url], include: event_serialization_includes), status: :ok
        else
          render json: { errors: @event.errors }, status: :unprocessable_content
        end
      end

      private

      def build_event
        brand = authorize_brand_access!(event_params[:brand_id])
        attrs = process_banner_upload(event_base_params.to_h)
        Event.new(attrs.merge(brand: brand, status: 'draft')).tap do |event|
          event.category_ids = event_params[:category_ids] if event_params[:category_ids].present?
        end
      end

      def update_event_attrs
        attrs = process_banner_upload(event_base_params.to_h)
        attrs.merge!(category_ids: event_params[:category_ids]) if event_params[:category_ids].present?
        attrs
      end

      def process_banner_upload(attrs)
        attrs = attrs.with_indifferent_access
        file = attrs[:banner]

        if file.present? && file.is_a?(ActionDispatch::Http::UploadedFile)
          attrs[:banner] = validated_media_key(file, 'api.v1.errors.events.banner')
        end
        attrs
      end

      def validated_media_key(file, error_scope)
        raise MediaUploadError, t("#{error_scope}.invalid_format") unless file.content_type.in?(ALLOWED_BANNER_TYPES)
        raise MediaUploadError, t("#{error_scope}.too_large", max_size: '5MB') if file.size > MAX_BANNER_SIZE

        S3BucketService.new.upload(file, folder: 'events/banners') ||
          raise(MediaUploadError, t("#{error_scope}.upload_failed"))
      end

      def authorize_brand_access!(brand_id = event_params[:brand_id])
        brand = current_user.brands.find(brand_id)
        membership = brand.brand_memberships.find_by(user_id: current_user.id)
        raise Pundit::NotAuthorizedError unless membership&.role.in?(%w[owner manager])

        brand
      end

      def event_base_params
        event_params.except(:category_ids)
      end

      def set_event
        @event = Event.includes(:brand, :categories)
                      .merge(EventFilter.new(index_params, current_user).send(:accessible_events))
                      .find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: t('api.v1.errors.events.not_found') }, status: :not_found
      end

      def event_serialization_includes
        { brand: { only: %i[id name] }, categories: { only: %i[id name] } }
      end

      def event_params
        params.expect(event: [
                        :title, :description, :location, :start_date, :end_date, :status,
                        :brand_id, :banner, :price_cents, :available_tickets_count, { category_ids: [] }
                      ])
      end

      def index_params
        @index_params ||= params.permit(:from, :to, :q, :sort, :order, :page, :per_page, :status, :brand_id,
                                        :category_id)
      end
    end
  end
end
