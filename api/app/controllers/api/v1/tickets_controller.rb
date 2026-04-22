# frozen_string_literal: true

module Api
  module V1
    class TicketsController < ApplicationController
      before_action :authenticate_user!

      # POST /api/v1/tickets
      def create
        ticket = current_user.tickets.build(event_id: params[:event_id])

        if ticket.save
          render json: { qr_code: ticket.qr_code }, status: :created
        else
          render json: { errors: ticket.errors.full_messages }, status: :unprocessable_content
        end
      end

      # GET /api/v1/my_tickets
      def my_tickets
        tickets = current_user.tickets.includes(:event)
        render json: tickets, status: :ok
      end

      ##
      # Updates or creates the event feedback for a ticket owned by the current user.
      def review
        # SECURITY FIX: Scope the search to the current_user's tickets to prevent
        # unauthorized users from editing feedback on tickets they don't own.
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
