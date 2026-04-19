# frozen_string_literal: true

module Api
  module V1
    class TicketsController < ApplicationController
      before_action :authenticate_user!


      def create
        ticket = current_user.tickets.build(create_params)

        if ticket.save
          render json: { qr_code: ticket.qr_code, ticket: ticket }, status: :created
        else
          render json: { errors: ticket.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def index
        tickets = current_user.tickets.includes(:event)
        render json: tickets, status: :ok
      end

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

      def create_params
        params.require(:ticket).permit(:event_id)
      end


      def review_params
        # support both wrapped and unwrapped params
        params.expect(ticket: %i[rating comment])
      rescue ActionController::ParameterMissing
        params.permit(:rating, :comment)
      end
    end
  end
end
