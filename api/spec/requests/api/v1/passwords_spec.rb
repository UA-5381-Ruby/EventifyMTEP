# frozen_string_literal: true

require 'rails_helper'
require 'cgi'

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

    it 'returns the same generic success message for invalid email format' do
      expect do
        post '/api/v1/auth/password/reset', params: { email: 'notanemail' }, as: :json
      end.not_to have_enqueued_job(ActionMailer::MailDeliveryJob)

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['message']).to include('If the account exists')
    end

    it 'delivers reset email with tokenized reset link' do
      perform_enqueued_jobs do
        post '/api/v1/auth/password/reset', params: { email: user.email }, as: :json
      end

      email = ActionMailer::Base.deliveries.last
      expect(email.to).to include(user.email)

      reset_link = email.body.encoded[%r{https?://\S+/reset\?token=\S+}]
      expect(reset_link).to be_present

      token = CGI.unescape(reset_link.split('token=').last)
      expect(User.find_signed(token, purpose: :password_reset)).to eq(user)
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

    it 'returns validation error for too-short password' do
      token = user.signed_id(purpose: :password_reset, expires_in: 2.days)

      post "/api/v1/auth/password/reset?token=#{CGI.escape(token)}",
           params: { new_password: 'short' }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body['error']).to include('Password is too short')
    end
  end
end
