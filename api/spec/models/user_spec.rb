# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe User, type: :model do
  it 'is valid with valid attributes' do
    user = build(:user)
    expect(user).to be_valid
  end

  describe 'generates_token_for :brand_invitation' do
    it 'generates and finds user by brand invitation token' do
      user = create(:user)
      token = user.generate_token_for(:brand_invitation)

      expect(User.find_by_token_for(:brand_invitation, token)).to eq(user)
    end
  end
end
