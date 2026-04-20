# frozen_string_literal: true

class Event < ApplicationRecord
  belongs_to :brand

  has_many :event_categories, dependent: :destroy
  has_many :categories, through: :event_categories
  has_many :tickets, dependent: :destroy

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
  }

  validates :title, presence: true, length: { maximum: 120 }
  validates :location, presence: true, length: { maximum: 200 }
  validates :start_date, presence: true
  validates :status, presence: true

  scope :from_date, ->(date) { where('start_date >= ?', date) if date.present? }
  scope :to_date, ->(date) { where('start_date <= ?', date) if date.present? }

  # Uses ILIKE for case-insensitive search in Postgres
  scope :search_title, ->(query) { where('title ILIKE ?', "%#{query}%") if query.present? }

  scope :sorted_by, ->(column, direction) {
    # Sanitize inputs to prevent SQL injection, defaulting to created_at DESC
    sort_column = column.present? ? column : 'created_at'
    sort_direction = direction.present? ? direction : 'desc'
    order(sort_column => sort_direction)
  }
end
