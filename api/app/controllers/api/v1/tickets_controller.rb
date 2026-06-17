# frozen_string_literal: true

module Api
  module V1
    class TicketsController < ApplicationController
      include Paginatable

      before_action :set_ticket, only: %i[show review update]

      def index
        paginated = paginate(filtered_tickets)

        render json: {
          data: paginated[:records].as_json(**ticket_json_options),
          meta: paginated[:meta]
        }, status: :ok
      end

      def show
        render json: @ticket.as_json(**ticket_json_options), status: :ok
      end

      def create
        @ticket = @current_user.tickets.build(ticket_params)

        if @ticket.save
          render json: @ticket.as_json(**ticket_json_options), status: :created
        else
          render json: { errors: @ticket.errors.messages }, status: :unprocessable_content
        end
      rescue ActiveRecord::RecordNotUnique
        render json: { errors: { base: ['User is already registered for this event'] } },
               status: :unprocessable_content
      end

      def update
        if @ticket.update(ticket_update_params)
          render json: @ticket.as_json(**ticket_json_options), status: :ok
        else
          render json: { errors: @ticket.errors.full_messages }, status: :unprocessable_content
        end
      end

      def review
        feedback = @ticket.event_feedback || @ticket.build_event_feedback

        if feedback.update(review_params)
          render json: feedback, status: :ok
        else
          render json: { errors: feedback.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def set_ticket
        @ticket = @current_user.tickets.includes(:event, :event_feedback).find_by(id: params[:id])
        render(json: { error: 'Ticket not found' }, status: :not_found) and return unless @ticket
      end

      def ticket_json_options
        {
          methods: [:qr_code_url],
          include: ticket_serialization_includes
        }
      end

      def ticket_serialization_includes
        {
          event: { only: %i[id title location start_date end_date] },
          event_feedback: { only: %i[id rating comment] }
        }
      end

      def ticket_params
        params.expect(ticket: [:event_id])
      rescue ActionController::ParameterMissing
        params.permit(:event_id)
      end

      def ticket_update_params
        params.expect(ticket: [:is_active])
      rescue ActionController::ParameterMissing
        params.permit(:is_active)
      end

      def review_params
        params.expect(ticket: %i[rating comment])
      rescue ActionController::ParameterMissing
        params.permit(:rating, :comment)
      end

      def filtered_tickets
        tickets = base_tickets
        tickets = tickets.where(exact_match_params) if exact_match_params.any?
        tickets
      end

      def base_tickets
        @current_user.tickets
                     .includes(:event, :event_feedback)
                     .search_by_event(params[:q])
                     .sorted_by(params[:sort], params[:order])
      end

      def exact_match_params
        params.permit(:is_active, :event_id).to_h.compact_blank
      end
    end
  end
end
