# frozen_string_literal: true

module Api
  module V1
    class PaymentsController < ApplicationController
      def create
        event = Event.find(params[:event_id])
        result = MonobankService.create_invoice(invoice_params(event))

        if result['pageUrl']
          render json: { pageUrl: result['pageUrl'], invoiceId: result['invoiceId'] }
        else
          render json: { error: result['errCode'] }, status: :unprocessable_entity
        end
      end

      def webhook
        payload = JSON.parse(request.raw_post)

        if payload['status'] == 'success'
          reference = payload['reference']
          _, event_id, _, user_id = reference.split('-')

          user  = User.find(user_id)
          event = Event.find(event_id)

          unless user.tickets.exists?(event: event)
            user.tickets.create!(event: event)
            # TicketMailer.confirmation(ticket).deliver_later
          end
        end

        head :ok
      end

      private

      def invoice_params(event)
        {
          amount_cents: event.price_cents,
          order_id: "event-#{event.id}-user-#{current_user.id}",
          event: event,
          redirect_url: "#{ENV.fetch('FRONTEND_BASE_URL', nil)}/events/#{event.id}",
          webhook_url: "#{ENV.fetch('BACKEND_BASE_URL', nil)}/api/v1/payments/webhook"
        }
      end
    end
  end
end
