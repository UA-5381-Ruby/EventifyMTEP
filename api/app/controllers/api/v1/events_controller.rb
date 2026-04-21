# frozen_string_literal: true

module Api
  module V1
    class EventsController < ApplicationController
      before_action :set_event, only: [:show]

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

      def show
        render json: @event.as_json(
          include: { brand: { only: %i[id name] },
                     categories: { only: %i[id name] } }
        ), status: :ok
      end

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

      def set_event
        @event = Event.includes(:brand, :categories).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render(json: { error: 'Event not found' }, status: :not_found) and return
      end

      def event_params
        params.require(:event).permit(
          :title, :description, :location, :start_date,
          :end_date, :status, :brand_id, :category_id
        )
      end

      def filtered_events
        events = base_events
        events = events.where(exact_match_params) if exact_match_params.any?
        filter_by_category(events)
      end

      def base_events
        Event.includes(:brand, :categories)
             .from_date(params[:from])
             .to_date(params[:to])
             .search_title(params[:q])
             .sorted_by(params[:sort], params[:order])
      end

      def exact_match_params
        # Беремо тільки потрібні параметри і відкидаємо порожні
        params.permit(:brand_id, :status).to_h.compact_blank
      end

      def filter_by_category(events)
        return events if params[:category_id].blank?

        event.joins(:categories).where(categories: { id: params[:category_id] })
      end
    end
  end
end
