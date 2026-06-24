# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Payments', type: :request do
  let(:user)    { create(:user, :confirmed) }
  let(:event)   { create(:event, :published, price_cents: 10_000, available_tickets_count: 10) }
  let(:token)   { JwtService.encode(user_id: user.id, password_salt: user.password_salt) }
  let(:headers) { { 'Authorization' => "Bearer #{token}", 'Content-Type' => 'application/json' } }
  let(:webhook_headers) { { 'Content-Type' => 'application/json', 'X-Sign' => 'valid_signature' } }

  let(:monobank_success) do
    { 'pageUrl' => 'https://pay.monobank.ua/invoice/abc', 'invoiceId' => 'inv_123' }
  end

  before do
    allow(MonobankService).to receive(:create_invoice).and_return(monobank_success)
    allow(MonobankService).to receive(:verify_webhook_signature).and_return(true)
    allow(MailerService).to receive(:send_ticket_confirmation)
  end

  describe 'POST /api/v1/payments' do
    context 'when unauthenticated' do
      it 'returns 401' do
        post '/api/v1/payments',
             headers: { 'Content-Type' => 'application/json' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when authenticated and event is published' do
      it 'returns pageUrl and invoiceId' do
        post '/api/v1/payments',
             params: { event_id: event.id, quantity: 1 }.to_json,
             headers: headers

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['pageUrl']).to eq('https://pay.monobank.ua/invoice/abc')
        expect(response.parsed_body['invoiceId']).to eq('inv_123')
      end

      it 'clamps quantity to 10 at most' do
        post '/api/v1/payments',
             params: { event_id: event.id, quantity: 99 }.to_json,
             headers: headers

        expect(MonobankService).to have_received(:create_invoice).with(
          hash_including(amount_cents: event.price_cents * 10)
        )
      end

      it 'defaults quantity to 1 when not provided' do
        post '/api/v1/payments',
             params: { event_id: event.id }.to_json,
             headers: headers

        expect(MonobankService).to have_received(:create_invoice).with(
          hash_including(amount_cents: event.price_cents)
        )
      end
    end

    context 'when unauthenticated' do
      it 'returns 401' do
        post '/api/v1/payments',
             headers: { 'Content-Type' => 'application/json' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when event is not published' do
      let(:event) { create(:event, price_cents: 10_000, available_tickets_count: 10) }

      it 'returns 422 with error message' do
        post '/api/v1/payments',
             params: { event_id: event.id }.to_json,
             headers: headers

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body['error']).to eq(I18n.t('api.v1.errors.payments.event_not_available'))
      end
    end

    context 'when not enough tickets available' do
      let(:event) { create(:event, :published, price_cents: 10_000, available_tickets_count: 2) }

      it 'returns 422 with error message' do
        post '/api/v1/payments',
             params: { event_id: event.id, quantity: 5 }.to_json,
             headers: headers

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body['error']).to eq(I18n.t('api.v1.errors.payments.not_enough_tickets'))
      end
    end

    context 'when event is not found' do
      it 'returns 404' do
        post '/api/v1/payments',
             params: { event_id: 99_999 }.to_json,
             headers: headers

        expect(response).to have_http_status(:not_found)
      end
    end

    context 'when Monobank returns an error' do
      before do
        allow(MonobankService).to receive(:create_invoice).and_return({ 'errCode' => '1001' })
      end

      it 'returns 422 with errCode' do
        post '/api/v1/payments',
             params: { event_id: event.id }.to_json,
             headers: headers

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body['error']).to eq('1001')
      end
    end
  end

  describe 'POST /api/v1/payments/webhook' do
    let(:invoice_id) { 'inv_123' }

    let(:success_payload) do
      {
        status: 'success',
        invoiceId: invoice_id,
        reference: "event-#{event.id}-user-#{user.id}-qty-2"
      }.to_json
    end

    around do |example|
      original = Rails.cache
      Rails.cache = ActiveSupport::Cache::MemoryStore.new
      example.run
      Rails.cache = original
    end

    context 'when payment is successful' do
      it 'creates the correct number of tickets' do
        expect do
          post '/api/v1/payments/webhook',
               params: success_payload,
               headers: webhook_headers
        end.to change { user.tickets.count }.by(2)

        expect(response).to have_http_status(:ok)
      end

      it 'decrements available_tickets_count' do
        post '/api/v1/payments/webhook',
             params: success_payload,
             headers: webhook_headers

        expect(event.reload.available_tickets_count).to eq(8)
      end

      it 'sends a confirmation email per ticket' do
        post '/api/v1/payments/webhook',
             params: success_payload,
             headers: webhook_headers

        expect(MailerService).to have_received(:send_ticket_confirmation).twice
      end

      it 'is idempotent on repeated webhook calls' do
        post '/api/v1/payments/webhook', params: success_payload, headers: webhook_headers

        expect do
          post '/api/v1/payments/webhook', params: success_payload, headers: webhook_headers
        end.not_to(change { user.tickets.count })
      end
    end

    context 'when payment status is not success' do
      let(:processing_payload) do
        {
          status: 'processing',
          invoiceId: invoice_id,
          reference: "event-#{event.id}-user-#{user.id}-qty-2"
        }.to_json
      end

      it 'does not create any tickets and returns 200' do
        expect do
          post '/api/v1/payments/webhook',
               params: processing_payload,
               headers: webhook_headers
        end.not_to(change { Ticket.count })

        expect(response).to have_http_status(:ok)
      end
    end

    context 'when signature is invalid' do
      before do
        allow(MonobankService).to receive(:verify_webhook_signature).and_return(false)
      end

      it 'returns 401 and creates no tickets' do
        expect do
          post '/api/v1/payments/webhook',
               params: success_payload,
               headers: webhook_headers
        end.not_to(change { Ticket.count })

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when reference format is invalid' do
      let(:bad_payload) do
        { status: 'success', invoiceId: invoice_id, reference: 'bad-format' }.to_json
      end

      it 'returns 400' do
        post '/api/v1/payments/webhook',
             params: bad_payload,
             headers: webhook_headers

        expect(response).to have_http_status(:bad_request)
      end
    end

    context 'when reference format is invalid' do
      let(:missing_user_payload) do
        {
          status: 'success',
          invoiceId: invoice_id,
          reference: "event-#{event.id}-user-999999-qty-1"
        }.to_json
      end

      it 'returns 404' do
        post '/api/v1/payments/webhook',
             params: missing_user_payload,
             headers: webhook_headers

        expect(response).to have_http_status(:not_found)
      end
    end

    context 'when event from reference is missing' do
      let(:missing_event_payload) do
        {
          status: 'success',
          invoiceId: invoice_id,
          reference: "event-999999-user-#{user.id}-qty-1"
        }.to_json
      end

      it 'returns 404' do
        post '/api/v1/payments/webhook',
             params: missing_event_payload,
             headers: webhook_headers

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/v1/payments service errors' do
    before do
      allow(MonobankService).to receive(:create_invoice).and_raise(StandardError, 'network down')
    end

    it 'returns service unavailable' do
      post '/api/v1/payments',
           params: { event_id: event.id }.to_json,
           headers: headers

      expect(response).to have_http_status(:service_unavailable)
    end
  end
end
