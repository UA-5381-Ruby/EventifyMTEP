# frozen_string_literal: true

class Ticket < ApplicationRecord
  belongs_to :user
  belongs_to :event
  has_one :event_feedback, dependent: :destroy

  validates :qr_code, presence: true, uniqueness: true
  validates :user_id, uniqueness: { scope: :event_id }

  before_validation :generate_qr_code, on: :create

  private

  def generate_qr_code
    self.qr_code ||= SecureRandom.uuid
  end
end
