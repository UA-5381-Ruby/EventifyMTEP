# frozen_string_literal: true

FactoryBot.define do
  factory :event do
    title { 'Test Event' }
    description { 'Description' }
    start_date { 1.week.from_now }
    end_date   { 1.week.from_now + 2.hours }
    location   { 'Kyiv, Ukraine' }
    status     { :draft }
    association :brand

    after(:build) do |event|
      # This ensures we only attach a default category if the test
      # didn't already provide one explicitly (like in your controller specs)
      event.categories << build(:category) if event.categories.empty?
    end
  end
end
