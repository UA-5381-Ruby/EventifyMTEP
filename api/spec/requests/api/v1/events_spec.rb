# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Events', type: :request do
  let!(:brand)    { create(:brand) }
  let!(:category) { create(:category) }

  let(:valid_params) do
    {
      event: {
        title: 'New Event',
        start_date: 1.week.from_now.iso8601,
        location: 'Kyiv',
        brand_id: brand.id,
        category_id: category.id,
        status: 'draft'
      }
    }
  end

  describe 'POST /api/v1/events' do
    context 'with valid params' do
      it 'returns 201 and creates event' do
        post '/api/v1/events', params: valid_params, as: :json
        expect(response).to have_http_status(:created)
        expect(response.parsed_body['title']).to eq('New Event')
      end
    end

    context 'with invalid params' do
      it 'returns 422 with errors' do
        post '/api/v1/events', params: { event: { title: '' } }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body).to have_key('errors')
      end
    end
  end

  describe 'GET /api/v1/events' do
    before { create_list(:event, 5, brand: brand, category: category) }

    it 'returns 200 and paginated list' do
      get '/api/v1/events', params: { page: 1, per_page: 3 }
      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body['data'].length).to eq(3)
      expect(body['meta']['total']).to eq(Event.count)
    end

    it 'sorts by start_date desc' do
      get '/api/v1/events', params: { sort: 'start_date', order: 'desc' }
      dates = response.parsed_body['data'].pluck('start_date')
      expect(dates).to eq(dates.sort.reverse)
    end
  end

  describe 'GET /api/v1/events/:id' do
    let!(:event) { create(:event, brand: brand, category: category) }

    it 'returns the event' do
      get "/api/v1/events/#{event.id}", as: :json
      expect(response).to have_http_status(:ok)
    end

    it 'returns 404 for unknown id' do
      get '/api/v1/events/999999', as: :json
      expect(response).to have_http_status(:not_found)
    end
  end
end
