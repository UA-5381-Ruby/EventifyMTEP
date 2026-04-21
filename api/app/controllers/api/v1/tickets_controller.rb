# frozen_string_literal: true

module Api
  module V1
    class TicketsController < ApplicationController
      before_action :authenticate_user!, only: [:review]

      ##
      # Updates or creates the event feedback for a ticket and renders the result as JSON.
      #
      # Finds the ticket identified by `params[:id]`, retrieves or builds its associated `event_feedback`,
      # attempts to update that feedback using `review_params`, and renders the updated feedback with
      # HTTP status `:ok` on success or a JSON object containing `errors` with HTTP status
      # `:unprocessable_content` on failure.
      def review
        # TODO: Limit access to tickets owned by the current user
        # ticket = current_user.tickets.find(params[:id])
        ticket = Ticket.find(params[:id])

        # 1. Initialize or find the existing feedback record attached to this ticket
        feedback = ticket.event_feedback || ticket.build_event_feedback

        # 2. Update the feedback model instead of the ticket model
        if feedback.update(review_params)
          render json: feedback, status: :ok
        else
          render json: { errors: feedback.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def review_params
        # support both wrapped and unwrapped params
        params.expect(ticket: %i[rating comment])
      rescue ActionController::ParameterMissing
        params.permit(:rating, :comment)
      end
    end
  end
end
