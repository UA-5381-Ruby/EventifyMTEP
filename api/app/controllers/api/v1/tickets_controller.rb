# frozen_string_literal: true

module Api
  module V1
    class TicketsController < ApplicationController
      before_action :authenticate_user!

      def index
        tickets = current_user.tickets.includes(:event)
        render json: tickets, status: :ok
      end

      def create
        event = Event.find_by(id: create_params[:event_id])
        return render json: { errors: [t('errors.event_not_found')] }, status: :not_found unless event

        save_ticket(event)
      rescue ActiveRecord::RecordNotUnique
        render json: { errors: [t('errors.duplicate_ticket')] }, status: :unprocessable_content
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

      def save_ticket(_event)
        ticket = current_user.tickets.build(create_params)

        if ticket.save
          render json: { qr_code: ticket.qr_code, ticket: ticket }, status: :created
        else
          render json: { errors: ticket.errors.full_messages }, status: :unprocessable_content
        end
      end

      def create_params
        params.expect(ticket: [:event_id])
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
