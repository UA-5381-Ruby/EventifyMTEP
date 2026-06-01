# frozen_string_literal: true

module Paginatable
  extend ActiveSupport::Concern

  private

  def paginate(scope)
    per_page = extract_per_page
    page = extract_page
    total = scope.count
    total_pages = calculate_total_pages(total, per_page)
    records = scope.offset((page - 1) * per_page).limit(per_page)

    {
      records: records,
      meta: {
        current_page: page,
        per_page: per_page,
        total_count: total,
        total_pages: total_pages
      }
    }
  end

  def extract_per_page
    pagination_params.fetch(:per_page, 20).to_i.clamp(1, 100)
  end

  def extract_page
    [pagination_params.fetch(:page, 1).to_i, 1].max
  end

  def calculate_total_pages(total, per_page)
    (total.to_f / per_page).ceil
  end

  def pagination_params
    @pagination_params ||= params.to_unsafe_h.with_indifferent_access
  end
end
