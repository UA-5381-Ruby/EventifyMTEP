# frozen_string_literal: true

class MonobankService
  class << self
    def create_invoice(amount_cents:, order_id:, event:, redirect_url:, webhook_url:)
      response = connection.post('/api/merchant/invoice/create') do |req|
        req.headers['X-Token'] = Rails.application.credentials.monobank[:api_token]
        req.body = invoice_body(
          amount_cents: amount_cents,
          order_id: order_id,
          event: event,
          redirect_url: redirect_url,
          webhook_url: webhook_url
        )
      end

      response.body
    end

    def verify_webhook_signature(raw_body, x_sign_header)
      return false if x_sign_header.blank?

      signature = Base64.decode64(x_sign_header)
      public_key = fetch_public_key

      public_key.verify('SHA256', signature, raw_body)
    rescue OpenSSL::PKey::EC::Point::Error, OpenSSL::PKey::PKeyError
      # Attempt to refresh the cached key and retry once
      clear_public_key_cache
      public_key = fetch_public_key
      public_key.verify('SHA256', signature, raw_body)
    rescue StandardError
      false
    end

    def fetch_public_key
      cached_key = Rails.cache.read('monobank_public_key')
      return cached_key if cached_key.present?

      public_key = request_public_key_from_api
      Rails.cache.write('monobank_public_key', public_key, expires_in: 24.hours)
      public_key
    end

    def request_public_key_from_api
      response = connection.get('/api/merchant/pubkey') do |req|
        req.headers['X-Token'] = Rails.application.credentials.monobank[:api_token]
      end
      OpenSSL::PKey::EC.new(response.body['pubkey'])
    end

    def clear_public_key_cache
      Rails.cache.delete('monobank_public_key')
    end

    private

    def connection
      Faraday.new(url: ENV.fetch('MONOBANK_BASE_URL', nil)) do |f|
        f.request :json
        f.response :json
      end
    end

    def invoice_body(amount_cents:, order_id:, event:, redirect_url:, webhook_url:)
      {
        amount: amount_cents,
        ccy: 980,
        merchantPaymInfo: {
          reference: order_id.to_s,
          destination: "Ticket for #{event.title}",
          comment: "Ticket for #{event.title}",
          basketOrder: [basket_item(event, amount_cents)]
        },
        redirectUrl: redirect_url,
        webHookUrl: webhook_url.presence,
        validity: 3600
      }
    end

    def basket_item(event, amount_kop)
      {
        name: event.title,
        qty: 1,
        sum: amount_kop,
        total: amount_kop,
        unit: 'шт.'
      }
    end
  end
end
