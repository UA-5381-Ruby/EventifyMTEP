# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/categories', type: :request do
  path '/api/v1/categories' do
    get 'List categories' do
      tags     'Categories'
      produces 'application/json'

      response '200', 'categories listed' do
        schema type: :array, items: { '$ref' => '#/components/schemas/Category' }

        before { create_list(:category, 3) }

        run_test!
      end
    end

    post 'Create category' do
      tags     'Categories'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :body, in: :body, required: true, schema: {
        type: :object,
        properties: {
          name: { type: :string, example: 'Music' }
        },
        required: ['name']
      }

      response '201', 'category created' do
        schema '$ref' => '#/components/schemas/Category'

        let(:body) { { category: { name: 'Tech' } } }

        run_test!
      end

      response '422', 'validation failed' do
        let(:body) { { category: { name: '' } } }

        run_test!
      end
    end
  end
end
