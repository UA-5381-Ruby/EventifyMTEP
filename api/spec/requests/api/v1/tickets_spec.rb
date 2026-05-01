# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/tickets', type: :request do
  path '/api/v1/tickets' do
    # =========================
    # GET /tickets (list - AUTH REQUIRED)
    # =========================
    get 'List user tickets' do
      tags 'Tickets'
      produces 'application/json'
      security [{ bearer_auth: [] }]
      description 'Returns paginated, filterable and sortable list of tickets owned by the current user.'

      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false
      parameter name: :sort, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false
      parameter name: :q, in: :query, type: :string, required: false
      parameter name: :is_active, in: :query, type: :boolean, required: false
      parameter name: :event_id, in: :query, type: :integer, required: false

      let(:user) { create(:user) }
      let(:Authorization) { jwt_for(user) }

      response '200', 'tickets listed successfully' do
        schema '$ref' => '#/components/schemas/TicketList'

        before do
          brand = create(:brand)

          event1 = create(:event,
                          brand: brand,
                          title: 'Tech Summit',
                          start_date: 1.month.from_now,
                          end_date: 1.month.from_now + 1.day)

          event2 = create(:event,
                          brand: brand,
                          title: 'Web Workshop',
                          start_date: 2.months.from_now,
                          end_date: 2.months.from_now + 1.day)

          create(:ticket, user: user, event: event1, is_active: true)
          create(:ticket, user: user, event: event2, is_active: false)
        end

        let(:page) { 1 }
        let(:per_page) { 20 }

        run_test!
      end

      response '200', 'tickets filtered by active status' do
        schema '$ref' => '#/components/schemas/TicketList'

        before do
          brand = create(:brand)

          event1 = create(:event,
                          brand: brand,
                          title: 'Active Event',
                          start_date: 1.week.from_now,
                          end_date: 1.week.from_now + 1.day)

          event2 = create(:event,
                          brand: brand,
                          title: 'Inactive Event',
                          start_date: 2.weeks.from_now,
                          end_date: 2.weeks.from_now + 1.day)

          event3 = create(:event,
                          brand: brand,
                          title: 'Another Event',
                          start_date: 3.weeks.from_now,
                          end_date: 3.weeks.from_now + 1.day)

          create(:ticket, user: user, event: event1, is_active: true)
          create(:ticket, user: user, event: event2, is_active: false)
          create(:ticket, user: user, event: event3, is_active: true)
        end

        let(:is_active) { 'true' }

        run_test!
      end

      response '200', 'tickets searched by event title' do
        schema '$ref' => '#/components/schemas/TicketList'

        before do
          brand = create(:brand)

          event1 = create(:event,
                          brand: brand,
                          title: 'Ruby Conference',
                          start_date: 1.week.from_now,
                          end_date: 1.week.from_now + 1.day)

          event2 = create(:event,
                          brand: brand,
                          title: 'Python Meetup',
                          start_date: 2.weeks.from_now,
                          end_date: 2.weeks.from_now + 1.day)

          create(:ticket, user: user, event: event1)
          create(:ticket, user: user, event: event2)
        end

        let(:q) { 'Ruby' }

        run_test!
      end

      response '401', 'unauthorized' do
        schema '$ref' => '#/components/schemas/Unauthorized'
        let(:Authorization) { nil }

        run_test!
      end
    end

    # =========================
    # POST /tickets (CREATE - AUTH REQUIRED)
    # =========================
    post 'Create ticket' do
      tags 'Tickets'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearer_auth: [] }]
      description 'Creates a new ticket for the current user for a specified event. QR code is auto-generated.'

      parameter name: :body, in: :body, required: true,
                schema: { '$ref' => '#/components/schemas/TicketInput' }

      let(:user) { create(:user) }
      let(:Authorization) { jwt_for(user) }

      response '201', 'ticket created' do
        schema '$ref' => '#/components/schemas/Ticket'

        let(:brand) { create(:brand) }
        let(:event) { create(:event, brand: brand, start_date: 1.week.from_now, end_date: 1.week.from_now + 1.day) }

        let(:body) do
          {
            ticket: {
              event_id: event.id
            }
          }
        end

        run_test!
      end

      response '422', 'validation failed - user already registered for event' do
        schema '$ref' => '#/components/schemas/ValidationErrors'

        let(:brand) { create(:brand) }
        let(:event) { create(:event, brand: brand, start_date: 1.week.from_now, end_date: 1.week.from_now + 1.day) }

        before do
          create(:ticket, user: user, event: event)
        end

        let(:body) do
          {
            ticket: {
              event_id: event.id
            }
          }
        end

        run_test!
      end

      response '401', 'unauthorized' do
        schema '$ref' => '#/components/schemas/Unauthorized'
        let(:Authorization) { nil }
        let(:body) { { ticket: { event_id: 1 } } }

        run_test!
      end
    end
  end

  # =========================
  # /tickets/:id
  # =========================
  path '/api/v1/tickets/{id}' do
    parameter name: :id, in: :path, type: :integer, required: true

    # =========================
    # GET /tickets/:id (SHOW)
    # =========================
    get 'Show ticket' do
      tags 'Tickets'
      produces 'application/json'
      security [{ bearer_auth: [] }]
      description 'Returns a specific ticket with associated event and feedback.'

      let(:user) { create(:user) }
      let(:Authorization) { jwt_for(user) }

      response '200', 'ticket found' do
        schema '$ref' => '#/components/schemas/Ticket'

        let(:brand) { create(:brand) }
        let(:event) { create(:event, brand: brand, start_date: 1.week.from_now, end_date: 1.week.from_now + 1.day) }
        let(:id) { create(:ticket, user: user, event: event).id }

        run_test!
      end

      response '404', 'ticket not found' do
        schema '$ref' => '#/components/schemas/NotFound'
        let(:id) { 0 }

        run_test!
      end

      response '401', 'unauthorized' do
        schema '$ref' => '#/components/schemas/Unauthorized'
        let(:Authorization) { nil }
        let(:id) { 1 }

        run_test!
      end
    end

    # =========================
    # PATCH /tickets/:id (UPDATE)
    # =========================
    patch 'Update ticket' do
      tags 'Tickets'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearer_auth: [] }]
      description 'Updates a ticket (e.g., is_active status).'

      parameter name: :body, in: :body, required: true,
                schema: { '$ref' => '#/components/schemas/TicketUpdateInput' }

      let(:user) { create(:user) }
      let(:Authorization) { jwt_for(user) }

      response '200', 'ticket updated' do
        schema '$ref' => '#/components/schemas/Ticket'

        let(:brand) { create(:brand) }
        let(:event) { create(:event, brand: brand, start_date: 1.week.from_now, end_date: 1.week.from_now + 1.day) }
        let(:id) { create(:ticket, user: user, event: event, is_active: true).id }

        let(:body) do
          {
            ticket: {
              is_active: false
            }
          }
        end

        run_test!
      end

      response '404', 'ticket not found' do
        schema '$ref' => '#/components/schemas/NotFound'
        let(:id) { 0 }
        let(:body) { { ticket: { is_active: false } } }

        run_test!
      end

      response '401', 'unauthorized' do
        schema '$ref' => '#/components/schemas/Unauthorized'
        let(:Authorization) { nil }
        let(:id) { 1 }
        let(:body) { { ticket: { is_active: false } } }

        run_test!
      end
    end
  end

  # =========================
  # /tickets/:id/review
  # =========================
  path '/api/v1/tickets/{id}/review' do
    parameter name: :id, in: :path, type: :integer, required: true

    post 'Create or update ticket review' do
      tags 'Tickets'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearer_auth: [] }]
      description 'Creates or updates event feedback (review) for a ticket.'

      parameter name: :body, in: :body, required: true,
                schema: { '$ref' => '#/components/schemas/ReviewInput' }

      let(:user) { create(:user) }
      let(:Authorization) { jwt_for(user) }

      response '200', 'review created successfully' do
        schema '$ref' => '#/components/schemas/EventFeedback'

        let(:brand) { create(:brand) }
        let(:event) { create(:event, brand: brand, start_date: 1.week.from_now, end_date: 1.week.from_now + 1.day) }
        let(:id) { create(:ticket, user: user, event: event).id }

        let(:body) do
          {
            ticket: {
              rating: 5,
              comment: 'Amazing event!'
            }
          }
        end

        run_test!
      end

      response '200', 'review updated successfully' do
        schema '$ref' => '#/components/schemas/EventFeedback'

        let(:brand) { create(:brand) }
        let(:event1) { create(:event, brand: brand, start_date: 1.week.from_now, end_date: 1.week.from_now + 1.day) }
        let(:event2) { create(:event, brand: brand, start_date: 2.weeks.from_now, end_date: 2.weeks.from_now + 1.day) }
        let(:ticket1) { create(:ticket, user: user, event: event1) }
        let(:id) { ticket1.id }

        before do
          create(:event_feedback, ticket: ticket1, rating: 3, comment: 'Good')
        end

        let(:body) do
          {
            ticket: {
              rating: 5,
              comment: 'Changed my mind, it was excellent!'
            }
          }
        end

        run_test!
      end

      response '404', 'ticket not found' do
        schema '$ref' => '#/components/schemas/NotFound'
        let(:id) { 0 }
        let(:body) { { ticket: { rating: 5, comment: 'Great!' } } }

        run_test!
      end

      response '401', 'unauthorized' do
        schema '$ref' => '#/components/schemas/Unauthorized'
        let(:Authorization) { nil }
        let(:id) { 1 }
        let(:body) { { ticket: { rating: 5, comment: 'Great!' } } }

        run_test!
      end
    end
  end
end
