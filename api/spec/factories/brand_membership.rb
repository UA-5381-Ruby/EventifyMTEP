# frozen_string_literal: true

FactoryBot.define do
  factory :brand_membership do
    brand
    user
    role { 'user' } # default role
  end
end
