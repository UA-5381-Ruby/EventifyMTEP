# frozen_string_literal: true

module Api
  module V1
    class EventsController < ApplicationController
      include Paginatable

      class MediaUploadError < StandardError; end

      rescue_from MediaUploadError do |e|
        if current_user.present?
          Activity.log_activity(
            current_user,
            'create',
            'Event',
            nil,
            params.dig(:event, :title),
            "Media upload failed: #{e.message}",
            request.remote_ip,
            request.user_agent,
            'failed'
          )
        end

        render json: { errors: [e.message] }, status: :unprocessable_content
      end

      before_action :require_authentication!, only: %i[create]
      before_action :set_event, only: [:show]

      def index
        paginated = paginate(EventFilter.new(index_params, current_user).call)

        render json: {
          data: paginated[:records].as_json(
            methods: [:banner_url],
            include: event_serialization_includes
          ),
          meta: paginated[:meta]
        }
      end

      def show
        render json: @event.as_json(
          methods: [:banner_url],
          include: event_serialization_includes
        ), status: :ok
      end

      def create
        @event = build_event
        if @event.save

          Activity.log_activity(
            current_user,
            'create',
            'Event',
            @event.id,
            @event.title,
            nil,
            request.remote_ip,
            request.user_agent,
            'success'
          )

          render json: @event.as_json(methods: [:banner_url]), status: :created
        else

          Activity.log_activity(
            current_user,
            'create',
            'Event',
            nil,
            event_params[:title],
            "Validation failed: #{@event.errors.full_messages.to_sentence}",
            request.remote_ip,
            request.user_agent,
            'failed'
          )

          render json: { errors: @event.errors }, status: :unprocessable_content
        end
      rescue ActiveRecord::RecordNotFound
        Activity.log_activity(
          current_user,
          'create',
          'Event',
          nil,
          params.dig(:event, :title),
          'Brand not found or access denied',
          request.remote_ip,
          request.user_agent,
          'failed'
        )

        render json: { error: 'Brand not found or access denied' }, status: :forbidden
      end

      private

      def build_event
        brand = authorize_brand_access!
        attrs = process_banner_upload(event_base_params.to_h)

        Event.new(attrs.merge(brand: brand, status: 'draft')).tap do |event|
          event.category_ids = event_params[:category_ids] if event_params[:category_ids].present?
        end
      end

      def process_banner_upload(attrs)
        attrs = attrs.with_indifferent_access
        file = attrs[:banner]

        if file.present? && file.is_a?(ActionDispatch::Http::UploadedFile)
          allowed_types = %w[image/jpeg image/png image/webp image/gif image/svg+xml]

          unless file.content_type.in?(allowed_types)
            raise MediaUploadError, 'Invalid banner format. Allowed types: JPG, PNG, WEBP, GIF, SVG.'
          end

          raise MediaUploadError, 'Banner file size must be under 5MB.' if file.size > 5.megabytes

          s3_key = S3BucketService.new.upload(file, folder: 'events/banners')
          raise MediaUploadError, 'Failed to upload banner to cloud storage. Please try again.' if s3_key.nil?

          attrs[:banner] = s3_key
        end

        attrs
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
        render json: { error: 'Event not found' }, status: :not_found
      end

      def event_serialization_includes
        {
          brand: { only: %i[id name] },
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
