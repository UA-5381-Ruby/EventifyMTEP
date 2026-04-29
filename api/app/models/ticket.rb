# frozen_string_literal: true

class Ticket < ApplicationRecord
  belongs_to :user
  belongs_to :event
  has_one :event_feedback, dependent: :destroy

  validates :user_id, :event_id, presence: true
  validates :qr_code, presence: true, uniqueness: true
  validate :user_can_have_only_one_ticket_per_event

  before_validation :generate_qr_code, on: :create

  scope :search_by_event, lambda { |query|
    return all if query.blank?

    joins(:event).where('events.title ILIKE ?', "%#{query}%")
  }

  scope :sorted_by, lambda { |sort_field, order|
    sort_field = 'created_at' if sort_field.blank?
    order_direction = order&.downcase == 'asc' ? 'ASC' : 'DESC'
    order("tickets.#{sort_field} #{order_direction}")
  }

  private

  def generate_qr_code
    self.qr_code ||= SecureRandom.uuid
  end

  def user_can_have_only_one_ticket_per_event
    return if user.blank? || event.blank?

    return unless Ticket.where(user_id: user.id, event_id: event.id).where.not(id: id).exists?

    errors.add(:base, 'User is already registered for this event')
  end
end
