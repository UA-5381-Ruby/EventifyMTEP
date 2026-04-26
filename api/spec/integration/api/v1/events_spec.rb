# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/events', type: :request do
  let(:superadmin) { create(:user, is_superadmin: true) }
  let(:Authorization) { "Bearer #{JwtService.encode(user_id: superadmin.id)}" }

  path '/api/v1/events' do
    get 'List events' do
      tags        'Events'
      produces    'application/json'
      security    [{ bearer_auth: [] }]
      description 'Returns a paginated, filterable, sortable list of events.'

      parameter name: :page,     in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false
      parameter name: :sort,     in: :query, type: :string,  required: false
      parameter name: :order,    in: :query, type: :string,  required: false
      parameter name: :q,        in: :query, type: :string,  required: false
      parameter name: :from,     in: :query, type: :string,  required: false
      parameter name: :to,       in: :query, type: :string,  required: false

      response '200', 'events listed successfully' do
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

    post 'Create event' do
      tags        'Events'
      consumes    'application/json'
      produces    'application/json'
      security    [{ bearer_auth: [] }]
      description 'Creates a new event. Status defaults to `draft`.'

      parameter name: :body, in: :body, required: true,
                schema: { '$ref' => '#/components/schemas/EventInput' }

      response '201', 'event created' do
        schema '$ref' => '#/components/schemas/Event'

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
        let(:body) { { event: { title: '', location: '', brand_id: nil } } }
        run_test!
      end
    end
  end

  path '/api/v1/events/{id}' do
    parameter name: :id, in: :path, type: :integer, required: true, description: 'Event ID'

    get 'Show event' do
      tags        'Events'
      produces    'application/json'
      security    [{ bearer_auth: [] }]

      response '200', 'event found' do
        schema '$ref' => '#/components/schemas/Event'
        let(:brand) { create(:brand) }
        let(:id)    { create(:event, brand: brand).id }
        run_test!
      end

      response '404', 'event not found' do
        schema '$ref' => '#/components/schemas/NotFound'
        let(:id) { 0 }
        run_test!
      end
    end
  end
end
