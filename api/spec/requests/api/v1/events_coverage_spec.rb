# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Events coverage', type: :request do
  let(:owner) { create(:user) }
  let(:brand) { create(:brand) }
  let!(:membership) { create(:brand_membership, user: owner, brand: brand, role: 'owner') }
  let(:headers) { auth_headers(owner) }
  let(:category) { create(:category) }

  describe 'GET /api/v1/events' do
    let!(:published_event) { create(:event, :published, brand: brand, categories: [category]) }

    it 'returns paginated events with filters' do
      get '/api/v1/events',
          params: { category_id: category.id, brand_id: brand.id, page: 1, per_page: 10 },
          headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['data']).to be_present
      expect(response.parsed_body['meta']).to include('current_page', 'per_page')
    end
  end

  describe 'GET /api/v1/events/:id' do
    let!(:event) { create(:event, :published, brand: brand) }

    it 'returns event details' do
      get "/api/v1/events/#{event.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['id']).to eq(event.id)
    end

    it 'returns 404 for inaccessible event' do
      draft = create(:event, brand: brand, status: :draft)
      guest = create(:user)

      get "/api/v1/events/#{draft.id}", headers: auth_headers(guest)

      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /api/v1/events' do
    let(:valid_params) do
      {
        event: {
          title: 'New Event',
          brand_id: brand.id,
          location: 'Kyiv',
          start_date: 1.week.from_now.iso8601,
          price_cents: 500,
          available_tickets_count: 50,
          category_ids: [category.id]
        }
      }
    end

    it 'creates event for brand owner' do
      post '/api/v1/events', params: valid_params, headers: headers, as: :json

      expect(response).to have_http_status(:created)
      expect(response.parsed_body['title']).to eq('New Event')
    end

    it 'returns forbidden when user cannot manage brand' do
      outsider = create(:user)

      post '/api/v1/events', params: valid_params, headers: auth_headers(outsider), as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it 'returns forbidden for unknown brand' do
      post '/api/v1/events',
           params: { event: valid_params[:event].merge(brand_id: 999_999) },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it 'rejects invalid banner format' do
      file = fixture_file_upload(
        Rails.root.join('spec/fixtures/files/invalid.txt'),
        'text/plain'
      )
      upload_headers = auth_headers(owner).except('Content-Type')

      post '/api/v1/events',
           params: valid_params.deep_merge(event: { banner: file }),
           headers: upload_headers

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
