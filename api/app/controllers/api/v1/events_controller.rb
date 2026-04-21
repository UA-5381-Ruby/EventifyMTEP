# frozen_string_literal: true

module Api
  module V1
    class EventsController < ApplicationController
      before_action :set_event, only: [:show]

      ##
      # Lists events applying filtering, sorting and pagination,
      # and renders them as JSON including associated brand and categories.
      #
      # The JSON response contains:
      # - `data`: an array of events with `brand` and `categories` included (each with `id` and `name`).
      # - `meta`: an object with `page`, `per_page`, and `total`.
      #
      # Pagination behavior:
      # - `per_page` is taken from `params[:per_page]`, converted to integer and clamped to 1..100 (default 20).
      # - `page` is taken from `params[:page]`, converted to integer and floored at 1 (default 1).
      #
      # Filtering and sorting are applied via `filtered_events` (accepts `:from`, `:to`, `:q`, `:sort`, `:order`).
      # @param [Hash] params - Request parameters (supports `:per_page`, `:page`, `:from`, `:to`, `:q`).
      #   Also supports `:sort` and `:order`.
      def index
        events = filtered_events

        total = events.count
        per_page = params.fetch(:per_page, 20).to_i.clamp(1, 100)
        page = [params.fetch(:page, 1).to_i, 1].max

        events = events.offset((page - 1) * per_page).limit(per_page)

        render json: {
          data: events.as_json(include: {
                                 brand: { only: %i[id name] },
                                 categories: { only: %i[id name] } # 1. Changed to plural
                               }),
          meta: { page: page, per_page: per_page, total: total }
        }, status: :ok
      end

      ##
      # Render the @event as JSON including its associated brand and categories.
      #
      # The JSON includes only `id` and `name` for `brand` and for each `category`.
      # Responds with HTTP status :ok.
      def show
        render json: @event.as_json(
          include: { brand: { only: %i[id name] },
                     categories: { only: %i[id name] } }
        ), status: :ok
      end

      ##
      # Create a new Event from request parameters and persist it.
      # Sets the event's status to 'draft' before saving.
      # On success, renders the created event as JSON with HTTP status :created.
      # On failure, renders the validation errors as JSON with HTTP status :unprocessable_content.
      def create
        @event = Event.new(event_params)

        @event.status = 'draft'

        if @event.save
          render json: @event, status: :created
        else
          render json: { errors: @event.errors }, status: :unprocessable_content
        end
      end

      private

      ##
      # Loads the event identified by params[:id] into `@event`, eager-loading its `brand` and `categories`.
      # If no matching record is found, renders JSON `{ error: 'Event not found' }` with HTTP status `:not_found`.
      def set_event
        @event = Event.includes(:brand, :categories).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Event not found' }, status: :not_found
      end

      ##
      # Permit and extract the required `event` parameter with allowed attributes.
      # @return [ActionController::Parameters] The permitted `event` parameters including:
      #   :title, :description, :location, :start_date, :end_date, :brand_id, and :category_ids (array)
      def event_params
        params.expect(
          event: [
            :title, :description, :location,
            :start_date, :end_date, :brand_id,
            { category_ids: [] }
          ]
        )
      end

      ##
      # Builds an Event relation eager-loading brand and categories,
      # filtered by optional from/to dates and title query, and
      # sorted per request parameters.
      # @return [ActiveRecord::Relation] Relation of matching Event records
      #   with associated brand and categories eager-loaded.
      def filtered_events
        Event.includes(:brand, :categories)
             .from_date(params[:from])
             .to_date(params[:to])
             .search_title(params[:q])
             .sorted_by(params[:sort], params[:order])
      end
    end
  end
end
