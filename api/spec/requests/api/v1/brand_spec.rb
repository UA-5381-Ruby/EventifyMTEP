# frozen_string_literal: true

require 'swagger_helper'

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

  describe 'GET /api/v1/brands' do
    it 'returns brands list' do
      get '/api/v1/brands', headers: headers

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)
      expect(json.length).to be >= 1
    end
  end

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

  describe 'PATCH /api/v1/brands/:id' do
    it 'updates brand' do
      patch "/api/v1/brands/#{brand.id}", params: {
        brand: { name: 'Updated Name' }
      }, headers: headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(brand.reload.name).to eq('Updated Name')
    end

    it 'returns 422 unprocessable_content when validation fails' do
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
      expect(JSON.parse(response.body)).to eq({ 'errors' => [I18n.t('api.v1.errors.brands.subdomain_taken')] })
    end
  end

  describe 'DELETE /api/v1/brands/:id' do
    it 'deletes brand' do
      delete "/api/v1/brands/#{brand.id}", headers: headers

      expect(response).to have_http_status(:no_content)
    end
  end

  context 'when Authorization header is missing' do
    it 'returns 401 for a protected endpoint' do
      delete "/api/v1/brands/#{brand.id}"
      expect(response).to have_http_status(:unauthorized)
    end

    it 'returns 200 for a public endpoint' do
      get '/api/v1/events'
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'scope filtering' do
    let!(:other_brand) { create(:brand) }

    it 'returns managed brands' do
      get '/api/v1/brands', params: { scope: 'managed' }, headers: headers
      expect(response).to have_http_status(:ok)
    end

    it 'returns subscribed brands' do
      create(:brand_membership, user: user, brand: other_brand, role: 'member')
      get '/api/v1/brands', params: { scope: 'subscribed' }, headers: headers
      expect(response).to have_http_status(:ok)
    end

    it 'returns discover brands' do
      get '/api/v1/brands', params: { scope: 'discover' }, headers: headers
      expect(response).to have_http_status(:ok)
    end

    it 'filters by query' do
      get '/api/v1/brands', params: { q: brand.name }, headers: headers
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'superadmin access' do
    let!(:superadmin) { create(:user, is_superadmin: true) }
    let(:admin_headers) { auth_headers(superadmin) }

    it 'allows superadmin to update any brand' do
      patch "/api/v1/brands/#{brand.id}",
            params: { brand: { name: 'Admin Updated' } },
            headers: admin_headers,
            as: :json

      expect(response).to have_http_status(:ok)
    end

    it 'returns 404 for superadmin on missing brand' do
      patch '/api/v1/brands/999999',
            params: { brand: { name: 'X' } },
            headers: admin_headers,
            as: :json

      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'logo upload validation' do
    let(:invalid_file) do
      Rack::Test::UploadedFile.new(
        StringIO.new('fake content'),
        'application/pdf',
        original_filename: 'doc.pdf'
      )
    end

    let(:oversized_file) do
      Rack::Test::UploadedFile.new(
        StringIO.new('x' * (6 * 1024 * 1024)),
        'image/jpeg',
        original_filename: 'big.jpg'
      )
    end

    it 'returns 422 for invalid logo format' do
      patch "/api/v1/brands/#{brand.id}",
            params: { brand: { name: 'Test', logo: invalid_file } },
            headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body)['errors']).to be_present
    end

    it 'returns 422 for oversized logo' do
      patch "/api/v1/brands/#{brand.id}",
            params: { brand: { name: 'Test', logo: oversized_file } },
            headers: headers

      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'returns 422 when S3 upload returns nil' do
      valid_file = Rack::Test::UploadedFile.new(
        StringIO.new('fake image'),
        'image/jpeg',
        original_filename: 'photo.jpg'
      )

      s3 = instance_double(S3BucketService)
      allow(S3BucketService).to receive(:new).and_return(s3)
      allow(s3).to receive(:upload).and_return(nil)

      patch "/api/v1/brands/#{brand.id}",
            params: { brand: { name: 'Test', logo: valid_file } },
            headers: headers

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
