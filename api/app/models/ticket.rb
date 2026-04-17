# frozen_string_literal: true

class Ticket < ApplicationRecord
  belongs_to :user
  belongs_to :event

  validates :rating, numericality: {
    only_integer: true,
    greater_than_or_equal_to: 1,
    less_than_or_equal_to: 5
  }, allow_nil: true

  validates :comment, length: { maximum: 1000 }, allow_nil: true
  validates :is_active, inclusion: { in: [true, false] }

  # If qr_code should be unique per ticket
  validates :qr_code, uniqueness: true, allow_nil: true
end
