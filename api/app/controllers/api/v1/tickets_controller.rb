# frozen_string_literal: true

module Api
  module V1
    class TicketsController < ApplicationController
      before_action :authenticate_user!, only: [:review]

      def review
        # TODO: Limit access to tickets owned by the current user
        # ticket = current_user.tickets.find(params[:id])
        ticket = Ticket.find(params[:id])

        if ticket.update(review_params)
          render json: ticket, status: :ok
        else
          render json: { errors: ticket.errors.full_messages }, status: :unprocessable_content
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
