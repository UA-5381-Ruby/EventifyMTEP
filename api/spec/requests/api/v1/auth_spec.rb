# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Auth Endpoints', type: :request do
  include ActiveSupport::Testing::TimeHelpers

  before do
    ENV['FRONTEND_URL'] = 'http://localhost:5173'
  end

  describe 'POST /api/v1/auth/register' do
    let(:params) do
      {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }
    end

    it 'creates a new user and does not return JWT token' do
      post '/api/v1/auth/register', params: { user: params }

      expect(response).to have_http_status(:created)
      expect(json_response[:token]).to be_nil
      expect(json_response[:message]).to include(I18n.t('api.v1.auth.registered'))
    end

    it 'queues the email verification mailer' do
      expect do
        post '/api/v1/auth/register', params: { user: params }
      end.to have_enqueued_job(ActionMailer::MailDeliveryJob)
    end

    it 'returns error when email is duplicate' do
      create(:user, email: 'test@example.com')
      post '/api/v1/auth/register', params: { user: params }

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_response[:errors]).to be_present
    end
  end

  describe 'POST /api/v1/auth/login' do
    let(:user) { create(:user, is_confirmed: true) }

    it 'allows confirmed users to log in' do
      post '/api/v1/auth/login', params: { email: user.email, password: user.password }

      expect(response).to have_http_status(:ok)
      expect(json_response[:token]).to be_present
      expect(json_response[:user]).to include('id' => user.id)
    end

    it 'blocks unconfirmed users from logging in' do
      unconfirmed_user = create(:user, is_confirmed: false)
      post '/api/v1/auth/login', params: { email: unconfirmed_user.email, password: unconfirmed_user.password }

      expect(response).to have_http_status(:forbidden)
      expect(json_response[:error]).to eq(I18n.t('api.v1.auth.email_not_confirmed'))
    end

    it 'returns error for invalid credentials' do
      post '/api/v1/auth/login', params: { email: user.email, password: 'wrong' }

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/auth/confirm_email' do
    let(:user) { create(:user, is_confirmed: false) }

    it 'confirms the user email with valid token' do
      token = user.generate_token_for(:email_verification)
      post '/api/v1/auth/confirm_email', params: { token: token }

      expect(response).to have_http_status(:ok)
      expect(user.reload.is_confirmed).to be_truthy
    end

    it 'returns error for invalid token' do
      post '/api/v1/auth/confirm_email', params: { token: 'invalid' }

      expect(response).to have_http_status(:bad_request)
      expect(json_response[:error]).to eq(I18n.t('api.v1.auth.confirmation.invalid_or_expired'))
    end

    it 'returns error for expired token' do
      user = create(:user, is_confirmed: false)
      token = user.generate_token_for(:email_verification)

      travel_to(25.hours.from_now) do
        post '/api/v1/auth/confirm_email', params: { token: token }
      end

      expect(response).to have_http_status(:bad_request)
    end
  end
end

RSpec.describe 'Password Reset Endpoints', type: :request do
  include ActiveSupport::Testing::TimeHelpers

  before do
    ENV['FRONTEND_URL'] = 'http://localhost:5173'
  end

  describe 'POST /api/v1/auth/password/reset' do
    let(:user) { create(:user) }

    it 'queues the reset password mailer for existing user' do
      expect do
        post '/api/v1/auth/password/reset', params: { email: user.email }
      end.to have_enqueued_job(ActionMailer::MailDeliveryJob)
    end

    it 'returns generic message for non-existent email' do
      post '/api/v1/auth/password/reset', params: { email: 'nonexistent@example.com' }

      expect(response).to have_http_status(:ok)
      expect(json_response[:message]).to eq(I18n.t('api.v1.auth.password.reset_requested'))
    end

    it 'always returns 200 OK (prevents user enumeration)' do
      post '/api/v1/auth/password/reset', params: { email: 'any@example.com' }

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST /api/v1/auth/password/reset?token=...' do
    let(:user) { create(:user, password: 'oldpassword') }

    it 'updates password with valid token' do
      token = user.generate_token_for(:password_reset)
      post "/api/v1/auth/password/reset?token=#{token}", params: { new_password: 'newpassword' }

      expect(response).to have_http_status(:ok)
      expect(user.reload.authenticate('newpassword')).to be_truthy
    end

    it 'returns error for invalid token' do
      post '/api/v1/auth/password/reset?token=invalid', params: { new_password: 'newpassword' }

      expect(response).to have_http_status(:bad_request)
    end

    it 'returns error for blank password' do
      token = user.generate_token_for(:password_reset)
      post "/api/v1/auth/password/reset?token=#{token}", params: { new_password: '' }

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_response[:error]).to eq(I18n.t('api.v1.auth.password.new_password_blank'))
    end
  end
end

def json_response
  JSON.parse(response.body).with_indifferent_access
end
