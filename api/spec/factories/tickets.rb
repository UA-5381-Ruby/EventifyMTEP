# frozen_string_literal: true

FactoryBot.define do
  factory :ticket do
    association :user
    association :event
    sequence(:qr_code) { |n| "QR-CODE-#{SecureRandom.hex(4)}-#{n}" }
    is_active { true }
  end
end
