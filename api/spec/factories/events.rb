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
    association :category
  end
end
