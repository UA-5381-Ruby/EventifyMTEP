# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
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

      before_action :require_authentication!, only: %i[create]
      before_action :set_event, only: [:show]
      before_action :set_event, only: %i[show reviews]

      def index
        paginated = paginate(EventFilter.new(index_params, current_user).call)

        render json: {
          data: paginated[:records].as_json(methods: [:banner_url]),
          meta: paginated[:meta]
        }
      end

      def show
        render json: @event.as_json(
          methods: %i[banner_url average_rating reviews_count],
          include: event_serialization_includes
        ), status: :ok
      end

      def reviews
        feedbacks = @event.event_feedbacks.includes(ticket: :user).order(created_at: :desc)
        paginated = paginate(feedbacks)

        render json: {
          data: paginated[:records].map { |feedback| format_feedback(feedback) },
          meta: paginated[:meta]
        }, status: :ok
      end

      def create
        @event = build_event
        if @event.save
          render json: @event.as_json(methods: [:banner_url]), status: :created
        else
          render json: { errors: @event.errors }, status: :unprocessable_content
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: t('api.v1.errors.brands.not_found_or_access_denied') }, status: :forbidden
      end

      private

      def build_event
        brand = authorize_brand_access!
        attrs = process_banner_upload(event_base_params.to_h)

        Event.new(attrs.merge(brand: brand, status: 'draft')).tap do |event|
          event.category_ids = event_params[:category_ids] if event_params[:category_ids].present?
        end
      end

      def format_feedback(feedback)
        user = feedback.ticket.user
        {
          id: feedback.id,
          rating: feedback.rating,
          comment: feedback.comment,
          created_at: feedback.created_at,
          user: {
            id: user.id,
            name: user.name
          }
        }
      end

      def process_banner_upload(attrs)
        attrs = attrs.with_indifferent_access
        file = attrs[:banner]

        if file.present? && file.is_a?(ActionDispatch::Http::UploadedFile)
          attrs[:banner] =
            validated_media_key(file, folder: 'events/banners',
                                      error_scope: 'api.v1.errors.events.banner')
        end

        attrs
      end

      def validated_media_key(file, folder:, error_scope:)
        raise MediaUploadError, t("#{error_scope}.invalid_format") unless file.content_type.in?(ALLOWED_BANNER_TYPES)
        raise MediaUploadError, t("#{error_scope}.too_large", max_size: '5MB') if file.size > MAX_BANNER_SIZE

        s3_key = S3BucketService.new.upload(file, folder: folder)
        raise MediaUploadError, t("#{error_scope}.upload_failed") if s3_key.nil?

        s3_key
      end

      def authorize_brand_access!
        brand = current_user.brands.find(event_params[:brand_id])
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
        {
          brand: { only: %i[id name primary_color secondary_color] },
          categories: { only: %i[id name] }
        }
      end

      def event_params
        params.expect(event: [
                        :title, :description, :location, :start_date,
                        :end_date, :status, :brand_id, :banner, :price_cents, :available_tickets_count,
                        { category_ids: [] }
                      ])
      end

      def index_params
        @index_params ||= params.permit(:from, :to, :q, :sort, :order, :page, :per_page, :status, :brand_id,
                                        :category_id)
      end
    end
  end
end
# rubocop:enable Metrics/ClassLength
