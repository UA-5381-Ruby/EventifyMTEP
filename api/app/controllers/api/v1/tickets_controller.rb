# frozen_string_literal: true

module Api
  module V1
    class TicketsController < ApplicationController
      before_action :authorize_request

      # POST /api/v1/tickets
      def create
        ticket = current_user.tickets.build(ticket_params)
        if ticket.save
          render json: { qr_code: ticket.qr_code }, status: :created
        else
          render json: { errors: ticket.errors.full_messages }, status: :unprocessable_content
        end
      rescue ActiveRecord::RecordNotUnique
        # Handle the race condition where two requests pass validation at the same time,
        # but the second one hits the DB unique index constraint.
        ticket.errors.add(:base, :already_registered, message: 'already registered for this event')
        render json: { errors: ticket.errors.full_messages }, status: :unprocessable_content
      end

      # GET /api/v1/my_tickets
      def my_tickets
        tickets = current_user.tickets.includes(:event)
        render json: tickets, status: :ok
      end

      # PUT/PATCH /api/v1/tickets/:id/review
      def review
        # Scope to current_user's tickets to prevent unauthorized access
        ticket = current_user.tickets.find(params[:id])

        feedback = ticket.event_feedback || ticket.build_event_feedback
        if feedback.update(review_params)
          render json: feedback, status: :ok
        else
          render json: { errors: feedback.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def ticket_params
        params.expect(ticket: [:event_id])
      end

      def review_params
        params.expect(ticket: %i[rating comment])
      rescue ActionController::ParameterMissing
        params.permit(:rating, :comment)
      end
    end
  end
end
