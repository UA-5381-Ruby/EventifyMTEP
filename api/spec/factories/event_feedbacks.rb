# frozen_string_literal: true

FactoryBot.define do
  factory :event_feedback do
    ticket
    rating { 5 }
    comment { 'Great event!' }
  end
end
