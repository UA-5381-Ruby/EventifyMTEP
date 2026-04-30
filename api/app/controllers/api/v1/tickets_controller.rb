# frozen_string_literal: true

module Api
  module V1
    class TicketsController < ApplicationController
      before_action :set_ticket, only: %i[show review update]

      ##
      # Lists tickets owned by the current user, with optional filtering and pagination.
      #
      # The JSON response contains:
      # - `data`: an array of tickets with `event` and `event_feedback` included.
      # - `meta`: an object with `page`, `per_page`, and `total`.
      #
      # Pagination behavior:
      # - `per_page` is taken from `params[:per_page]`, converted to integer and clamped to 1..100 (default 20).
      # - `page` is taken from `params[:page]`, converted to integer and floored at 1 (default 1).
      #
      # Filtering and sorting are applied via `filtered_tickets` (accepts `:q`, `:status`, `:sort`, `:order`).
      # @param [Hash] params - Request parameters (supports `:per_page`, `:page`, `:q`, `:status`).
      #   Also supports `:sort` and `:order`.
      def index
        filtered_tickets_relation = filtered_tickets

        total = filtered_tickets_relation.unscope(:includes).except(:offset, :limit).count
        per_page = params.fetch(:per_page, 20).to_i.clamp(1, 100)
        page = [params.fetch(:page, 1).to_i, 1].max

        tickets = filtered_tickets_relation.offset((page - 1) * per_page).limit(per_page)

        render json: {
          data: tickets.as_json(include: {
                                  event: { only: %i[id title location start_date end_date] },
                                  event_feedback: { only: %i[id rating comment] }
                                }),
          meta: { page: page, per_page: per_page, total: total }
        }, status: :ok
      end

      ##
      # Render the @ticket as JSON including its associated event and event_feedback.
      #
      # The JSON includes ticket details with nested event and event_feedback data.
      # Responds with HTTP status :ok.
      def show
        render json: @ticket.as_json(
          include: { event: { only: %i[id title location start_date end_date] },
                     event_feedback: { only: %i[id rating comment] } }
        ), status: :ok
      end

      ##
      # Create a new Ticket for the current user for the specified event.
      # The qr_code is automatically generated via before_validation callback in Ticket model.
      # The is_active defaults to true in the model.
      # On success, renders the created ticket as JSON with HTTP status :created.
      # On failure, renders the validation errors as JSON with HTTP status :unprocessable_content.
      def create
        @ticket = @current_user.tickets.build(ticket_params)

        if @ticket.save
          render json: @ticket.as_json(
            include: { event: { only: %i[id title location start_date end_date] },
                       event_feedback: { only: %i[id rating comment] } }
          ), status: :created
        else
          render json: { errors: @ticket.errors.messages }, status: :unprocessable_content
        end
      rescue ActiveRecord::RecordNotUnique
        render json: { errors: { base: ['User is already registered for this event'] } },
               status: :unprocessable_content
      end

      ##
      # Updates a ticket (e.g., is_active status).
      # Renders the updated ticket with HTTP status :ok on success.
      # Renders validation errors with HTTP status :unprocessable_content on failure.
      def update
        if @ticket.update(ticket_update_params)
          render json: @ticket.as_json(
            include: { event: { only: %i[id title location start_date end_date] },
                       event_feedback: { only: %i[id rating comment] } }
          ), status: :ok
        else
          render json: { errors: @ticket.errors.messages }, status: :unprocessable_content
        end
      end

      ##
      # Updates or creates the event feedback for a ticket and renders the result as JSON.
      #
      # Finds the ticket identified by `params[:id]`, retrieves or builds its associated `event_feedback`,
      # attempts to update that feedback using `review_params`, and renders the updated feedback with
      # HTTP status `:ok` on success or a JSON object containing `errors` with HTTP status
      # `:unprocessable_content` on failure.
      def review
        feedback = @ticket.event_feedback || @ticket.build_event_feedback

        if feedback.update(review_params)
          render json: feedback, status: :ok
        else
          render json: { errors: feedback.errors.messages }, status: :unprocessable_content
        end
      end

      private

      ##
      # Loads the ticket identified by params[:id] into `@ticket`, scoped to the current user.
      # Eager-loads its `event` and `event_feedback` associations.
      # If no matching record is found, renders JSON `{ error: 'Ticket not found' }` with HTTP status `:not_found`.
      def set_ticket
        @ticket = @current_user.tickets.includes(:event, :event_feedback).find_by(id: params[:id])
        render(json: { error: 'Ticket not found' }, status: :not_found) and return unless @ticket
      end

      ##
      # Permit and extract the required `ticket` parameter with allowed attributes.
      # @return [ActionController::Parameters] The permitted `ticket` parameters including:
      #   :event_id
      def ticket_params
        params.require(:ticket).permit(:event_id)
      end

      ##
      # Permit and extract the `ticket` parameter for update (e.g., is_active).
      # @return [ActionController::Parameters] The permitted parameters including:
      #   :is_active
      def ticket_update_params
        params.require(:ticket).permit(:is_active)
      end

      ##
      # Permit and extract the `ticket` parameter for review feedback update.
      # @return [ActionController::Parameters] The permitted parameters including:
      #   :rating, :comment
      def review_params
        params.require(:ticket).permit(:rating, :comment)
      end

      ##
      # Builds a Ticket relation for the current user,
      # filtered by optional search query and is_active status, and
      # sorted per request parameters.
      # @return [ActiveRecord::Relation] Relation of matching Ticket records
      #   with associated event and event_feedback eager-loaded.
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
        # Take only required parameters and discard empty ones
        params.permit(:is_active, :event_id).to_h.compact_blank
      end
    end
  end
end
