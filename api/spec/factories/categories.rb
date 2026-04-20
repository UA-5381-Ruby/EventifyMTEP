# frozen_string_literal: true

FactoryBot.define do
  factory :category do
    name { Faker::Commerce.department } # Например: "Electronics" или "Books"
  end
end
