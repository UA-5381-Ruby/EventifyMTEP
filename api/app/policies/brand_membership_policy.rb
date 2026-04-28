# frozen_string_literal: true

class BrandMembershipPolicy < ApplicationPolicy
  def index?
    return false unless user
    # Superadmins can do anything
    return true if user.is_superadmin?

    # Owners and Managers can view members of their brands
    %w[owner manager].include?(current_user_role)
  end

  def create?
    return false unless user
    # Superadmins can do anything
    return true if user.is_superadmin?

    # Owners can invite anyone
    return true if current_user_role == 'owner'

    # Managers can invite, but CANNOT invite someone as an owner
    return record.role != 'owner' if current_user_role == 'manager'

    false
  end

  def update?
    # Same rules apply for updating an existing member's role
    create?
  end

  def destroy?
    # Superadmins and Owners can remove anyone
    return true if user.is_superadmin? || current_user_role == 'owner'

    # Managers can remove 'users', but cannot remove 'owners' or other 'managers'
    return record.role == 'user' if current_user_role == 'manager'

    false
  end

  def show?
    user.is_superadmin? || record.brand_memberships.exists?(user: user, role: 'owner')
  end

  private

  def current_user_role
    @current_user_role ||= record.brand.brand_memberships.find_by(user_id: user.id)&.role
  end
end
