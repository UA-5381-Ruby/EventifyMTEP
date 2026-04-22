# frozen_string_literal: true

class UserPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
  end

  def update?
    user.id == record.id || user.is_superadmin?
  end

  def destroy?
    user.id == record.id || user.is_superadmin?
  end
end
