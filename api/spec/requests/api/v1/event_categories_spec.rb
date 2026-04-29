# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Api::V1::EventCategories', type: :request do
  let!(:owner)      { create(:user, is_superadmin: false) }
  let!(:brand)      { create(:brand) }
  let!(:membership) { create(:brand_membership, user: owner, brand: brand, role: 'owner') }
  let!(:event)      { create(:event, brand: brand) }
  let!(:category)   { create(:category) }

  def auth_headers(user)
    token = JwtService.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end

  describe 'GET /api/v1/events/:event_id/categories' do
    before { event.categories << category }

    it 'returns assigned categories' do
      # GET зазвичай відкритий, але якщо у тебе глобальний authenticate_request, передаємо токен
      get "/api/v1/events/#{event.id}/categories", headers: auth_headers(owner)

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.map { |c| c['id'] }).to include(category.id)
    end
  end

  describe 'POST /api/v1/events/:event_id/categories' do
    it 'assigns category to event' do
      post "/api/v1/events/#{event.id}/categories",
           params: { category_id: category.id },
           headers: auth_headers(owner),
           as: :json

      expect(response).to have_http_status(:created)
    end

    it 'returns 422 on duplicate' do
      event.categories << category

      post "/api/v1/events/#{event.id}/categories",
           params: { category_id: category.id },
           headers: auth_headers(owner),
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'DELETE /api/v1/events/:event_id/categories/:category_id' do
    let!(:event_category) { EventCategory.create!(event: event, category: category) }

    it 'removes category from event' do
      # Використовуємо category.id замість event_category.id згідно з Alternative DELETE Route
      delete "/api/v1/events/#{event.id}/categories/#{category.id}", headers: auth_headers(owner)

      expect(response).to have_http_status(:no_content)
      expect(EventCategory.exists?(event_category.id)).to be false
    end
  end
end
