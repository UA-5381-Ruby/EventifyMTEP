# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Events', type: :request do
  # 1. Підключаємо твій хелпер для авторизації
  include AuthHelper

  # 2. Створюємо користувача, від імені якого робитимемо запити
  let(:user)      { create(:user) }
  let!(:superadmin) { create(:user, is_superadmin: true) }
  let!(:brand)    { create(:brand) }
  let!(:category) { create(:category) }

  let(:valid_params) do
    {
      event: {
        title: 'New Event',
        start_date: 1.week.from_now.iso8601,
        location: 'Kyiv',
        brand_id: brand.id,
        category_ids: [category.id],
        status: 'draft'
      }
    }
  end

  describe 'POST /api/v1/events' do
    context 'with valid params' do
      it 'returns 201 and creates event' do
        # 3. Додаємо headers: auth_headers(user)
        post '/api/v1/events',
             params: valid_params,
             headers: auth_headers(user),
             as: :json

        expect(response).to have_http_status(:created)
        expect(response.parsed_body['title']).to eq('New Event')
      end
    end

    context 'with invalid params' do
      it 'returns 422 with errors' do
        post '/api/v1/events',
             params: { event: { title: '' } },
             headers: auth_headers(user),
             as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body).to have_key('errors')
      end
    end
  end

  describe 'GET /api/v1/events' do
    before { create_list(:event, 5, brand: brand, categories: [category]) }

    it 'returns 200 and paginated list' do
      # Додаємо headers
      get '/api/v1/events',
          params: { page: 1, per_page: 3 },
          headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body['data'].length).to eq(3)
      expect(body['meta']['total']).to eq(Event.count)
    end

    it 'sorts by start_date desc' do
      create(:event, brand: brand, categories: [category], start_date: 1.day.from_now)
      create(:event, brand: brand, categories: [category], start_date: 3.days.from_now)
      create(:event, brand: brand, categories: [category], start_date: 2.days.from_now)

      get '/api/v1/events',
          params: { sort: 'start_date', order: 'desc' },
          headers: auth_headers(user)

      expect(response).to have_http_status(:ok)

      dates = response.parsed_body['data'].map { |d| Time.iso8601(d['start_date']) }
      expect(dates).to eq(dates.sort.reverse)
    end
  end

  describe 'GET /api/v1/events/:id' do
    let!(:event) { create(:event, brand: brand, categories: [category]) }

    it 'returns the event' do
      get "/api/v1/events/#{event.id}", headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:ok)
    end

    it 'returns 404 for unknown id' do
      get '/api/v1/events/999999', headers: auth_headers(user), as: :json
      expect(response).to have_http_status(:not_found)
    end
  end
end
