# frozen_string_literal: true

require 'swagger_helper'

RSpec.context BrandMembershipPolicy do
  let(:superadmin) { instance_double('User', is_superadmin?: true) }
  let(:regular_user) { instance_double('User', is_superadmin?: false) }

  let(:brand_memberships_relation) { double('BrandMemberships') }
  let(:brand) { double('Brand', brand_memberships: brand_memberships_relation) }
  let(:record) { double('Record', brand: brand) }

  it 'denies index? if user is nil' do
    policy = described_class.new(nil, record)
    expect(policy.index?).to be_falsey
  end

  it 'permits index? for superadmin' do
    policy = described_class.new(superadmin, record)
    expect(policy.index?).to be_truthy
  end

  it 'permits index? if current user role is owner' do
    policy = described_class.new(regular_user, record)
    allow(policy).to receive(:current_user_role).and_return('owner')

    expect(policy.index?).to be_truthy
  end

  it 'permits index? if current user role is manager' do
    policy = described_class.new(regular_user, record)
    allow(policy).to receive(:current_user_role).and_return('manager')

    expect(policy.index?).to be_truthy
  end

  it 'denies index? if current user role is neither owner nor manager' do
    policy = described_class.new(regular_user, record)
    allow(policy).to receive(:current_user_role).and_return('member')

    expect(policy.index?).to be_falsey
  end

  it 'denies create? if user is nil' do
    policy = described_class.new(nil, record)
    expect(policy.create?).to be_falsey
  end

  it 'permits show? for superadmin' do
    policy = described_class.new(superadmin, record)
    expect(policy.show?).to be_truthy
  end

  it 'permits show? if user is brand owner' do
    policy = described_class.new(regular_user, record)
    allow(brand_memberships_relation).to receive(:exists?)
      .with(user: regular_user, role: 'owner')
      .and_return(true)

    expect(policy.show?).to be_truthy
  end

  it 'denies show? if user is neither superadmin nor brand owner' do
    policy = described_class.new(regular_user, record)
    allow(brand_memberships_relation).to receive(:exists?)
      .with(user: regular_user, role: 'owner')
      .and_return(false)

    expect(policy.show?).to be_falsey
  end
end
