# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api coverage extensions', type: :request do
  let(:owner) { create(:user) }
  let(:brand) { create(:brand) }
  let!(:membership) { create(:brand_membership, user: owner, brand: brand, role: 'owner') }
  let(:headers) { auth_headers(owner) }

  describe 'EventsController banner upload' do
    let(:base_params) do
      {
        event: {
          title: 'Banner Event',
          brand_id: brand.id,
          location: 'Kyiv',
          start_date: 1.week.from_now.iso8601,
          price_cents: 100,
          available_tickets_count: 10
        }
      }
    end

    it 'uploads a valid banner' do
      file = fixture_file_upload(Rails.root.join('spec/fixtures/files/valid.png'), 'image/png')

      post '/api/v1/events',
           params: base_params.deep_merge(event: { banner: file }),
           headers: headers.except('Content-Type')

      expect(response).to have_http_status(:created)
      expect(response.parsed_body['banner']).to be_present
    end

    it 'returns error when banner upload fails' do
      file = fixture_file_upload(Rails.root.join('spec/fixtures/files/valid.png'), 'image/png')
      s3 = instance_double(S3BucketService, upload: nil)
      allow(S3BucketService).to receive(:new).and_return(s3)

      post '/api/v1/events',
           params: base_params.deep_merge(event: { banner: file }),
           headers: headers.except('Content-Type')

      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'returns error when banner is too large' do
      allow_any_instance_of(ActionDispatch::Http::UploadedFile).to receive(:size).and_return(6.megabytes)
      file = fixture_file_upload(Rails.root.join('spec/fixtures/files/valid.png'), 'image/png')

      post '/api/v1/events',
           params: base_params.deep_merge(event: { banner: file }),
           headers: headers.except('Content-Type')

      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'returns validation errors for invalid event data' do
      post '/api/v1/events',
           params: { event: { title: '', brand_id: brand.id } },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'InvitationsController validation' do
    it 'returns forbidden when user cannot manage memberships' do
      outsider = create(:user)

      post "/api/v1/brands/#{brand.id}/invitations",
           params: { email: 'guest@example.com', role: 'member' },
           headers: auth_headers(outsider),
           as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'EventCategoriesController params formats' do
    let!(:event) { create(:event, brand: brand) }
    let!(:category) { create(:category) }

    it 'assigns category using nested event_category params' do
      post "/api/v1/events/#{event.id}/categories",
           params: { event_category: { category_id: category.id } },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:created)
    end

    it 'handles RecordNotUnique race on create' do
      allow_any_instance_of(EventCategory).to receive(:save).and_raise(ActiveRecord::RecordNotUnique)

      post "/api/v1/events/#{event.id}/categories",
           params: { category_id: category.id },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'PaymentsController edge cases' do
    let(:user) { create(:user, :confirmed) }
    let(:event) { create(:event, :published, price_cents: 10_000, available_tickets_count: 10) }
    let(:auth) { auth_headers(user) }

    before do
      allow(MonobankService).to receive(:create_invoice).and_return({ 'errCode' => nil })
      allow(MonobankService).to receive(:verify_webhook_signature).and_return(true)
      allow(MailerService).to receive(:send_ticket_confirmation)
    end

    it 'returns generic invoice error when pageUrl is missing' do
      post '/api/v1/payments',
           params: { event_id: event.id }.to_json,
           headers: auth

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'returns service unavailable when invoice params are invalid' do
      event.update_column(:price_cents, -1)

      post '/api/v1/payments',
           params: { event_id: event.id }.to_json,
           headers: auth

      expect(response).to have_http_status(:service_unavailable)
    end
  end

  describe 'Event transitions additional paths' do
    it 'returns unprocessable_content for invalid cancel transition' do
      event = create(:event, brand: brand, status: 'cancelled')

      post "/api/v1/events/#{event.id}/cancel", headers: headers

      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'rejects with nested event reason param' do
      superadmin = create(:user, is_superadmin: true)
      event = create(:event, brand: brand, status: 'draft_on_review')

      post "/api/v1/events/#{event.id}/reject",
           params: { event: { reason: 'Needs work' } },
           headers: auth_headers(superadmin),
           as: :json

      expect(response).to have_http_status(:ok)
      expect(event.reload.status).to eq('rejected')
    end
  end
end
