# frozen_string_literal: true

FactoryBot.define do
  factory :brand do
    name { Faker::Company.name }
    subdomain { Faker::Internet.unique.domain_word }
    description { Faker::Company.catch_phrase }
    primary_color { '#000000' }
    secondary_color { '#FFFFFF' }
  end
end
