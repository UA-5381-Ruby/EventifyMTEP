# frozen_string_literal: true

class EventPolicy < ApplicationPolicy
  def show?
    true
  end

  def create?
    user.is_superadmin
  end

  def update?
    create? && !record.cancelled?
  end

  def destroy?
    create? && record.draft?
  end

  class Scope < Scope
    def resolve
      # if user.is_superadmin
      # end
      scope.all
    end
  end
end
