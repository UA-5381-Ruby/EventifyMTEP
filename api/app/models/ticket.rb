# frozen_string_literal: true

class Ticket < ApplicationRecord
  belongs_to :user
  belongs_to :event
  has_one :event_feedback, dependent: :destroy

  validates :qr_code, presence: true, uniqueness: true
end
