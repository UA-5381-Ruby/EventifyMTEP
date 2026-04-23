class BrandMembershipPolicy < ApplicationPolicy
  def create?
    return false unless user
    # Superadmins can do anything
    return true if user.is_superadmin?
    
    # Owners can invite anyone
    return true if current_user_role == 'owner'
    
    # Managers can invite, but CANNOT invite someone as an owner
    if current_user_role == 'manager'
      return record.role != 'owner'
    end

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
    if current_user_role == 'manager'
      return record.role == 'user'
    end
    false
  end

  private

  def current_user_role
    @current_user_role ||= record.brand.brand_memberships.find_by(user_id: user.id)&.role
  end
end