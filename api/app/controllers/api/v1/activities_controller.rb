# frozen_string_literal: true

module Api
  module V1
    class ActivitiesController < ApplicationController
      include Paginatable

      before_action :require_authentication!
      before_action :require_superadmin!

      # GET /api/v1/activities
      def index
        scope = Activity.recent
        scope = scope.by_activity_types(params[:activity_types]) if params[:activity_types].present?
        scope = scope.by_resource_type(params[:resource]) if params[:resource].present?
        scope = scope.by_status(params[:status]) if params[:status].present?
        scope = scope.by_user_email(params[:email]) if params[:email].present?

        paginated = paginate(scope)

        render json: {
          data: format_activities(paginated[:records]),
          meta: paginated[:meta].merge(
            page: paginated[:meta][:current_page],
            per_page: paginated[:meta][:per_page],
            total: paginated[:meta][:total_count],
            pages: paginated[:meta][:total_pages]
          ).except(:current_page, :total_count, :total_pages)
        }, status: :ok
      end

      private

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
