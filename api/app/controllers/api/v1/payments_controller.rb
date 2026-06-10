# frozen_string_literal: true

module Api
  module V1
    class PaymentsController < ApplicationController
      # skip_before_action :verify_authenticity_token, only: [:webhook]

      def create
        event = Event.find(params[:event_id])

        result = MonobankService.create_invoice(
          # amount_uah:   event.price,
          amount_uah: 100, # UAH are converted to kopiykas in the service, so this is 100 UAH for testing
          order_id: "event-#{event.id}-user-#{current_user.id}",
          event: event,
          redirect_url: "#{ENV.fetch('FRONTEND_BASE_URL', nil)}/events/#{event.id}",
          webhook_url: "#{ENV.fetch('BACKEND_BASE_URL', nil)}/api/v1/payments/webhook"
        )

        if result['pageUrl']
          # Store invoice_id temporarily so we can match it in the webhook
          # We'll create the actual Ticket only after payment is confirmed
          render json: { pageUrl: result['pageUrl'], invoiceId: result['invoiceId'] }
        else
          render json: { error: result['errCode'] }, status: :unprocessable_entity
        end
      end

      def webhook
        payload = JSON.parse(request.raw_post)

        if payload['status'] == 'success'
          # Parse event_id and user_id back from the reference we set
          reference = payload['reference'] # "event-1-user-2"
          _, event_id, _, user_id = reference.split('-')

          user  = User.find(user_id)
          event = Event.find(event_id)

          user.tickets.create!(event: event)
        end

        head :ok
      end
    end
  end
end
