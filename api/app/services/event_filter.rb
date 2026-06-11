# frozen_string_literal: true

class EventFilter
  def initialize(params, current_user)
    @params = params
    @current_user = current_user
  end

  def call
    events = base_events
    events = events.where(exact_match_params) if exact_match_params.any?
    filter_by_category(events)
  end

  private

  def base_events
    scope = Event.includes(:brand, :categories).merge(accessible_events)
    apply_filters(scope)
  end

  def accessible_events
    if @current_user&.is_superadmin?
      Event.all
    elsif @current_user
      managed_brand_ids = BrandMembership
                          .where(user_id: @current_user.id, role: %w[owner manager])
                          .select(:brand_id)
      Event.where(brand_id: managed_brand_ids)
           .or(Event.where(status: %i[published cancelled]))
    else
      Event.where(status: %i[published cancelled])
    end
  end

  def apply_filters(scope)
    scope
      .from_date(@params[:from])
      .to_date(@params[:to])
      .search_title(@params[:q])
      .sorted_by(@params[:sort], @params[:order])
  end

  def exact_match_params
    @params.slice(:brand_id, :status).to_h.compact_blank
  end

  def filter_by_category(events)
    return events if @params[:category_id].blank?

    events.joins(:categories).where(categories: { id: @params[:category_id] })
  end
end
