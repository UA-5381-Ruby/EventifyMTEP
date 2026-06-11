# frozen_string_literal: true

module Api
  module V1
    class PaymentsController < ApplicationController
      skip_before_action :authorize_request, only: [:webhook]

      def create
        event = Event.find(params[:event_id])

        error_response = validate_event_for_purchase(event)
        return error_response if error_response

        create_and_render_invoice(event)
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Event not found' }, status: :not_found
      rescue StandardError => e
        Rails.logger.error("Payment creation failed: #{e.message}")
        render json: { error: 'Payment service unavailable' }, status: :service_unavailable
      end

      def webhook
        payload = handle_webhook_payload
        return payload if payload.is_a?(ActionDispatch::Response)

        return head :ok unless payload['status'] == 'success'

        error_response = process_successful_payment(payload)
        return error_response if error_response

        head :ok
      end

      private

      def handle_webhook_payload
        signature_result = verify_production_webhook_signature
        return signature_result if signature_result.is_a?(ActionDispatch::Response)

        parse_webhook_payload
      end

      def parse_dev_webhook_payload
        JSON.parse(request.raw_post)
      rescue JSON::ParserError
        render json: { error: 'Invalid JSON' }, status: :bad_request
      end

      def verify_production_webhook_signature
        x_sign_header = request.headers['X-Sign']
        return nil if MonobankService.verify_webhook_signature(request.raw_post, x_sign_header)

        render json: { error: 'Invalid signature' }, status: :unauthorized
      end

      def parse_webhook_payload
        JSON.parse(request.raw_post)
      rescue JSON::ParserError
        render json: { error: 'Invalid JSON' }, status: :bad_request
      end

      def validate_event_for_purchase(event)
        unless event.published?
          return render json: { error: 'Event not available for purchase' }, status: :unprocessable_entity
        end

        if current_user.tickets.exists?(event: event)
          return render json: { error: 'You already have a ticket for this event' }, status: :unprocessable_entity
        end

        nil
      end

      def create_and_render_invoice(event)
        result = MonobankService.create_invoice(**invoice_params(event))

        if result['pageUrl']
          render json: { pageUrl: result['pageUrl'], invoiceId: result['invoiceId'] }
        else
          render json: { error: result['errCode'] || 'Invoice creation failed' }, status: :unprocessable_entity
        end
      end

      def process_successful_payment(payload)
        reference = payload['reference']
        parts = reference.split('-')
        return render json: { error: 'Invalid reference format' }, status: :bad_request if parts.length < 4

        _, event_id, _, user_id = parts

        user = User.find_by(id: user_id)
        return render json: { error: 'User not found' }, status: :not_found unless user

        event = Event.find_by(id: event_id)
        return render json: { error: 'Event not found' }, status: :not_found unless event

        create_ticket_for_user_and_event(user, event)
      end

      def create_ticket_for_user_and_event(user, event)
        begin
          ticket = nil
          ActiveRecord::Base.transaction do
            ticket = user.tickets.create!(event: event)
            event.decrement!(:available_tickets_count) if event.available_tickets_count.positive?
          end
        rescue ActiveRecord::RecordNotUnique
          return
        end

        nil
      end

      def invoice_params(event)
        raise ArgumentError, 'Cannot create invoice for free event' if event.price_cents.negative?

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
