# frozen_string_literal: true

class MonobankService
  module Helpers
    private

    def extract_public_key(response)
      unless response.success? && response.body.is_a?(Hash)
        Rails.logger.error(
          'MonobankService#request_public_key_from_api failed: unexpected response= ' \
          "status=#{response.status} body=#{response.body.inspect}"
        )
        raise KeyError
      end

      pubkey = response.body.fetch('pubkey')
      raise KeyError if pubkey.blank?

      pubkey
    end

    def build_public_key(pubkey)
      decoded = Base64.decode64(pubkey)
      OpenSSL::PKey::EC.new(decoded)
    rescue OpenSSL::PKey::PKeyError
      # Try without decoding in case it's already a raw PEM
      OpenSSL::PKey::EC.new(pubkey)
    end

    def log_public_key_network_error(error, response)
      Rails.logger.error(
        "MonobankService#request_public_key_from_api network failure: #{error.class} - #{error.message}; " \
        "response_status=#{response&.status.inspect} response_body=#{response&.body.inspect}"
      )
    end

    def log_public_key_missing_error(error, response)
      Rails.logger.error(
        "MonobankService#request_public_key_from_api missing pubkey: #{error.class} - #{error.message}; " \
        "response_body=#{response&.body.inspect}"
      )
    end

    def log_public_key_format_error(error, pubkey)
      Rails.logger.error(
        "MonobankService#request_public_key_from_api invalid public key format: #{error.class} - #{error.message}; " \
        "pubkey=#{pubkey.inspect}"
      )
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

  extend Helpers

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

      signature = decode_signature(x_sign_header)
      perform_signature_verification(raw_body, signature)
    rescue StandardError => e
      Rails.logger.error("Webhook signature verification failed: #{e.class} - #{e.message}")
      false
    end

    def decode_signature(x_sign_header)
      Base64.decode64(x_sign_header)
    rescue StandardError => e
      Rails.logger.warn("Failed to decode X-Sign header: #{e.class} - #{e.message}")
      raise
    end

    def perform_signature_verification(raw_body, signature)
      public_key = fetch_public_key
      return false if public_key.nil?

      public_key.verify('SHA256', signature, raw_body)
    rescue OpenSSL::PKey::EC::Point::Error, OpenSSL::PKey::PKeyError => e
      Rails.logger.error("Signature verify error: #{e.class} - #{e.message}")
      retry_signature_verification(raw_body, signature)
    end

    def retry_signature_verification(raw_body, signature)
      clear_public_key_cache
      public_key = fetch_public_key
      public_key.verify('SHA256', signature, raw_body)
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

      pubkey = extract_public_key(response)
      build_public_key(pubkey)
    rescue Faraday::Error => e
      log_public_key_network_error(e, response)
      nil
    rescue NoMethodError, KeyError => e
      log_public_key_missing_error(e, response)
      nil
    rescue OpenSSL::PKey::PKeyError => e
      log_public_key_format_error(e, response&.body&.[]('pubkey'))
      nil
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
  end
end
