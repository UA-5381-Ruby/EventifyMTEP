# frozen_string_literal: true

class BrandMembership < ApplicationRecord
  belongs_to :user
  belongs_to :brand
  validate :ensure_at_least_one_owner_on_update, on: :update
  before_destroy :ensure_at_least_one_owner_on_destroy
  validates :role, presence: true, inclusion: { in: %w[owner manager user] }
  validates :user_id, uniqueness: { scope: :brand_id }

  private

  def ensure_at_least_one_owner_on_update
    return unless will_save_change_to_role?(from: 'owner')
    return unless brand.brand_memberships.where(role: 'owner').count <= 1

    errors.add(:base, 'Cannot remove the last owner of a brand')
  end

  def ensure_at_least_one_owner_on_destroy
    return unless role == 'owner'
    return unless brand.brand_memberships.where(role: 'owner').count <= 1

    errors.add(:base, 'Cannot remove the last owner of a brand')
    throw(:abort)
  end
end
