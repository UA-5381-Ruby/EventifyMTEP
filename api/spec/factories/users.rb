# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    name { Faker::Name.name }
    sequence(:email) { |n| "user#{n}@example.com" }
    password { 'SecurePassword123!' }
    is_superadmin { false }
    is_confirmed { false }

    trait :confirmed do
      is_confirmed { true }
    end
  end
end
