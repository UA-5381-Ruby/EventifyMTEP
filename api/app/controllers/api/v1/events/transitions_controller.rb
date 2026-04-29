# frozen_string_literal: true

module Api
  module V1
    module Events
      class TransitionsController < ApplicationController
        before_action :set_event

        # POST /api/v1/events/:id/submit
        def submit
          authorize @event, :submit?

          @event.submit!
          render json: @event, status: :ok
        rescue AASM::InvalidTransition
          handle_invalid_transition('submit')
        end

        # POST /api/v1/events/:id/cancel
        def cancel
          authorize @event, :cancel?

          @event.cancel!
          render json: @event, status: :ok
        rescue AASM::InvalidTransition
          handle_invalid_transition('cancel')
        end

        # POST /api/v1/events/:id/approve
        def approve
          authorize @event, :approve?

          @event.approve!
          render json: @event, status: :ok
        rescue AASM::InvalidTransition
          handle_invalid_transition('approve')
        end

        # POST /api/v1/events/:id/reject
        def reject
          authorize @event, :reject?

          reason = params.dig(:event, :reason) || params[:reason]
          @event.reject!(reason)

          render json: @event, status: :ok
        rescue AASM::InvalidTransition
          handle_invalid_transition('reject')
        end

        private

        def set_event
          @event = Event.find(params[:id])
        rescue ActiveRecord::RecordNotFound
          render(json: { error: 'Event not found' }, status: :not_found) and return
        end

        def handle_invalid_transition(action)
          if action == 'submit' && !@event.all_required_fields_filled?
            return render json: {
              error: 'Cannot submit event',
              message: 'All required fields must be filled before submission'
            }, status: :unprocessable_content
          end

          render json: {
            error: "Cannot #{action} event",
            current_status: @event.status,
            message: "Transition '#{action}' is not valid from state '#{@event.status}'"
          }, status: :unprocessable_content
        end
      end
    end
  end
end
