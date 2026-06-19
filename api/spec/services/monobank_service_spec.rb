# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MonobankService do
  let(:event) { create(:event, :published, title: 'Future Conf', price_cents: 10_000) }
  let(:user)  { create(:user, :confirmed) }

  let(:faraday_connection) { instance_double(Faraday::Connection) }
  let(:faraday_response)   { instance_double(Faraday::Response) }

  before do
    allow(Faraday).to receive(:new).and_return(faraday_connection)
  end

  describe '.create_invoice' do
    let(:invoice_attrs) do
      {
        amount_cents: 10_000,
        order_id: "event-#{event.id}-user-#{user.id}-qty-1",
        event: event,
        quantity: 1,
        redirect_url: 'http://localhost:5173/events/1',
        webhook_url: 'http://localhost:3000/api/v1/payments/webhook'
      }
    end

    let(:success_body) do
      { 'pageUrl' => 'https://pay.monobank.ua/invoice/abc', 'invoiceId' => 'inv_123' }
    end

    before do
      allow(faraday_response).to receive(:body).and_return(success_body)
      allow(faraday_connection).to receive(:post).and_yield(
        double('req', headers: {}).tap { |r| allow(r).to receive(:body=) }
      ).and_return(faraday_response)
    end

    it 'returns pageUrl and invoiceId on success' do
      result = described_class.create_invoice(invoice_attrs)

      expect(result['pageUrl']).to eq('https://pay.monobank.ua/invoice/abc')
      expect(result['invoiceId']).to eq('inv_123')
    end

    it 'sends the correct amount in kopecks' do
      captured_body = nil
      allow(faraday_connection).to receive(:post) do |&block|
        req = double('req', headers: {})
        allow(req).to receive(:body=) { |b| captured_body = b }
        block.call(req)
        faraday_response
      end

      described_class.create_invoice(invoice_attrs)

      expect(captured_body[:amount]).to eq(10_000)
      expect(captured_body[:ccy]).to eq(MonobankService::CURRENCY_CODE)
    end

    it 'sets basket item qty, sum per unit, and total correctly for multiple tickets' do
      captured_body = nil
      allow(faraday_connection).to receive(:post) do |&block|
        req = double('req', headers: {})
        allow(req).to receive(:body=) { |b| captured_body = b }
        block.call(req)
        faraday_response
      end

      described_class.create_invoice(invoice_attrs.merge(amount_cents: 30_000, quantity: 3))

      item = captured_body.dig(:merchantPaymInfo, :basketOrder, 0)
      expect(item[:qty]).to eq(3)
      expect(item[:sum]).to eq(10_000)   # per unit
      expect(item[:total]).to eq(30_000) # total
    end

    it 'sets validity and currency code' do
      captured_body = nil
      allow(faraday_connection).to receive(:post) do |&block|
        req = double('req', headers: {})
        allow(req).to receive(:body=) { |b| captured_body = b }
        block.call(req)
        faraday_response
      end

      described_class.create_invoice(invoice_attrs)

      expect(captured_body[:validity]).to eq(MonobankService::INVOICE_VALIDITY)
      expect(captured_body[:ccy]).to eq(MonobankService::CURRENCY_CODE)
    end
  end

  describe '.verify_webhook_signature' do
    let(:raw_body)  { '{"status":"success"}' }
    let(:key_pair)  { OpenSSL::PKey::EC.generate('prime256v1') }
    let(:signature) { Base64.encode64(key_pair.sign('SHA256', raw_body)) }

    before do
      allow(described_class).to receive(:fetch_public_key).and_return(key_pair)
    end

    it 'returns true for a valid signature' do
      expect(described_class.verify_webhook_signature(raw_body, signature)).to be(true)
    end

    it 'returns false when X-Sign header is nil' do
      expect(described_class.verify_webhook_signature(raw_body, nil)).to be(false)
    end

    it 'returns false when X-Sign header is empty string' do
      expect(described_class.verify_webhook_signature(raw_body, '')).to be(false)
    end

    it 'returns false for a tampered body' do
      expect(described_class.verify_webhook_signature('{"status":"failure"}', signature)).to be(false)
    end

    it 'returns false for a malformed signature' do
      expect(described_class.verify_webhook_signature(raw_body, Base64.encode64('badsig'))).to be(false)
    end
  end

  describe '.fetch_public_key' do
    let(:key_pair)   { OpenSSL::PKey::EC.generate('prime256v1') }
    let(:pubkey_b64) { Base64.encode64(key_pair.to_pem) }

    around do |example|
      Rails.cache = ActiveSupport::Cache::MemoryStore.new
      example.run
      Rails.cache = ActiveSupport::Cache::NullStore.new
    end

    it 'fetches and caches the public key from Monobank API' do
      allow(faraday_connection).to receive(:get).and_yield(
        double('req', headers: {})
      ).and_return(
        instance_double(Faraday::Response,
                        success?: true,
                        body: { 'key' => pubkey_b64 },
                        status: 200)
      )

      key = described_class.fetch_public_key

      expect(key).to be_a(OpenSSL::PKey::EC)
      cached = Rails.cache.read(MonobankService::PUBLIC_KEY_CACHE_KEY)
      expect(cached.to_der).to eq(key.to_der)
    end

    it 'returns cached key without hitting the API again' do
      Rails.cache.write(MonobankService::PUBLIC_KEY_CACHE_KEY, key_pair)

      expect(faraday_connection).not_to receive(:get)

      result = described_class.fetch_public_key
      expect(result.to_der).to eq(key_pair.to_der)
    end
  end
end
