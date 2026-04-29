# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Brands', type: :request do
  let!(:user) { create(:user) }
  let(:another_user) { create(:user) }

  let!(:brand) { create(:brand) }

  let!(:membership) do
    create(:brand_membership, user: user, brand: brand, role: 'owner')
  end

  before do
    create(:brand_membership, brand: brand, user: another_user, role: 'owner')
  end

  let(:headers) { auth_headers(user) }

  # ==========================================
  # GET /api/v1/brands
  # ==========================================
  describe 'GET /api/v1/brands' do
    it 'returns brands list' do
      get '/api/v1/brands', headers: headers

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      expect(json.length).to be >= 1
    end
  end

  # ==========================================
  # GET /api/v1/brands/:id
  # ==========================================
  describe 'GET /api/v1/brands/:id' do
    it 'returns brand' do
      get "/api/v1/brands/#{brand.id}", headers: headers

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      expect(json['id']).to eq(brand.id)
    end

    it 'returns not found' do
      get '/api/v1/brands/0', headers: headers

      expect(response).to have_http_status(:not_found)
    end
  end

  # ==========================================
  # POST /api/v1/brands
  # ==========================================
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
        post '/api/v1/brands', params: valid_params, headers: headers, as: :json
      end.to change(Brand, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it 'returns 400 Bad Request when required parameters are missing (rescues ParameterMissing)' do
      # Відправляємо пусті параметри, щоб спровокувати ActionController::ParameterMissing
      post '/api/v1/brands', 
           params: {}, 
           headers: headers, 
           as: :json

      expect(response).to have_http_status(:bad_request)
      
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('error')
      expect(json_response['error']).to include('param is missing or the value is empty')
    end
  end

  # ==========================================
  # PATCH /api/v1/brands/:id
  # ==========================================
  describe 'PATCH /api/v1/brands/:id' do
    it 'updates brand' do
      patch "/api/v1/brands/#{brand.id}", params: {
        brand: { name: 'Updated Name' }
      }, headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(brand.reload.name).to eq('Updated Name')
    end

    it 'returns 422 unprocessable_content when validation fails' do
      # Навмисно відправляємо невалідні дані (наприклад, пусте ім'я)
      patch "/api/v1/brands/#{brand.id}", params: {
        brand: { name: '' }
      }, headers: headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json).to have_key('errors')
    end

    it 'returns 422 unprocessable_content when subdomain has already taken (rescues RecordNotUnique)' do
      create(:brand, subdomain: 'taken-subdomain')

      patch "/api/v1/brands/#{brand.id}", params: {
        brand: { subdomain: 'taken-subdomain' }
      }, headers: headers, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      json = JSON.parse(response.body)
      expect(json['errors']).to include('Subdomain has already been taken')
    end
  end

  # ==========================================
  # DELETE /api/v1/brands/:id
  # ==========================================
  describe 'DELETE /api/v1/brands/:id' do
    it 'deletes brand' do
      delete "/api/v1/brands/#{brand.id}", headers: headers

      expect(response).to have_http_status(:no_content)
    end
  end

  # ==========================================
  # AUTHENTICATION CORNER CASES (current_user token parsing)
  # ==========================================
  describe 'Authentication errors' do
    it 'returns 401 Unauthorized when token is missing' do
      delete "/api/v1/brands/#{brand.id}" # Запит БЕЗ headers

      expect(response).to have_http_status(:unauthorized)
    end

    it 'returns 401 Unauthorized when token is invalid (rescues StandardError)' do
      invalid_headers = { 'Authorization' => 'Bearer some_fake_garbage_token' }
      
      delete "/api/v1/brands/#{brand.id}", headers: invalid_headers

      expect(response).to have_http_status(:unauthorized)
    end
  end
end