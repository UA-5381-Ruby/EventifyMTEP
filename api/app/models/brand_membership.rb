# frozen_string_literal: true

class BrandMembership < ApplicationRecord
  belongs_to :user
  belongs_to :brand

  validates :role, presence: true, inclusion: { in: %w[owner manager user] }
  validates :user_id, uniqueness: { scope: :brand_id }
end
