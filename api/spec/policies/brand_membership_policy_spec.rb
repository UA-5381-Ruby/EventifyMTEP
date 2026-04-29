# frozen_string_literal: true

# spec/policies/brand_membership_policy_spec.rb
require 'swagger_helper'

RSpec.describe BrandMembershipPolicy, type: :policy do
  let(:brand) { create(:brand) }
  let(:owner) { create(:user) }
  let(:manager) { create(:user) }
  let(:regular_user) { create(:user) }
  let(:new_user) { create(:user) }
  let(:superadmin) { create(:user, is_superadmin: true) } # адаптуйте під вашу фабрику суперадміна
  let(:member) { create(:user) }
  let(:non_member) { create(:user) }

  before do
    # Додаємо member до бренду
    create(:brand_membership, brand: brand, user: member, role: 'user')
  end

  # --- Тести для show_brand_memberships? ---

  it 'denies show_brand_memberships? when user is nil' do
    policy = BrandPolicy.new(nil, brand)
    expect(policy.show_brand_memberships?).to be_falsey
  end

  it 'permits show_brand_memberships? when user is a superadmin' do
    policy = BrandPolicy.new(superadmin, brand)
    expect(policy.show_brand_memberships?).to be_truthy
  end

  it 'permits show_brand_memberships? when user is a member of the brand' do
    policy = BrandPolicy.new(member, brand)
    expect(policy.show_brand_memberships?).to be_truthy
  end

  it 'denies show_brand_memberships? when user is neither a superadmin nor a member' do
    policy = BrandPolicy.new(non_member, brand)
    expect(policy.show_brand_memberships?).to be_falsey
  end

  before do
    create(:brand_membership, brand: brand, user: owner, role: 'owner')
    create(:brand_membership, brand: brand, user: manager, role: 'manager')
    create(:brand_membership, brand: brand, user: regular_user, role: 'user')
  end

  describe '#create?' do
    context 'when current user is a manager' do
      it "permits inviting users with 'user' role" do
        new_brand_membership = build(:brand_membership, brand: brand, user: new_user, role: 'user')
        expect(BrandMembershipPolicy.new(manager, new_brand_membership)).to permit_action(:create)
      end

      it "does not permit inviting users as 'owner'" do
        new_brand_membership = build(:brand_membership, brand: brand, user: new_user, role: 'owner')
        expect(BrandMembershipPolicy.new(manager, new_brand_membership)).not_to permit_action(:create)
      end
    end

    context 'when current user is an owner' do
      it "permits inviting users with 'owner' role" do
        new_brand_membership = build(:brand_membership, brand: brand, user: new_user, role: 'owner')
        expect(BrandMembershipPolicy.new(owner, new_brand_membership)).to permit_action(:create)
      end

      it "permits inviting users with 'user' role" do
        new_brand_membership = build(:brand_membership, brand: brand, user: new_user, role: 'user')
        expect(BrandMembershipPolicy.new(owner, new_brand_membership)).to permit_action(:create)
      end
    end

    context 'when current user is a regular user' do
      it 'does not permit inviting anyone' do
        new_brand_membership = build(:brand_membership, brand: brand, user: new_user, role: 'user')
        expect(BrandMembershipPolicy.new(regular_user, new_brand_membership)).not_to permit_action(:create)
      end
    end
  end

  describe '#update?' do
    context 'when current user is a manager' do
      it "permits updating a 'user' role" do
        membership = create(:brand_membership, brand: brand, user: new_user, role: 'user')
        expect(BrandMembershipPolicy.new(manager, membership)).to permit_action(:update)
      end

      it "does not permit updating someone to 'owner' role" do
        membership = create(:brand_membership, brand: brand, user: new_user, role: 'user')
        membership.role = 'owner'
        expect(BrandMembershipPolicy.new(manager, membership)).not_to permit_action(:update)
      end
    end

    context 'when current user is an owner' do
      it 'permits updating any role' do
        membership = create(:brand_membership, brand: brand, user: new_user, role: 'user')
        membership.role = 'owner'
        expect(BrandMembershipPolicy.new(owner, membership)).to permit_action(:update)
      end
    end
  end

  describe '#destroy?' do
    context 'when current user is a manager' do
      it "permits destroying a 'user' membership" do
        membership = create(:brand_membership, brand: brand, user: new_user, role: 'user')
        expect(BrandMembershipPolicy.new(manager, membership)).to permit_action(:destroy)
      end

      it "does not permit destroying an 'owner' membership" do
        membership = create(:brand_membership, brand: brand, user: new_user, role: 'owner')
        expect(BrandMembershipPolicy.new(manager, membership)).not_to permit_action(:destroy)
      end

      it "does not permit destroying a 'manager' membership" do
        another_manager = create(:user)
        membership = create(:brand_membership, brand: brand, user: another_manager, role: 'manager')
        expect(BrandMembershipPolicy.new(manager, membership)).not_to permit_action(:destroy)
      end
    end

    context 'when current user is an owner' do
      it 'permits destroying any membership' do
        membership = create(:brand_membership, brand: brand, user: new_user, role: 'manager')
        expect(BrandMembershipPolicy.new(owner, membership)).to permit_action(:destroy)
      end
    end

    context 'when current user is a regular user' do
      it 'does not permit destroying any membership' do
        membership = create(:brand_membership, brand: brand, user: new_user, role: 'user')
        expect(BrandMembershipPolicy.new(regular_user, membership)).not_to permit_action(:destroy)
      end
    end
  end
end
