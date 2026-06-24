# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InvitationAcceptanceService do
  let(:brand) { create(:brand) }
  let(:user) { create(:user, email: 'invited@example.com') }

  def service_for(email:, role: 'member', brand_id: brand.id)
    token = InvitationTokenService.encode(email: email, brand_id: brand_id, role: role)
    described_class.new(token: token, brand: brand)
  end

  describe '#call' do
    it 'creates membership for valid token' do
      result = service_for(email: user.email).call

      expect(result.success?).to be(true)
      expect(BrandMembership.exists?(user: user, brand: brand, role: 'member')).to be(true)
    end

    it 'returns error for invalid token' do
      result = described_class.new(token: 'bad-token', brand: brand).call

      expect(result.success?).to be(false)
      expect(result.status).to eq(:unprocessable_content)
    end

    it 'returns error when brand does not match token' do
      other_brand = create(:brand)
      result = service_for(email: user.email, brand_id: other_brand.id).call

      expect(result.success?).to be(false)
      expect(result.status).to eq(:unprocessable_content)
    end

    it 'returns not_found when user does not exist' do
      result = service_for(email: 'missing@example.com').call

      expect(result.success?).to be(false)
      expect(result.status).to eq(:not_found)
    end

    it 'returns conflict when user is already a member' do
      create(:brand_membership, user: user, brand: brand, role: 'member')

      result = service_for(email: user.email).call

      expect(result.success?).to be(false)
      expect(result.status).to eq(:conflict)
    end

    it 'returns conflict on duplicate membership race' do
      allow_any_instance_of(BrandMembership).to receive(:save).and_raise(ActiveRecord::RecordNotUnique)

      result = service_for(email: user.email).call

      expect(result.success?).to be(false)
      expect(result.status).to eq(:conflict)
    end

    it 'returns validation error when membership save fails' do
      errors = instance_double(ActiveModel::Errors, full_messages: ['invalid'])
      membership = instance_double(BrandMembership, save: false, errors: errors)
      allow(BrandMembership).to receive(:new).and_return(membership)

      result = service_for(email: user.email).call

      expect(result.success?).to be(false)
      expect(result.status).to eq(:unprocessable_entity)
    end
  end
end
