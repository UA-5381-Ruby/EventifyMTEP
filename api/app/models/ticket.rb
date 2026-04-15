# frozen_string_literal: true

class Ticket < ApplicationRecord
  belongs_to :user
  belongs_to :event

  validates :rating, numericality: { in: 1..5, allow_nil: true }
  validates :is_active, inclusion: { in: [true, false] }

  # If qr_code should be unique per ticket
  validates :qr_code, uniqueness: true, allow_nil: true
end
