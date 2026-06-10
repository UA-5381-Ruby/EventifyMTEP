# frozen_string_literal: true

class EventPolicy < ApplicationPolicy
  def show?
    return true if record.published? || record.cancelled?

    user && (user.is_superadmin? || owner_or_manager?)
  end

  def create?
    return false unless user

    user.is_superadmin? || owner_or_manager?
  end

  def update?
    create? && !record.cancelled?
  end

  def destroy?
    create? && record.draft?
  end

  def submit?
    return true if user&.is_superadmin?

    owner_or_manager?
  end

  def cancel?
    submit?
  end

  def approve?
    user&.is_superadmin?
  end

  def reject?
    approve?
  end

  def manage_categories?
    return true if user&.is_superadmin?

    owner_or_manager?
  end

  class Scope < Scope
    def resolve
      if user&.is_superadmin?
        scope.all
      elsif user
        managed_brand_ids = user.brand_memberships
                                .where(role: %w[owner manager])
                                .select(:brand_id)
        scope.where(brand_id: managed_brand_ids)
             .or(scope.where(status: %i[published cancelled]))
      else
        scope.where(status: %i[published cancelled])
      end
    end
  end

  private

  def owner_or_manager?
    user&.brand_memberships&.exists?(
      brand_id: record.brand_id,
      role: %w[owner manager]
    )
  end
end
