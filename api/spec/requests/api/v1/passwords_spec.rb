# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Passwords', type: :request do
  include ActiveJob::TestHelper
  include ActiveSupport::Testing::TimeHelpers

  let!(:user) { create(:user, email: 'user@example.com', password: 'CurrentPass123!') }

  before do
    ActionMailer::Base.deliveries.clear
    clear_enqueued_jobs
    clear_performed_jobs
  end

  describe 'POST /api/v1/auth/password/reset' do
    it 'returns a generic success message and enqueues reset email when user exists' do
      expect do
        post '/api/v1/auth/password/reset', params: { email: user.email }, as: :json
      end.to have_enqueued_job(ActionMailer::MailDeliveryJob)

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['message']).to include('If the account exists')
    end

    it 'returns the same generic success message when user does not exist' do
      expect do
        post '/api/v1/auth/password/reset', params: { email: 'missing@example.com' }, as: :json
      end.not_to have_enqueued_job(ActionMailer::MailDeliveryJob)

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['message']).to include('If the account exists')
    end
  end

  describe 'POST /api/v1/auth/password/reset?token=...' do
    it 'resets password for a valid token' do
      token = user.signed_id(purpose: :password_reset, expires_in: 2.days)

      post "/api/v1/auth/password/reset?token=#{CGI.escape(token)}",
           params: { new_password: 'NewSecurePass123!' }, as: :json

      expect(response).to have_http_status(:ok)
      expect(user.reload.authenticate('NewSecurePass123!')).to be_truthy
    end

    it 'returns error when token is tampered' do
      token = user.signed_id(purpose: :password_reset, expires_in: 2.days)

      post "/api/v1/auth/password/reset?token=#{CGI.escape("#{token}tampered")}",
           params: { new_password: 'NewSecurePass123!' }, as: :json

      expect(response).to have_http_status(:bad_request)
      expect(response.parsed_body['error']).to eq('Invalid or expired token')
    end

    it 'returns error when token is expired' do
      token = user.signed_id(purpose: :password_reset, expires_in: 2.days)

      travel 2.days + 1.second do
        post "/api/v1/auth/password/reset?token=#{CGI.escape(token)}",
             params: { new_password: 'NewSecurePass123!' }, as: :json
      end

      expect(response).to have_http_status(:bad_request)
      expect(response.parsed_body['error']).to eq('Invalid or expired token')
    end
  end
end
