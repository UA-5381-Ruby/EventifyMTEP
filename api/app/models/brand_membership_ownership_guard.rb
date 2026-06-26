# frozen_string_literal: true

class BrandMembershipOwnershipGuard
  def initialize(membership)
    @membership = membership
  end

  def downgrade_blocked?(new_role)
    currently_owner? && new_role.to_s != 'owner' && last_owner?
  end

  def removal_blocked?
    currently_owner? && last_owner?
  end

  private

  attr_reader :membership

  def currently_owner?
    membership.role.to_s == 'owner'
  end

  def last_owner?
    membership.brand.brand_memberships.where(role: 'owner').count <= 1
  end
end
