# frozen_string_literal: true

class EventPolicy < ApplicationPolicy
  def show?
    true
  end

  def create?
    user&.is_superadmin
  end

  def update?
    create? && !record.cancelled?
  end

  def destroy?
    create? && record.draft?
  end

  def submit?
    return true if user&.is_superadmin

    user&.brand_memberships&.exists?(
      brand_id: record.brand_id,
      role: %w[owner manager]
    )
  end

  def cancel?
    submit?
  end

  def approve?
    user&.is_superadmin
  end

  def reject?
    approve?
  end

  def manage_categories?
    return true if user&.is_superadmin

    user&.brand_memberships&.exists?(
      brand_id: record.brand_id,
      role: %w[owner manager]
    )
  end

  class Scope < Scope
    def resolve
      # if user.is_superadmin
      # end
      scope.all
    end
  end
end
