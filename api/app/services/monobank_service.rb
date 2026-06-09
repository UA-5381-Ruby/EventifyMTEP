class MonobankService
  # TODO: Move to ENV vars
  BASE_URL = "https://api.monobank.ua"

  def self.create_invoice(amount_uah:, order_id:, redirect_url:, webhook_url:)
    conn = Faraday.new(url: BASE_URL) do |f|
      f.request  :json
      f.response :json
    end

    response = conn.post("/api/merchant/invoice/create") do |req|
      req.headers["X-Token"] = Rails.application.credentials.monobank[:api_token]
      req.body = {
        amount:      (amount_uah * 100).to_i,    # monobank uses kopecks
        ccy:         980,                        # 980 = UAH, default
        merchantPaymInfo: {
          reference: order_id.to_s,
          destination: "Ticket for event"
        },
        redirectUrl: redirect_url,
        webHookUrl:  webhook_url
      }
    end

    response.body
  end
end