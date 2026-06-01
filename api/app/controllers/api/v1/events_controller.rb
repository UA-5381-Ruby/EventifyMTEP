# frozen_string_literal: true

module Api
  module V1
    class EventsController < ApplicationController
      include Paginatable

      before_action :set_event, only: [:show]

      def index
        paginated = paginate(filtered_events)

        render json: {
          data: paginated[:records],
          meta: paginated[:meta]
        }
      end

      def show
        render json: @event.as_json(include: event_serialization_includes), status: :ok
      end

      def create
        @event = build_event
        if @event.save
          render json: @event, status: :created
        else
          render json: { errors: @event.errors }, status: :unprocessable_content
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Brand not found or access denied' }, status: :forbidden
      end

      private

      def build_event
        brand = current_user.brands.find(event_params[:brand_id])
        event = Event.new(event_params.except(:category_ids).merge(brand: brand, status: 'draft'))
        event.category_ids = event_params[:category_ids] if event_params[:category_ids].present?
        event
      end

      def set_event
        @event = Event.includes(:brand, :categories)
                      .where(brand: current_user.brands)
                      .find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Event not found' }, status: :not_found
      end

      def event_serialization_includes
        {
          brand: { only: %i[id name] },
          categories: { only: %i[id name] }
        }
      end

      def event_params
        params.expect(event: [
                        :title, :description, :location, :start_date,
                        :end_date, :status, :brand_id, { category_ids: [] }
                      ])
      end

      def filtered_events
        events = base_events
        events = events.where(exact_match_params) if exact_match_params.any?
        filter_by_category(events)
      end

      def base_events
        scope = Event.includes(:brand, :categories)
                     .where(brand: current_user.brands)
        apply_filters(scope)
      end

      def apply_filters(scope)
        scope
          .from_date(index_params[:from])
          .to_date(index_params[:to])
          .search_title(index_params[:q])
          .sorted_by(index_params[:sort], index_params[:order])
      end

      def exact_match_params
        index_params.slice(:brand_id, :status).to_h.compact_blank
      end

      def filter_by_category(events)
        return events if index_params[:category_id].blank?

        events.joins(:categories).where(categories: { id: index_params[:category_id] })
      end

      def index_params
        @index_params ||= params.permit(:from, :to, :q, :sort, :order, :page, :per_page, :status, :brand_id,
                                        :category_id)
      end
    end
  end
end
