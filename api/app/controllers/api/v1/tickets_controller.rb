# frozen_string_literal: true

module Api
  module V1
    class TicketsController < ApplicationController
      before_action :authenticate_user!, only: [:review]

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
