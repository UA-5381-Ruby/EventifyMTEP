# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Confirmations', type: :request do
  let(:user) { create(:user, is_confirmed: false) }

  describe 'POST /api/v1/auth/confirm_email' do
    it 'confirms user with valid token' do
      token = user.generate_token_for(:email_verification)

      post '/api/v1/auth/confirm_email', params: { token: token }, as: :json

      expect(response).to have_http_status(:ok)
      expect(user.reload.is_confirmed).to be(true)
    end

    it 'returns bad_request for invalid token' do
      post '/api/v1/auth/confirm_email', params: { token: 'invalid' }, as: :json

      expect(response).to have_http_status(:bad_request)
    end

    it 'returns unprocessable_content when update fails' do
      token = user.generate_token_for(:email_verification)
      allow_any_instance_of(User).to receive(:update).and_return(false)
      allow_any_instance_of(User).to receive_message_chain(:errors, :full_messages).and_return(['failed'])

      post '/api/v1/auth/confirm_email', params: { token: token }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body['errors']).to eq(['failed'])
    end
  end

  describe 'POST /api/v1/auth/resend_confirmation' do
    it 'resends confirmation email for unconfirmed user' do
      allow(MailerService).to receive(:send_email_verification)

      post '/api/v1/auth/resend_confirmation', params: { email: user.email }, as: :json

      expect(response).to have_http_status(:ok)
      expect(MailerService).to have_received(:send_email_verification).with(user)
    end

    it 'returns not_found for unknown email' do
      post '/api/v1/auth/resend_confirmation', params: { email: 'missing@example.com' }, as: :json

      expect(response).to have_http_status(:not_found)
    end

    it 'returns error when user is already confirmed' do
      confirmed = create(:user, :confirmed)

      post '/api/v1/auth/resend_confirmation', params: { email: confirmed.email }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
