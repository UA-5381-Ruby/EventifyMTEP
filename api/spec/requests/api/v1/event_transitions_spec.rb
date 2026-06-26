# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Api::V1::Events Transitions', type: :request do
  let!(:superadmin) { create(:user, is_superadmin: true) }
  let!(:owner)      { create(:user, is_superadmin: false) }
  let!(:brand)      { create(:brand) }

  let!(:membership) { create(:brand_membership, user: owner, brand: brand, role: 'owner') }

  def auth_headers(user)
    token = JwtService.encode(user_id: user.id, password_salt: user.password_salt)
    { 'Authorization' => "Bearer #{token}" }
  end

  describe 'POST /api/v1/events/:id/submit' do
    it 'moves draft to draft_on_review (Owner)' do
      event = create(:event, brand: brand, status: 'draft', title: 'Test', location: 'Online',
                             start_date: 1.day.from_now)

      post "/api/v1/events/#{event.id}/submit", headers: auth_headers(owner)

      expect(response).to have_http_status(:ok)
      expect(event.reload.status).to eq('draft_on_review')
    end

    it 'returns 422 if transition invalid' do
      event = create(:event, brand: brand, status: 'cancelled')

      post "/api/v1/events/#{event.id}/submit", headers: auth_headers(owner)

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'POST /api/v1/events/:id/approve' do
    it 'returns 422 when transition is invalid' do
      event = create(:event, brand: brand, status: 'draft')

      post "/api/v1/events/#{event.id}/approve", headers: auth_headers(superadmin)

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'POST /api/v1/events/:id/reject' do
    it 'returns 422 when transition is invalid' do
      event = create(:event, brand: brand, status: 'draft')

      post "/api/v1/events/#{event.id}/reject",
           params: { reason: 'Not valid' },
           headers: auth_headers(superadmin)

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'POST /api/v1/events/:id/submit' do
    it 'returns 404 when event is missing' do
      post '/api/v1/events/999999/submit', headers: auth_headers(owner)

      expect(response).to have_http_status(:not_found)
    end

    it 'returns required fields message when draft is incomplete' do
      event = create(:event, brand: brand, status: 'draft', title: 'Test', location: 'Online',
                             start_date: 1.day.from_now)
      event.update_columns(title: '', location: '', start_date: nil)

      post "/api/v1/events/#{event.id}/submit", headers: auth_headers(owner)

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body['message']).to be_present
    end
  end

  describe 'authorization failures' do
    it 'returns forbidden when non-owner submits' do
      event = create(:event, brand: brand, status: 'draft', title: 'Test', location: 'Online',
                             start_date: 1.day.from_now)
      outsider = create(:user)

      post "/api/v1/events/#{event.id}/submit", headers: auth_headers(outsider)

      expect(response).to have_http_status(:forbidden)
    end

    it 'returns forbidden when owner tries to approve' do
      event = create(:event, brand: brand, status: 'draft_on_review')

      post "/api/v1/events/#{event.id}/approve", headers: auth_headers(owner)

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'POST /api/v1/events/:id/cancel', type: :request do
    it 'cancels event and deactivates tickets (Owner)' do
      event  = create(:event, brand: brand, status: 'published')
      user   = create(:user)
      ticket = create(:ticket, event: event, user: user, is_active: true)

      post "/api/v1/events/#{event.id}/cancel", headers: auth_headers(owner)

      expect(response).to have_http_status(:ok)
      expect(event.reload.status).to eq('cancelled')
      expect(ticket.reload.is_active).to be false
    end
  end
end
