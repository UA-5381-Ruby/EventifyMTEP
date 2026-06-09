# frozen_string_literal: true

class MonobankService
  # TODO: Move to ENV vars
  BASE_URL = 'https://api.monobank.ua'

  class << self
    def create_invoice(amount_uah:, order_id:, event:, redirect_url:, webhook_url:)
      response = connection.post('/api/merchant/invoice/create') do |req|
        req.headers['X-Token'] = Rails.application.credentials.monobank[:api_token]
        req.body = invoice_body(
          amount_uah: amount_uah,
          order_id: order_id,
          event: event,
          redirect_url: redirect_url,
          webhook_url: webhook_url
        )
      end

      response.body
    end

    private

    def connection
      Faraday.new(url: BASE_URL) do |f|
        f.request :json
        f.response :json
      end
    end

    def invoice_body(amount_uah:, order_id:, event:, redirect_url:, webhook_url:)
      amount_kop = (amount_uah * 100).to_i

      {
        amount: amount_kop,
        ccy: 980,
        merchantPaymInfo: {
          reference: order_id.to_s,
          destination: "Ticket for #{event.title}",
          comment: "Ticket for #{event.title}",
          basketOrder: [basket_item(event, amount_kop)]
        },
        redirectUrl: redirect_url.presence || 'http://localhost:5173/payment/callback',
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
