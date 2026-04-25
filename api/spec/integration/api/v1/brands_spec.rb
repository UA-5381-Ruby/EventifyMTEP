# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/brands', type: :request do
  include AuthHelper

  path '/api/v1/brands' do
    get 'List brands' do
      tags     'Brands'
      produces 'application/json'
      security [{ Bearer: [] }]

      response '200', 'brands listed' do
        schema type: :array, items: { '$ref' => '#/components/schemas/Brand' }
        let(:user) { create(:user) }
        let(:Authorization) { auth_headers(user)['Authorization'] }

        before do
          brands = create_list(:brand, 2)
          brands.each do |brand|
            create(:brand_membership, brand: brand, user: user, role: 'owner')
          end
        end

        run_test!
      end
    end

    post 'Create brand' do
      tags     'Brands'
      consumes 'application/json'
      produces 'application/json'
      security [{ Bearer: [] }]

      parameter name: :body, in: :body, required: true,
                schema: { '$ref' => '#/components/schemas/BrandInput' }

      response '201', 'brand created' do
        schema '$ref' => '#/components/schemas/Brand'

        let(:user) { create(:user) }
        let(:Authorization) { auth_headers(user)['Authorization'] }

        let(:body) do
          {
            brand: {
              name: 'My Brand',
              subdomain: 'my-brand'
            }
          }
        end

        run_test!
      end

      response '422', 'validation failed' do
        schema '$ref' => '#/components/schemas/ErrorMessages'

        let(:user) { create(:user) }
        let(:Authorization) { auth_headers(user)['Authorization'] }
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
      security [{ Bearer: [] }]

      response '200', 'brand found' do
        schema '$ref' => '#/components/schemas/Brand'

        let(:user) { create(:user) }
        let(:Authorization) { auth_headers(user)['Authorization'] }

        let(:id) do
          brand = create(:brand)
          create(:brand_membership, brand: brand, user: user, role: 'owner')
          brand.id
        end

        run_test!
      end

      response '404', 'brand not found' do
        schema '$ref' => '#/components/schemas/NotFound'
        let(:user) { create(:user) }
        let(:Authorization) { auth_headers(user)['Authorization'] }
        let(:id) { 0 }

        run_test!
      end
    end
  end
end
