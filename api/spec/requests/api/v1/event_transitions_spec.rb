# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Api::V1::Events Transitions', type: :request do
  let!(:superadmin) { create(:user, is_superadmin: true) }
  let!(:owner)      { create(:user, is_superadmin: false) }
  let!(:brand)      { create(:brand) }

  # Надаємо власнику права на бренд, щоб Pundit пропускав його
  let!(:membership) { create(:brand_membership, user: owner, brand: brand, role: 'owner') }

  # Хелпер для створення JWT заголовків
  def auth_headers(user)
    token = JwtService.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end

  describe 'POST /api/v1/events/:id/submit' do
    it 'moves draft to draft_on_review (Owner)' do
      # Додаємо обов'язкові поля, щоб AASM guard не заблокував перехід
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
    it 'moves draft_on_review to published (Superadmin)' do
      event = create(:event, brand: brand, status: 'draft_on_review')

      post "/api/v1/events/#{event.id}/approve", headers: auth_headers(superadmin)

      expect(response).to have_http_status(:ok)
      expect(event.reload.status).to eq('published')
    end
  end

  describe 'POST /api/v1/events/:id/reject' do
    it 'moves draft_on_review to rejected (Superadmin)' do
      event = create(:event, brand: brand, status: 'draft_on_review')

      post "/api/v1/events/#{event.id}/reject", headers: auth_headers(superadmin)

      expect(response).to have_http_status(:ok)
      expect(event.reload.status).to eq('rejected')
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
