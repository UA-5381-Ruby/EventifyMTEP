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
              token: { type: :string },
              new_password: { type: :string, example: 'newpassword123' }
            },
            required: %w[token new_password]
          }
        ]
      }

      response '200', 'Reset email sent' do
        let(:request_body) { { email: user.email } }
        run_test!
      end

      response '200', 'Reset email sent (non-existent email)' do
        let(:request_body) { { email: 'unknown@example.com' } }
        run_test!
      end

      response '200', 'Password updated successfully' do
        let(:request_body) { { token: valid_token, new_password: 'newpassword123' } }
        run_test!
      end

      response '400', 'Invalid or expired token' do
        let(:request_body) { { token: 'invalid', new_password: 'newpassword123' } }
        run_test!
      end

      response '422', 'Validation error (blank password)' do
        let(:request_body) { { token: valid_token, new_password: '' } }
        run_test!
      end

      response '422', 'Validation error (short password)' do
        let(:request_body) { { token: valid_token, new_password: '123' } }
        run_test!
      end
    end
  end
end
