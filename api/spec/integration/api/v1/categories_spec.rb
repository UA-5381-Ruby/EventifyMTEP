# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/categories', type: :request do
  include AuthHelper
  let(:superadmin) { create(:user, is_superadmin: true) }

  path '/api/v1/categories' do
    get 'List categories' do
      tags     'Categories'
      produces 'application/json'
      security [{ Bearer: [] }] # Вказуємо, що потрібен токен

      response '200', 'categories listed' do
        schema type: :array, items: { '$ref' => '#/components/schemas/Category' }

        # Передаємо токен
        let(:user) { create(:user) }
        let(:Authorization) { auth_headers(user)['Authorization'] }

        before { create_list(:category, 3) }
        run_test!
      end
    end

    post 'Create category' do
      tags     'Categories'
      consumes 'application/json'
      produces 'application/json'
      security [{ Bearer: [] }] # Вказуємо, що потрібен токен

      parameter name: :body, in: :body, required: true, schema: {
        type: :object,
        properties: {
          name: { type: :string, example: 'Music' }
        },
        required: ['name']
      }

      response '201', 'category created' do
        schema '$ref' => '#/components/schemas/Category'

        # Передаємо токен
        let(:user) { create(:user) }
        let(:Authorization) { auth_headers(user)['Authorization'] }
        let(:body) { { category: { name: 'Tech' } } }
        run_test!
      end

      response '422', 'validation failed' do
        # Передаємо токен
        let(:user) { create(:user) }
        let(:Authorization) { auth_headers(user)['Authorization'] }
        let(:body) { { category: { name: '' } } }
        run_test!
      end
    end
  end
end
