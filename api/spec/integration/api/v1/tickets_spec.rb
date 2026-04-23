# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/tickets', type: :request do
  path '/api/v1/tickets/{id}/review' do
    parameter name: :id, in: :path, type: :integer, required: true, description: 'Ticket ID'

    patch 'Leave a review for a ticket' do
      tags        'Tickets'
      consumes    'application/json'
      produces    'application/json'
      description 'Creates or updates feedback (rating + comment) for a ticket.'
      security    [{ Bearer: [] }]

      parameter name: :body, in: :body, required: true,
                schema: { '$ref' => '#/components/schemas/ReviewInput' }

      response '200', 'review saved' do
        schema '$ref' => '#/components/schemas/EventFeedback'

        let(:Authorization) { 'Bearer dummy_test_token' }
        let(:user)   { create(:user) }
        let(:brand)  { create(:brand) }
        let(:event)  { create(:event, brand: brand) }
        let(:ticket) { create(:ticket, user: user, event: event) }
        let(:id)     { ticket.id }
        let(:body)   { { ticket: { rating: 5, comment: 'Amazing!' } } }

        run_test!
      end

      response '422', 'invalid rating' do
        schema '$ref' => '#/components/schemas/ErrorMessages'

        let(:Authorization) { 'Bearer dummy_test_token' }
        let(:user)   { create(:user) }
        let(:brand)  { create(:brand) }
        let(:event)  { create(:event, brand: brand) }
        let(:ticket) { create(:ticket, user: user, event: event) }
        let(:id)     { ticket.id }
        let(:body)   { { ticket: { rating: 10 } } }

        run_test!
      end

      response '404', 'ticket not found' do
        schema '$ref' => '#/components/schemas/NotFound'

        let(:Authorization) { 'Bearer dummy_test_token' }
        let(:id)   { 0 }
        let(:body) { { ticket: { rating: 5 } } }

        run_test!
      end
    end
  end
end
