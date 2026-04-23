FactoryBot.define do
  factory :brand_membership do
    brand
    user
    role { "user" } # default role
  end
end