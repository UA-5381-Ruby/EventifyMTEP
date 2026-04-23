# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Brands', type: :request do
  let!(:user) { create(:user) }

  let!(:brand) { create(:brand) }

  let!(:membership) do
    create(:brand_membership, user: user, brand: brand, role: 'owner')
  end
  before do
    create(:brand_membership, brand: brand, user: user, role: 'owner')
  end

  before do
    allow_any_instance_of(Api::V1::BrandsController)
      .to receive(:current_user)
      .and_return(user)
  end

  describe 'GET /api/v1/brands' do
    it 'returns brands list' do
      get '/api/v1/brands'

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      expect(json.length).to be >= 1
    end
  end

  describe 'GET /api/v1/brands/:id' do
    it 'returns brand' do
      get "/api/v1/brands/#{brand.id}"

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      expect(json['id']).to eq(brand.id)
    end

    it 'returns not found' do
      get '/api/v1/brands/0'

      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /api/v1/brands' do
    let(:valid_params) do
      {
        brand: {
          name: 'Test Brand',
          description: 'desc',
          subdomain: 'test-brand',
          logo_url: 'http://example.com/logo.png',
          primary_color: '#000000',
          secondary_color: '#ffffff'
        }
      }
    end

    it 'creates brand' do
      expect do
        post '/api/v1/brands', params: valid_params
      end.to change(Brand, :count).by(1)

      expect(response).to have_http_status(:created)
    end
  end

  describe 'PATCH /api/v1/brands/:id' do
    it 'updates brand' do
      patch "/api/v1/brands/#{brand.id}", params: {
        brand: { name: 'Updated Name' }
      }

      expect(response).to have_http_status(:ok)
      expect(brand.reload.name).to eq('Updated Name')
    end
  end

  describe 'DELETE /api/v1/brands/:id' do
    it 'deletes brand' do
      delete "/api/v1/brands/#{brand.id}"

      expect(response).to have_http_status(:no_content)
    end
  end
end
