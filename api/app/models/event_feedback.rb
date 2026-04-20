# frozen_string_literal: true

class EventFeedback < ApplicationRecord
  belongs_to :ticket

  validates :rating, numericality: { greater_than_or_equal_to: 1, less_than_or_equal_to: 5 }, allow_nil: true
end
