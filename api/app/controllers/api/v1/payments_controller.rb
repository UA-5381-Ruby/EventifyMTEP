module Api
  module V1
    class PaymentsController < ApplicationController
      skip_before_action :verify_authenticity_token, only: [:webhook]

      def create
        event = Event.find(params[:event_id])

        result = MonobankService.create_invoice(
          amount_uah:   event.price,
          order_id:     "event-#{event.id}-user-#{current_user.id}",
          redirect_url: "#{ENV['FRONTEND_URL']}/payment/callback",
          webhook_url:  "#{ENV['BACKEND_URL']}/api/payments/webhook"
        )

        if result["pageUrl"]
          # Persist a pending order so you can match the webhook later
          Order.create!(
            user:       current_user,
            event:      event,
            invoice_id: result["invoiceId"],
            status:     "pending"
          )
          render json: { pageUrl: result["pageUrl"] }
        else
          render json: { error: result["errCode"] }, status: :unprocessable_entity
        end
      end

      def webhook
        body = request.raw_post

        # Optional but recommended: verify ECDSA signature
        # x_sign = request.headers["X-Sign"]
        # MonobankSignatureVerifier.verify!(body, x_sign)

        payload = JSON.parse(body)
        order   = Order.find_by!(invoice_id: payload["invoiceId"])

        order.update!(status: payload["status"])  # "success", "failure", "reversed"

        head :ok
      end
    end
  end
end