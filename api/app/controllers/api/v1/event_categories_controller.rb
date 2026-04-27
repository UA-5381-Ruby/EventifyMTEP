# frozen_string_literal: true

module Api
  module V1
    class EventCategoriesController < ApplicationController
      before_action :set_event
      before_action :set_event_category, only: [:destroy]

      # GET /api/v1/events/:event_id/categories
      # Behavior: Returns list of categories. Avoids N+1 via set_event.
      # Auth: Public for standard users/attendees.
      def index
        render json: @event.categories, status: :ok
      end

      # POST /api/v1/events/:event_id/categories
      # Behavior: Links category to event.
      # Auth: Restricted to owner/manager/superadmin.
      def create
        authorize @event, :manage_categories?

        event_category = @event.event_categories.build(event_category_params)

        if event_category.save
          render json: event_category.category, status: :created
        else
          render json: { errors: event_category.errors.to_hash }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotUnique
        # Validation: Catches composite unique index violation (Race Condition)
        render json: { errors: { category_id: ['already assigned to this event'] } }, status: :unprocessable_entity
      end

      # DELETE /api/v1/events/:event_id/categories/:category_id
      # Behavior: Removes tag. Uses Alternative DELETE Route.
      # Auth: Restricted to owner/manager/superadmin.
      def destroy
        authorize @event, :manage_categories?

        @event_category.destroy
        head :no_content
      end

      private

      def set_event
        # Optimization: includes(:categories) prevents N+1 queries in the index action
        @event = Event.includes(:categories).find(params[:event_id])
      rescue ActiveRecord::RecordNotFound
        render(json: { error: 'Event not found' }, status: :not_found) and return
      end

      def set_event_category
        # Finds the join record by the category_id from the URL
        @event_category = @event.event_categories.find_by!(category_id: params[:category_id])
      rescue ActiveRecord::RecordNotFound
        render(json: { error: 'Category is not assigned to this event' }, status: :not_found) and return
      end

      def event_category_params
        params.expect(event_category: [:category_id])
      rescue ActionController::ParameterMissing
        params.permit(:category_id)
      end
    end
  end
end
