# frozen_string_literal: true

module Api
  module V1
    # rubocop:disable Metrics/ClassLength
    class PaymentsController < ApplicationController
      skip_before_action :authorize_request, only: [:webhook]
      before_action :require_authentication!, only: [:create]

      def create
        event = Event.find(params[:event_id])
        quantity = params.fetch(:quantity, 1).to_i.clamp(1, 10) # A reasonable limit against resellers

        error_response = validate_event_for_purchase(event, quantity)
        return error_response if error_response

        create_and_render_invoice(event, quantity)
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Event not found' }, status: :not_found
      rescue StandardError => e
        Rails.logger.error("Payment creation failed: #{e.message}")
        render json: { error: 'Payment service unavailable' }, status: :service_unavailable
      end

      def webhook
        return unless verify_production_webhook_signature?

        payload = parse_webhook_payload
        return if payload.is_a?(ActionDispatch::Response)
        return head :ok unless payload['status'] == 'success'

        result = process_successful_payment(payload)
        head :ok unless result == false
      end

      private

      def handle_webhook_payload
        signature_result = verify_production_webhook_signature?
        return signature_result if signature_result.is_a?(ActionDispatch::Response)

        parse_webhook_payload
      end

      def parse_dev_webhook_payload
        JSON.parse(request.raw_post)
      rescue JSON::ParserError
        render json: { error: 'Invalid JSON' }, status: :bad_request
      end

      def verify_production_webhook_signature?
        x_sign_header = request.headers['X-Sign']
        if MonobankService.verify_webhook_signature(request.raw_post, x_sign_header)
          true
        else
          render json: { error: 'Invalid signature' }, status: :unauthorized
          false
        end
      end

      def parse_webhook_payload
        JSON.parse(request.raw_post)
      rescue JSON::ParserError
        render json: { error: 'Invalid JSON' }, status: :bad_request
      end

      def validate_event_for_purchase(event, quantity)
        unless event.published?
          return render json: { error: 'Event not available for purchase' }, status: :unprocessable_entity
        end

        if event.available_tickets_count < quantity
          return render json: { error: 'Not enough tickets available' }, status: :unprocessable_entity
        end

        nil
      end

      def process_successful_payment(payload)
        reference = payload['reference']
        match = reference.match(/event-(\d+)-user-(\d+)-qty-(\d+)/)
        unless match
          render json: { error: 'Invalid reference format' }, status: :bad_request
          return false
        end

        event_id, user_id, quantity = match.captures
        quantity = quantity.to_i

        user  = User.find_by(id: user_id)
        event = Event.find_by(id: event_id)

        unless user
          render json: { error: 'User not found' }, status: :not_found
          return false
        end

        unless event
          render json: { error: 'Event not found' }, status: :not_found
          return false
        end

        create_tickets_for_user_and_event(user, event, quantity, payload['invoiceId'])
      end

      def create_tickets_for_user_and_event(user, event, quantity, invoice_id)
        cache_key = "processed_invoice_#{invoice_id}"
        return if Rails.cache.exist?(cache_key)

        tickets = []
        ActiveRecord::Base.transaction do
          quantity.times { tickets << user.tickets.create!(event: event) }
          event.decrement!(:available_tickets_count, quantity)
        end

        Rails.cache.write(cache_key, true, expires_in: 24.hours)
        tickets.each { |ticket| MailerService.send_ticket_confirmation(ticket) }
      rescue ActiveRecord::RecordInvalid => e
        Rails.logger.error("Ticket creation failed: #{e.message}")
      end

      def create_and_render_invoice(event, quantity)
        result = MonobankService.create_invoice(**invoice_params(event, quantity))

        if result['pageUrl']
          render json: { pageUrl: result['pageUrl'], invoiceId: result['invoiceId'] }
        else
          render json: { error: result['errCode'] || 'Invoice creation failed' }, status: :unprocessable_entity
        end
      end

      def invoice_params(event, quantity)
        raise ArgumentError, 'Cannot create invoice for free event' if event.price_cents.negative?

        {
          amount_cents: event.price_cents * quantity,
          order_id: "event-#{event.id}-user-#{current_user.id}-qty-#{quantity}",
          event: event,
          quantity: quantity,
          redirect_url: "#{ENV.fetch('FRONTEND_BASE_URL', nil)}/events/#{event.id}",
          webhook_url: "#{ENV.fetch('BACKEND_BASE_URL', nil)}/api/v1/payments/webhook"
        }
      end
    end
    # rubocop:enable Metrics/ClassLength
  end
end
