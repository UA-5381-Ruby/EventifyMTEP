# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/events', type: :request do
  include AuthHelper

  path '/api/v1/events' do
    # ── GET /api/v1/events ─────────────────────────────────────────────────
    get 'List events' do
      tags        'Events'
      produces    'application/json'
      description 'Returns a paginated, filterable, sortable list of events.'
      # Вказуємо Swagger, що цей ендпоінт захищений
      security    [{ Bearer: [] }]

      parameter name: :page,     in: :query, type: :integer, required: false, description: 'Page number (default: 1)'
      parameter name: :per_page, in: :query, type: :integer, required: false, description: 'Items per page 1-100 (default: 20)'
      parameter name: :sort,     in: :query, type: :string,  required: false, description: 'Sort field', schema: { enum: %w[created_at updated_at title start_date status] }
      parameter name: :order,    in: :query, type: :string,  required: false, description: 'Sort direction', schema: { enum: %w[asc desc] }
      parameter name: :q,        in: :query, type: :string,  required: false, description: 'Search by title (case-insensitive)'
      parameter name: :from,     in: :query, type: :string,  required: false, description: 'Filter: events starting from this datetime (ISO 8601)'
      parameter name: :to,       in: :query, type: :string,  required: false, description: 'Filter: events starting before this datetime (ISO 8601)'

      response '200', 'events listed successfully' do
        schema type: :object,
               properties: {
                 data: {
                   type: :array,
                   items: { '$ref' => '#/components/schemas/Event' }
                 },
                 meta: {
                   type: :object,
                   properties: {
                     page: { type: :integer, example: 1 },
                     per_page: { type: :integer, example: 20 },
                     total: { type: :integer, example: 3 }
                   }
                 }
               }

        # Додаємо авторизацію
        let(:user) { create(:user) }
        let(:Authorization) { auth_headers(user)['Authorization'] }

        let(:brand)    { create(:brand) }
        let(:category) { create(:category) }

        before do
          create(:event, title: 'Future Conf',    brand: brand, start_date: 1.month.from_now)
          create(:event, title: 'Past Meetup',    brand: brand, start_date: 1.month.ago)
          create(:event, title: 'Live Workshop',  brand: brand, start_date: Time.zone.now)
        end

        run_test!
      end
    end

    # ── POST /api/v1/events ────────────────────────────────────────────────
    post 'Create event' do
      tags        'Events'
      consumes    'application/json'
      produces    'application/json'
      description 'Creates a new event. Status defaults to `draft`.'
      security    [{ Bearer: [] }]

      parameter name: :body, in: :body, required: true,
                schema: { '$ref' => '#/components/schemas/EventInput' }

      response '201', 'event created' do
        schema '$ref' => '#/components/schemas/Event'

        # Додаємо авторизацію
        let(:user) { create(:user) }
        let(:Authorization) { auth_headers(user)['Authorization'] }

        let(:brand) { create(:brand) }
        let(:body) do
          {
            event: {
              title: 'New Summit',
              location: 'Kyiv',
              start_date: 1.week.from_now.iso8601,
              brand_id: brand.id
            }
          }
        end

        run_test!
      end

      response '422', 'validation failed' do
        schema '$ref' => '#/components/schemas/ValidationErrors'

        # Додаємо авторизацію
        let(:user) { create(:user) }
        let(:Authorization) { auth_headers(user)['Authorization'] }

        let(:body) { { event: { title: '', location: '', brand_id: nil } } }

        run_test!
      end
    end
  end

  path '/api/v1/events/{id}' do
    parameter name: :id, in: :path, type: :integer, required: true, description: 'Event ID'

    # ── GET /api/v1/events/:id ─────────────────────────────────────────────
    get 'Show event' do
      tags        'Events'
      produces    'application/json'
      description 'Returns a single event with brand and categories.'
      security    [{ Bearer: [] }]

      response '200', 'event found' do
        schema '$ref' => '#/components/schemas/Event'

        # Додаємо авторизацію
        let(:user) { create(:user) }
        let(:Authorization) { auth_headers(user)['Authorization'] }

        let(:brand) { create(:brand) }
        let(:id)    { create(:event, brand: brand).id }

        run_test!
      end

      response '404', 'event not found' do
        schema '$ref' => '#/components/schemas/NotFound'

        # Додаємо авторизацію (саме тут падала помилка)
        let(:user) { create(:user) }
        let(:Authorization) { auth_headers(user)['Authorization'] }

        let(:id) { 0 }

        run_test!
      end
    end
  end
end