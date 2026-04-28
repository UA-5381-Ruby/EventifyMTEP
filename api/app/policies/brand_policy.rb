# frozen_string_literal: true

class BrandPolicy < ApplicationPolicy
  def update?
    return false if user.nil?

    user.is_superadmin? || user_has_role?('owner')
  end

  def destroy?
    return false if user.nil?

    user.is_superadmin? || user_has_role?('owner')
  end

  def show_brand_memberships?
    return false if user.nil?

    user.is_superadmin? || record.brand_memberships.exists?(user_id: user.id)
  end

  private

  def user_has_role?(role_name)
    record.brand_memberships.exists?(user_id: user.id, role: role_name)
  end
end
