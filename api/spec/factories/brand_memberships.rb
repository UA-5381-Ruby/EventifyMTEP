# frozen_string_literal: true

FactoryBot.define do
  factory :brand_membership do
    association :user
    association :brand
    role { 'owner' }
  end
end
