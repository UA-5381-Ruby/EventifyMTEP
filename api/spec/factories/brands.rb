# frozen_string_literal: true

FactoryBot.define do
  factory :brand do
    name { Faker::Company.name }
    description { Faker::Company.catch_phrase }
  end
end
