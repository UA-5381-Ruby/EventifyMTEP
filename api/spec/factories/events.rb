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

    after(:create) do |event, evaluator|
      if evaluator.categories.any?
        evaluator.categories.each do |category|
          EventCategory.find_or_create_by!(event: event, category: category)
        end
      end
    end
  end
end
