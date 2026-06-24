# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Invitations', type: :request do
  let(:owner) { create(:user) }
  let(:brand) { create(:brand) }
  let!(:membership) { create(:brand_membership, user: owner, brand: brand, role: 'owner') }
  let(:headers) { auth_headers(owner) }

  describe 'POST /api/v1/brands/:brand_id/invitations' do
    it 'sends invitation email for valid payload' do
      allow(MailerService).to receive(:send_brand_invitation).and_return('token')

      post "/api/v1/brands/#{brand.id}/invitations",
           params: { email: 'guest@example.com', role: 'member' },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(MailerService).to have_received(:send_brand_invitation).with('guest@example.com', brand, 'member')
    end

    it 'returns 404 for unknown brand' do
      post '/api/v1/brands/999999/invitations',
           params: { email: 'guest@example.com', role: 'member' },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:not_found)
    end

    it 'returns 401 when unauthenticated' do
      post "/api/v1/brands/#{brand.id}/invitations",
           params: { email: 'guest@example.com', role: 'member' },
           as: :json

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/brands/:brand_id/invitations/accept' do
    let(:invitee) { create(:user, email: 'invitee@example.com') }
    let(:token) do
      InvitationTokenService.encode(email: invitee.email, brand_id: brand.id, role: 'member')
    end

    it 'accepts invitation and creates membership' do
      post "/api/v1/brands/#{brand.id}/invitations/accept",
           params: { token: token },
           as: :json

      expect(response).to have_http_status(:ok)
      expect(BrandMembership.exists?(user: invitee, brand: brand)).to be(true)
    end

    it 'returns error for invalid token' do
      post "/api/v1/brands/#{brand.id}/invitations/accept",
           params: { token: 'invalid' },
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
