# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BrandMembership, type: :model do
  let(:brand) { create(:brand) }
  let(:owner_user) { create(:user) }
  let(:other_user) { create(:user) }

  describe 'validations' do
    subject { build(:brand_membership, brand: brand, user: owner_user) }

    it { is_expected.to validate_presence_of(:role) }
    it { is_expected.to validate_inclusion_of(:role).in_array(%w[owner manager member]) }
    it { is_expected.to validate_uniqueness_of(:user_id).scoped_to(:brand_id) }
  end

  describe '#ensure_at_least_one_owner_on_update' do
    context 'when it is the last owner and the role is changed away from owner' do
      let!(:membership) { create(:brand_membership, brand: brand, user: owner_user, role: 'owner') }

      it 'adds a base error and blocks the update' do
        membership.role = 'manager'

        expect(membership.save).to be false
        expect(membership.errors.details[:base]).to include(
          a_hash_including(error: :cannot_remove_last_owner)
        )
        expect(membership.reload.role).to eq('owner')
      end
    end

    context 'when there are multiple owners' do
      let!(:membership) { create(:brand_membership, brand: brand, user: owner_user, role: 'owner') }
      let!(:second_owner) { create(:brand_membership, brand: brand, user: other_user, role: 'owner') }

      it 'allows downgrading one of the owners' do
        membership.role = 'manager'

        expect(membership.save).to be true
        expect(membership.reload.role).to eq('manager')
      end
    end

    context 'when the role is changed but not away from owner' do
      let!(:membership) { create(:brand_membership, brand: brand, user: owner_user, role: 'member') }

      it 'does not run the owner check' do
        membership.role = 'manager'

        expect(membership.save).to be true
      end
    end
  end

  describe '#ensure_at_least_one_owner_on_destroy' do
    context 'when it is the last owner and destroyed directly' do
      let!(:membership) { create(:brand_membership, brand: brand, user: owner_user, role: 'owner') }

      it 'aborts the destroy and adds a base error' do
        result = membership.destroy

        expect(result).to be false
        expect(membership.errors.details[:base]).to include(
          a_hash_including(error: :cannot_remove_last_owner)
        )
        expect(BrandMembership.exists?(membership.id)).to be true
      end
    end

    context 'when there are multiple owners' do
      let!(:membership) { create(:brand_membership, brand: brand, user: owner_user, role: 'owner') }
      let!(:second_owner) { create(:brand_membership, brand: brand, user: other_user, role: 'owner') }

      it 'allows destroying one of the owners' do
        expect(membership.destroy).to be_truthy
      end
    end

    context 'when destroyed as part of the owning brand being destroyed' do
      let!(:membership) { create(:brand_membership, brand: brand, user: owner_user, role: 'owner') }

      it 'skips the owner check via destroyed_by_association' do
        expect { brand.destroy }.to change(BrandMembership, :count).by(-1)
      end
    end

    context 'for a non-owner membership' do
      let!(:owner_membership) { create(:brand_membership, brand: brand, user: owner_user, role: 'owner') }
      let!(:member_membership) { create(:brand_membership, brand: brand, user: other_user, role: 'member') }

      it 'destroys without running the owner check' do
        expect(member_membership.destroy).to be_truthy
      end
    end
  end
end
