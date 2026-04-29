# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Api::V1::Tickets', type: :request do
  # Використовуємо FactoryBot для швидкого створення базових даних
  let(:user) { create(:user) }
  let(:event) { create(:event) }

  # Створюємо квиток. SecureRandom гарантує, що qr_code завжди буде унікальним
  let(:ticket) do
    Ticket.create!(
      user: user,
      event: event,
      qr_code: "test-qr-#{SecureRandom.hex(4)}",
      is_active: true
    )
  end

  # Ваша магія з JWT токенами!
  let(:headers) { auth_headers(user) }

  describe 'PATCH /api/v1/tickets/:id/review' do
    let(:valid_params) do
      {
        ticket: {
          rating: 5,
          comment: 'Great event'
        }
      }
    end

    it 'allows review and updates rating and comment' do
      patch "/api/v1/tickets/#{ticket.id}/review",
            params: valid_params,
            headers: headers,
            as: :json

      # Перевіряємо статус
      expect(response).to have_http_status(:ok)

      # Перевіряємо, чи зберігся фідбек у базу даних
      ticket.reload
      feedback = ticket.event_feedback

      expect(feedback).not_to be_nil
      expect(feedback.rating).to eq(5)
      expect(feedback.comment).to eq('Great event')
    end
  end
end
