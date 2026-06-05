# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Api::V1::Auth', type: :request do
  path '/api/v1/auth/register' do
    post('Register a new user') do
      tags 'Auth'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :user_params, in: :body, schema: {
        type: :object,
        properties: {
          name: { type: :string, example: 'John Doe' },
          email: { type: :string, example: 'johndoe@example.com' },
          password: { type: :string, example: 'password123' }
        },
        required: %w[name email password]
      }

      response('201', 'user created — email verification sent') do
        let(:user_params) { { name: 'Test User', email: 'newuser@test.com', password: 'password123' } }
        run_test!
      end

      response('422', 'validation error — duplicate email') do
        before { User.create!(name: 'Existing', email: 'dupe@test.com', password: 'password123') }
        let(:user_params) { { name: 'Test User', email: 'dupe@test.com', password: 'password123' } }
        run_test!
      end
    end
  end

  path '/api/v1/auth/login' do
    post('Authenticate user and get JWT token') do
      tags 'Auth'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :credentials, in: :body, schema: {
        type: :object,
        properties: {
          email: { type: :string, example: 'johndoe@example.com' },
          password: { type: :string, example: 'password123' }
        },
        required: %w[email password]
      }

      response('200', 'successful login — returns JWT token and user') do
        let(:confirmed_user) do
          User.create!(name: 'Login User', email: 'login@test.com', password: 'password123', is_confirmed: true)
        end
        let(:credentials) { { email: confirmed_user.email, password: 'password123' } }
        run_test!
      end

      response('401', 'invalid email or password') do
        let(:credentials) { { email: 'wrong@mail.com', password: 'wrong_password' } }
        run_test!
      end

      response('403', 'email not confirmed') do
        let(:unconfirmed_user) do
          User.create!(name: 'Unconfirmed', email: 'unconfirmed@test.com', password: 'password123', is_confirmed: false)
        end
        let(:credentials) { { email: unconfirmed_user.email, password: 'password123' } }
        run_test!
      end
    end
  end

  path '/api/v1/auth/confirm_email' do
    post('Confirm user email address') do
      tags 'Auth'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :token_params, in: :body, schema: {
        type: :object,
        properties: {
          token: { type: :string, example: 'abc123verificationtoken' }
        },
        required: %w[token]
      }

      response('200', 'email confirmed successfully') do
        let(:unconfirmed_user) do
          User.create!(name: 'New User', email: 'confirm@test.com', password: 'password123', is_confirmed: false)
        end
        let(:token_params) { { token: unconfirmed_user.generate_token_for(:email_verification) } }
        run_test!
      end

      response('400', 'invalid or expired token') do
        let(:token_params) { { token: 'invalid_token' } }
        run_test!
      end
    end
  end

  path '/api/v1/auth/password/reset' do
    post('Request password reset OR set new password') do
      tags 'Auth'
      consumes 'application/json'
      produces 'application/json'

      parameter name: :reset_params, in: :body, schema: {
        type: :object,
        properties: {
          email: { type: :string, example: 'johndoe@example.com',
                   description: 'Required when requesting reset (no token)' },
          new_password: { type: :string, example: 'newsecurepassword',
                          description: 'Required when setting new password (with token)' }
        }
      }

      parameter name: :token, in: :query, schema: { type: :string }, required: false,
                description: 'Password reset token. When present — sets new password. When absent — sends reset email.'

      response('200', 'reset email sent (or email not found — prevents enumeration)') do
        let(:reset_user) { User.create!(name: 'Reset User', email: 'reset@test.com', password: 'password123') }
        let(:reset_params) { { email: reset_user.email } }
        let(:token) { nil }
        run_test!
      end

      response('200', 'password updated successfully') do
        let(:reset_user) { User.create!(name: 'Reset User', email: 'reset2@test.com', password: 'oldpassword') }
        let(:token) { reset_user.generate_token_for(:password_reset) }
        let(:reset_params) { { new_password: 'newpassword123' } }
        run_test!
      end

      response('400', 'invalid or expired reset token') do
        let(:token) { 'invalid_token' }
        let(:reset_params) { { new_password: 'newpassword123' } }
        run_test!
      end

      response('422', 'new password is blank') do
        let(:reset_user) { User.create!(name: 'Reset User', email: 'reset3@test.com', password: 'oldpassword') }
        let(:token) { reset_user.generate_token_for(:password_reset) }
        let(:reset_params) { { new_password: '' } }
        run_test!
      end
    end
  end
end
