# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationPolicy, type: :policy do
  let(:user) { create(:user) }
  let(:record) { create(:brand) }

  it 'denies default CRUD actions' do
    policy = described_class.new(user, record)

    expect(policy.index?).to be(false)
    expect(policy.show?).to be(false)
    expect(policy.create?).to be(false)
    expect(policy.new?).to be(false)
    expect(policy.update?).to be(false)
    expect(policy.edit?).to be(false)
    expect(policy.destroy?).to be(false)
  end

  describe 'Scope' do
    it 'requires subclasses to implement resolve' do
      scope = described_class::Scope.new(user, Brand.all)

      expect { scope.resolve }.to raise_error(NoMethodError, /resolve/)
    end
  end
end
