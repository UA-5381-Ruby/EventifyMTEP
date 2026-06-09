# frozen_string_literal: true

class MonobankService
  # TODO: Move to ENV vars
  BASE_URL = "https://api.monobank.ua"

  def self.create_invoice(amount_uah:, order_id:, event:, redirect_url:, webhook_url:)
    conn = Faraday.new(url: BASE_URL) do |f|
      f.request  :json
      f.response :json
    end

    # This is Monobank's API route, not our app's route.
    response = conn.post("/api/merchant/invoice/create") do |req|
      req.headers["X-Token"] = Rails.application.credentials.monobank[:api_token]
      req.body = {
        # Monobank API expects amount in kopiykas (1 UAH = 100 kopiykas)
        amount: (amount_uah * 100).to_i,
        ccy: 980,
        merchantPaymInfo: {
          reference: order_id.to_s,
          destination: "Ticket for #{event.title}",
          comment: "Ticket for #{event.title}",
          basketOrder: [
            {
              name: event.title,
              qty: 1,
              sum: (amount_uah * 100).to_i,
              total: (amount_uah * 100).to_i,
              unit: "шт."
            }
          ]
        },
        # redirectUrl: redirect_url,
        redirectUrl: "http://localhost:5173/payment/callback",  # temporary hardcoded for testing, replace with redirect_url in production
        # webHookUrl: webhook_url,
        validity: 3600
      }
    end

    response.body
  end
end