# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Passwords', type: :request do
  include ActiveSupport::Testing::TimeHelpers

  let!(:user) { create(:user) }

  describe 'POST /api/v1/auth/password/reset' do
    context 'with existing email' do
      it 'sends reset email and returns success' do
        expect do
          post '/api/v1/auth/password/reset', params: { email: user.email }, as: :json
        end.to have_enqueued_job(ActionMailer::MailDeliveryJob)

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['message']).to eq('If your email exists, you will receive reset instructions')
      end
    end

    context 'with non-existing email' do
      it 'returns success without sending email' do
        expect do
          post '/api/v1/auth/password/reset', params: { email: 'nonexistent@example.com' }, as: :json
        end.not_to have_enqueued_job(ActionMailer::MailDeliveryJob)

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['message']).to eq('If your email exists, you will receive reset instructions')
      end
    end
  end

  describe 'POST /api/v1/auth/password/reset?token=...' do
    let(:token) { user.generate_token_for(:password_reset) }

    context 'with valid token' do
      it 'updates password successfully' do
        post '/api/v1/auth/password/reset', params: { token: token, new_password: 'newpassword123' }, as: :json
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['message']).to eq('Password successfully updated')
        user.reload
        expect(user.authenticate('newpassword123')).to be_truthy
      end
    end

    context 'with expired token' do
      it 'returns error' do
        expired_token = travel_to(3.days.ago) { user.generate_token_for(:password_reset) }
        post '/api/v1/auth/password/reset', params: { token: expired_token, new_password: 'newpassword123' }, as: :json
        expect(response).to have_http_status(:bad_request)
        expect(response.parsed_body['error']).to eq('Invalid or expired token')
      end
    end

    context 'with invalid token' do
      it 'returns error' do
        post '/api/v1/auth/password/reset', params: { token: 'invalidtoken', new_password: 'newpassword123' }, as: :json
        expect(response).to have_http_status(:bad_request)
        expect(response.parsed_body['error']).to eq('Invalid or expired token')
      end
    end

    context 'with blank password' do
      it 'returns error' do
        post '/api/v1/auth/password/reset', params: { token: token, new_password: '' }, as: :json
        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end
end
