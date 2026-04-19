# frozen_string_literal: true

class Event < ApplicationRecord
  belongs_to :brand
  belongs_to :category

  enum :status, {
    draft: 'draft',
    draft_on_review: 'draft_on_review',
    published: 'published',
    rejected: 'rejected',
    published_unverified: 'published_unverified',
    published_on_review: 'published_on_review',
    published_rejected: 'published_rejected',
    archived: 'archived',
    cancelled: 'cancelled'
  }, default: :draft

  validates :title, presence: true, length: { maximum: 120 }
  validates :location, presence: true, length: { maximum: 200 }
  validates :start_date, presence: true
  validates :status, presence: true

  scope :sorted_by, lambda { |field, direction|
    allowed_fields     = %w[start_date title]
    allowed_directions = %w[asc desc]
    field     = allowed_fields.include?(field.to_s) ? field.to_s : 'start_date'
    direction = allowed_directions.include?(direction.to_s) ? direction.to_s : 'asc'
    order("#{field} #{direction}")
  }

  scope :from_date,    ->(from) { from.present? ? where(start_date: from..) : all }
  scope :to_date,      ->(to)   { to.present? ? where(start_date: ..to) : all }
  scope :search_title, ->(q)    { q.present? ? where('title ILIKE ?', "%#{q}%") : all }
end
