# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/brands', type: :request do
  let(:superadmin) { create(:user, is_superadmin: true) }
  let(:Authorization) { "Bearer #{JwtService.encode(user_id: superadmin.id)}" }

  path '/api/v1/brands' do
    get 'List brands' do
      tags     'Brands'
      produces 'application/json'
      security [{ bearer_auth: [] }]

      response '200', 'brands listed' do
        schema type: :array, items: { '$ref' => '#/components/schemas/Brand' }
        before { create_list(:brand, 2) }
        run_test!
      end
    end

    post 'Create brand' do
      tags     'Brands'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearer_auth: [] }]

      parameter name: :body, in: :body, required: true,
                schema: { '$ref' => '#/components/schemas/BrandInput' }

      response '201', 'brand created' do
        schema '$ref' => '#/components/schemas/Brand'
        let(:body) { { brand: { name: 'My Brand', subdomain: 'my-brand' } } }
        run_test!
      end

      response '422', 'validation failed' do
        schema '$ref' => '#/components/schemas/ErrorMessages'
        let(:body) { { brand: { name: '', subdomain: '' } } }
        run_test!
      end
    end
  end

  path '/api/v1/brands/{id}' do
    parameter name: :id, in: :path, type: :integer, required: true

    get 'Show brand' do
      tags     'Brands'
      produces 'application/json'
      security [{ bearer_auth: [] }]

      response '200', 'brand found' do
        schema '$ref' => '#/components/schemas/Brand'

        let(:id) do
          brand = create(:brand)

          create(:brand_membership, brand: brand, user: superadmin, role: 'owner')

          brand.id
        end

        run_test!
      end

      response '404', 'brand not found' do
        schema '$ref' => '#/components/schemas/NotFound'
        let(:id) { 0 }
        run_test!
      end
    end
  end
end
