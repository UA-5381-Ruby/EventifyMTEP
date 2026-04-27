# frozen_string_literal: true

class BrandMembership < ApplicationRecord
  belongs_to :user
  belongs_to :brand
  validate :ensure_at_least_one_owner, on: %i[update destroy]
  validates :role, presence: true, inclusion: { in: %w[owner manager user] }
  validates :user_id, uniqueness: { scope: :brand_id }

  private

  def ensure_at_least_one_owner
    # If we are trying to change an owner's role or delete them
    return unless role_changed?(from: 'owner') || destroyed?
    return unless brand.brand_memberships.where(role: 'owner').count <= 1

    errors.add(:base, 'Cannot remove the last owner of a brand')
    throw(:abort) if destroyed? # Necessary for before_destroy
  end
end
