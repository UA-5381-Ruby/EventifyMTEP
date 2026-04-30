# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'api/v1/events', type: :request do
  path '/api/v1/events' do
    # =========================
    # GET /events (filter by category - NO AUTH)
    # =========================
    get 'Filter events by category' do
      tags 'Events'
      produces 'application/json'
      description 'Returns events filtered by category. No authentication required.'

      parameter name: :category_id, in: :query, type: :integer, required: false

      response '200', 'events filtered by category' do
        schema type: :object,
               properties: {
                 data: {
                   type: :array,
                   items: { '$ref' => '#/components/schemas/Event' }
                 },
                 meta: {
                   type: :object,
                   properties: {
                     page: { type: :integer },
                     per_page: { type: :integer },
                     total: { type: :integer }
                   },
                   required: %w[page per_page total]
                 }
               },
               required: %w[data meta]

        let!(:category1) { create(:category) }
        let!(:category2) { create(:category) }

        let!(:event1) { create(:event, categories: [category1]) }
        let!(:event2) { create(:event, categories: [category2]) }
        let!(:event3) { create(:event, categories: [category1, category2]) }

        let(:category_id) { category1.id }

        run_test!
      end
    end

    # =========================
    # GET /events (list - AUTH REQUIRED)
    # =========================
    get 'List events' do
      tags 'Events'
      produces 'application/json'
      security [{ bearer_auth: [] }]
      description 'Returns paginated, filterable and sortable list of events.'

      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false
      parameter name: :sort, in: :query, type: :string, required: false
      parameter name: :order, in: :query, type: :string, required: false
      parameter name: :q, in: :query, type: :string, required: false
      parameter name: :from, in: :query, type: :string, required: false
      parameter name: :to, in: :query, type: :string, required: false

      let(:user) { create(:user) }
      let(:Authorization) { "Bearer #{JwtService.encode(user_id: user.id)}" }

      response '200', 'events listed successfully' do
        let(:brand) { create(:brand) }

        before do
          create(:event,
                 title: 'Future Conf',
                 brand: brand,
                 start_date: 1.month.from_now,
                 end_date: 1.month.from_now + 1.day) # Додано end_date

          create(:event,
                 title: 'Past Meetup',
                 brand: brand,
                 start_date: 1.month.ago,
                 end_date: 1.month.ago + 1.day) # Додано end_date

          create(:event,
                 title: 'Live Workshop',
                 brand: brand,
                 start_date: Time.zone.now,
                 end_date: Time.zone.now + 1.day) # Додано end_date
        end

        run_test!
      end
    end

    # =========================
    # POST /events (AUTH REQUIRED)
    # =========================
    post 'Create event' do
      tags 'Events'
      consumes 'application/json'
      produces 'application/json'
      security [{ bearer_auth: [] }]
      description 'Creates a new event. Status defaults to draft.'

      parameter name: :body, in: :body, required: true,
                schema: { '$ref' => '#/components/schemas/EventInput' }

      let(:user) { create(:user, is_superadmin: true) }
      let(:Authorization) { "Bearer #{JwtService.encode(user_id: user.id)}" }

      response '201', 'event created' do
        schema '$ref' => '#/components/schemas/Event'

        let(:brand) { create(:brand) }

        let(:body) do
          {
            event: {
              title: 'New Summit',
              location: 'Kyiv',
              start_date: 1.week.from_now.iso8601,
              end_date: (1.week.from_now + 1.day).iso8601,
              brand_id: brand.id
            }
          }
        end

        run_test!
      end

      response '422', 'validation failed' do
        schema '$ref' => '#/components/schemas/ValidationErrors'

        let(:body) do
          {
            event: {
              title: '',
              location: '',
              brand_id: nil
            }
          }
        end

        run_test!
      end
      it 'is invalid if end_date is before start_date' do
        # Створюємо подію в пам'яті (build, а не create), де кінець раніше за початок
        event = build(:event, start_date: 1.day.from_now, end_date: 1.day.ago)

        # Перевіряємо, що подія невалідна
        expect(event).not_to be_valid

        # Перевіряємо, що з'явилася правильна помилка, яка покриє ваш червоний рядок
        expect(event.errors[:end_date]).to include('must be after start date')
      end
    end
  end

  # =========================
  # /events/:id
  # =========================
  path '/api/v1/events/{id}' do
    parameter name: :id, in: :path, type: :integer, required: true

    get 'Show event' do
      tags 'Events'
      produces 'application/json'
      security [{ bearer_auth: [] }]

      let(:user) { create(:user) }
      let(:Authorization) { "Bearer #{JwtService.encode(user_id: user.id)}" }

      response '200', 'event found' do
        schema '$ref' => '#/components/schemas/Event'

        let(:brand) { create(:brand) }
        let(:id) { create(:event, brand: brand).id }

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
