# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Api::V1::Passwords', type: :request, swagger_doc: 'v1/swagger.yaml' do
  let!(:user) { create(:user) }

  path '/api/v1/auth/password/reset' do
    post 'Request password reset email' do
      tags 'Auth'
      description 'Sends password reset instructions to the email address provided'
      consumes 'application/json'
      parameter name: :params, in: :body, schema: {
        type: :object,
        properties: {
          email: { type: :string, example: 'user@example.com' }
        },
        required: ['email']
      }

      response '200', 'Success message' do
        let(:params) { { email: user.email } }
        run_test!
      end

      response '200', 'Success message (non-existent email)' do
        let(:params) { { email: 'unknown@example.com' } }
        run_test!
      end
    end

    post 'Reset password with token' do
      tags 'Auth'
      description 'Sets a new password using the token received'
      consumes 'application/json'
      parameter name: :reset_params, in: :body, schema: {
        type: :object,
        properties: {
          token: { type: :string },
          new_password: { type: :string, example: 'newpassword123' }
        },
        required: %w[token new_password]
      }

      response '200', 'Password updated' do
        let(:token) { user.generate_token_for(:password_reset) }
        let(:reset_params) { { token: token, new_password: 'newpassword123' } }
        run_test!
      end

      response '400', 'Invalid or expired token' do
        let(:reset_params) { { token: 'invalid', new_password: 'newpassword123' } }
        run_test!
      end

      response '422', 'Validation error (blank password)' do
        let(:token) { user.generate_token_for(:password_reset) }
        let(:reset_params) { { token: token, new_password: '' } }
        run_test!
      end

      response '422', 'Validation error (short password)' do
        let(:token) { user.generate_token_for(:password_reset) }
        let(:reset_params) { { token: token, new_password: '123' } }
        run_test!
      end
    end
  end
end
