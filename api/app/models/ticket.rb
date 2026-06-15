# frozen_string_literal: true

class Ticket < ApplicationRecord
  belongs_to :user
  belongs_to :event
  has_one :event_feedback, dependent: :destroy

  validates :user_id, :event_id, presence: true
  validates :qr_code, presence: true, uniqueness: true

  before_validation :generate_qr_code, on: :create

  scope :search_by_event, lambda { |query|
    return all if query.blank?

    joins(:event).where('events.title ILIKE ?', "%#{query}%")
  }

  scope :sorted_by, lambda { |sort_field, order|
    allowed_fields = {
      'created_at' => :created_at,
      'updated_at' => :updated_at,
      'is_active' => :is_active
    }
    field = allowed_fields.fetch(sort_field.to_s, :created_at)
    direction = order&.downcase == 'asc' ? :asc : :desc
    order(field => direction)
  }

  private

  def generate_qr_code
    self.qr_code ||= SecureRandom.uuid
  end
end
