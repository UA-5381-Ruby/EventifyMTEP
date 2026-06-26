# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/events', type: :request do
  let(:user) { create(:user) }
  let!(:brand) { create(:brand) }
  let!(:category) { create(:category) }
  let!(:membership) { create(:brand_membership, user: user, brand: brand, role: 'owner') }

  let(:Authorization) { jwt_for(user) }

  let(:id) { create(:event, brand: brand, categories: [category]).id }
  let(:page) { 1 }
  let(:per_page) { 12 }
  let(:sort) { 'created_at' }
  let(:order) { 'desc' }
  let(:category_id) { category.id }

  path '/api/v1/events' do
    get 'get events filtered by category' do
      tags 'Events'
      produces 'application/json'
      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false

      response '200', 'returns a 200 response' do
        run_test!
      end
    end

    post 'post event created' do
      tags 'Events'
      consumes 'application/json'
      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :event, in: :body, schema: { type: :object }

      response '201', 'event created' do
        let(:event) do
          { event: { title: 'Valid Event',
                     brand_id: brand.id,
                     start_date: Time.current.iso8601,
                     location: 'Lviv',
                     price_cents: 100,
                     available_tickets_count: 100,
                     category_ids: [category.id] } }
        end
        run_test!
      end

      response '422', 'post validation failed' do
        let(:event) { { event: { title: '', brand_id: brand.id } } }
        run_test!
      end
    end
  end

  path '/api/v1/events/{id}' do
    get 'get event found' do
      tags 'Events'
      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :id, in: :path, type: :integer

      response '200', 'returns a 200 response' do
        run_test!
      end
    end

    patch 'patch event updated' do
      tags 'Events'
      consumes 'application/json'
      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :id, in: :path, type: :integer

      parameter name: :event, in: :body, schema: {
        type: :object,
        properties: {
          event: {
            type: :object,
            properties: {
              title: { type: :string, example: 'Updated Event Title' },
              description: { type: :string, example: 'New description here' },
              location: { type: :string, example: 'Odesa' },
              start_date: { type: :string, example: '2026-07-20T18:00:00Z' },
              category_ids: {
                type: :array,
                items: { type: :integer },
                example: [1, 2, 3]
              }
            },
            required: %w[title]
          }
        }
      }

      response '404', 'forbidden update returns not found' do
        let(:Authorization) { jwt_for(create(:user)) }
        let(:event) { { event: { title: 'Hack Title' } } }
        run_test!
      end
    end
  end
end
