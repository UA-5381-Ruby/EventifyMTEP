# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Api::V1::Passwords', type: :request, swagger_doc: 'v1/swagger.yaml' do
  let!(:user) { create(:user) }
  let(:valid_token) { user.generate_token_for(:password_reset) }

  path '/api/v1/auth/password/reset' do
    post 'Password reset operations' do
      tags 'Auth'
      operationId 'password_reset'
      description 'Send email to request reset, or token and new_password to confirm.'
      consumes 'application/json'

      parameter name: :token, in: :query, required: false, schema: {
        type: :string,
        description: 'Password reset token (required for confirmation flow)'
      }

      parameter name: :request_body, in: :body, schema: {
        oneOf: [
          {
            type: :object,
            title: 'Password Reset Request',
            properties: {
              email: { type: :string, example: 'user@example.com' }
            },
            required: ['email']
          },
          {
            type: :object,
            title: 'Password Reset Confirmation',
            properties: {
              new_password: { type: :string, example: 'newpassword123' }
            },
            required: ['new_password']
          }
        ]
      }

      response '200', 'Reset email sent' do
        let(:token) { nil }
        let(:request_body) { { email: user.email } }
        run_test!
      end

      response '200', 'Reset email sent (non-existent email)' do
        let(:token) { nil }
        let(:request_body) { { email: 'unknown@example.com' } }
        run_test!
      end

      response '200', 'Password updated successfully' do
        let(:token) { valid_token }
        let(:request_body) { { new_password: 'newpassword123' } }
        run_test!
      end

      response '400', 'Invalid or expired token' do
        let(:token) { 'invalid' }
        let(:request_body) { { new_password: 'newpassword123' } }
        run_test!
      end

      response '422', 'Validation error (blank password)' do
        let(:token) { valid_token }
        let(:request_body) { { new_password: '' } }
        run_test!
      end

      response '422', 'Validation error (short password)' do
        let(:token) { valid_token }
        let(:request_body) { { new_password: '123' } }
        run_test!
      end
    end
  end

  path '/api/v1/auth/password/change' do
    let!(:user) { create(:user, password: 'oldpassword123') }

    patch 'Change password' do
      tags 'Auth'
      operationId 'password_change'
      description 'Change password for authenticated user. Requires valid JWT and current password.'
      consumes 'application/json'
      security [{ bearer_auth: [] }]

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :request_body, in: :body, schema: {
        type: :object,
        properties: {
          current_password: { type: :string, example: 'oldpassword123' },
          new_password: { type: :string, example: 'newpassword456' }
        },
        required: %w[current_password new_password]
      }

      response '200', 'Password changed successfully' do
        let(:request_body) { { current_password: 'oldpassword123', new_password: 'newpassword456' } }
        let(:Authorization) { "Bearer #{JwtService.encode(user_id: user.id)}" }
        run_test!
      end

      response '401', 'Wrong current password' do
        let(:request_body) { { current_password: 'wrongpassword', new_password: 'newpassword456' } }
        let(:Authorization) { "Bearer #{JwtService.encode(user_id: user.id)}" }
        run_test!
      end

      response '401', 'Missing or invalid JWT' do
        let(:request_body) { { current_password: 'oldpassword123', new_password: 'newpassword456' } }
        let(:Authorization) { 'Bearer invalid.token' }
        run_test!
      end

      response '422', 'Blank new password' do
        let(:request_body) { { current_password: 'oldpassword123', new_password: '' } }
        let(:Authorization) { "Bearer #{JwtService.encode(user_id: user.id)}" }
        run_test!
      end

      response '422', 'Blank current password' do
        let(:request_body) { { current_password: '', new_password: 'newpassword456' } }
        let(:Authorization) { "Bearer #{JwtService.encode(user_id: user.id)}" }
        run_test!
      end

      response '422', 'Validation error (password too short)' do
        let(:request_body) { { current_password: 'oldpassword123', new_password: '123' } }
        let(:Authorization) { "Bearer #{JwtService.encode(user_id: user.id)}" }
        run_test!
      end
    end
  end
end
