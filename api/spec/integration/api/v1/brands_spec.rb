# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/brands', type: :request do
  include AuthHelper

  path '/api/v1/brands' do
    get 'List brands' do
      tags     'Brands'
      produces 'application/json'
      security [{ bearer_auth: [] }]

      response '200', 'brands listed' do
        schema type: :array, items: { '$ref' => '#/components/schemas/Brand' }

        before do
          @user = create(:user)
          brands = create_list(:brand, 2)
          brands.each do |brand|
            create(:brand_membership, brand: brand, user: @user, role: 'owner')
          end
        end

        let(:user) { @user }
        let(:Authorization) { auth_headers(user)['Authorization'] }

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

        before { @user = create(:user) }

        let(:user) { @user }
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

        before { @user = create(:user) }

        let(:user) { @user }
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
      security [{ bearer_auth: [] }]

      response '200', 'brand found' do
        schema '$ref' => '#/components/schemas/Brand'

        before { @user = create(:user) }

        let(:user) { @user }
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

        before { @user = create(:user) }

        let(:user) { @user }
        let(:Authorization) { auth_headers(user)['Authorization'] }
        let(:id) { 0 }

        run_test!
      end
      context 'коли оновлення бренду проходить успішно' do
        before do
          # Припускаємо, що @brand і brand_params визначені через let
          allow(controller).to receive(:authorize).with(brand)
          allow(brand).to receive(:update).with(brand_params).and_return(true)
          controller.instance_variable_set(:@brand, brand)
        end

        it 'повертає статус :ok та JSON об\'єкт бренду' do
          put :update, params: { id: brand.id, brand: brand_params }

          expect(response).to have_http_status(:ok)
          expect(response.body).to eq(brand.to_json)
        end
      end

      context 'коли оновлення не вдається через помилки валідації' do
        before do
          allow(controller).to receive(:authorize).with(brand)
          allow(brand).to receive(:update).with(brand_params).and_return(false)
          allow(brand.errors).to receive(:full_messages).and_return(['Name is invalid'])
          controller.instance_variable_set(:@brand, brand)
        end

        it 'повертає статус :unprocessable_content та список помилок' do
          put :update, params: { id: brand.id, brand: brand_params }

          expect(response).to have_http_status(:unprocessable_content)
          expect(JSON.parse(response.body)).to eq({ 'errors' => ['Name is invalid'] })
        end
      end

      context 'коли виникає помилка унікальності бази даних (ActiveRecord::RecordNotUnique)' do
        before do
          allow(controller).to receive(:authorize).with(brand)
          allow(brand).to receive(:update).with(brand_params).and_raise(ActiveRecord::RecordNotUnique)
          controller.instance_variable_set(:@brand, brand)
        end

        it 'повертає статус :unprocessable_content та повідомлення про зайнятий субдомен' do
          put :update, params: { id: brand.id, brand: brand_params }

          expect(response).to have_http_status(:unprocessable_content)
          expect(JSON.parse(response.body)).to eq({ 'errors' => ['Subdomain is already taken'] })
        end
      end
    end
  end
end
