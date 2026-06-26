# frozen_string_literal: true

module Api
  module V1
    class ActivitiesController < ApplicationController
      include Paginatable

      skip_before_action :set_brand, only: [:index], raise: false, if: -> { current_user&.superadmin? }
      before_action :require_authentication!
      before_action :require_superadmin!

      def index
        paginated = paginate(filtered_activities)

        render json: {
          data: format_activities(paginated[:records]),
          meta: format_meta(paginated[:meta])
        }, status: :ok
      end

      private

      def filtered_activities
        Activity.recent
                .by_activity_types(params[:activity_types])
                .by_resource_type(params[:resource])
                .by_status(params[:status])
                .by_user_email(params[:email])
      end

      def format_meta(meta)
        meta.merge(
          page: meta[:current_page],
          per_page: meta[:per_page],
          total: meta[:total_count],
          pages: meta[:total_pages]
        ).except(:current_page, :total_count, :total_pages)
      end

      def require_superadmin!
        render json: { error: 'Unauthorized' }, status: :forbidden unless current_user.is_superadmin?
      end

      def format_activities(activities)
        activities.map do |activity|
          {
            id: activity.id,
            actor: {
              id: activity.user_id,
              email: activity.user&.email || 'Unknown',
              name: activity.user&.name
            },
            type: activity.activity_type,
            resource: activity.resource_type,
            resource_id: activity.resource_id,
            resource_name: activity.resource_name,
            timestamp: activity.created_at.iso8601,
            details: activity.details,
            ip_address: activity.ip_address,
            status: activity.status
          }
        end
      end
    end
  end
end
