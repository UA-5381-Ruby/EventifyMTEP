# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Api::V1::Passwords', type: :request, swagger_doc: 'v1/swagger.yaml' do
  let!(:user) { create(:user) }
  let(:valid_token) { user.generate_token_for(:password_reset) }

  path '/api/v1/auth/password/reset' do
    post 'Password reset operations' do
      tags 'Auth'
      consumes 'application/json'
      parameter name: :email, in: :body, required: false, schema: {
        type: :object,
        properties: {
          email: { type: :string, example: 'user@example.com' }
        },
        required: ['email']
      }

      parameter name: :reset_params, in: :body, required: false, schema: {
        type: :object,
        properties: {
          token: { type: :string },
          new_password: { type: :string, example: 'newpassword123' }
        },
        required: %w[token new_password]
      }

      response '200', 'Reset email sent' do
        let(:email) { { email: user.email } }
        run_test!
      end

      response '200', 'Reset email sent (non-existent email)' do
        let(:email) { { email: 'unknown@example.com' } }
        run_test!
      end

      response '200', 'Password updated successfully' do
        let(:reset_params) { { token: valid_token, new_password: 'newpassword123' } }
        run_test!
      end

      response '400', 'Invalid or expired token' do
        let(:reset_params) { { token: 'invalid', new_password: 'newpassword123' } }
        run_test!
      end

      response '422', 'Validation error (blank password)' do
        let(:reset_params) { { token: valid_token, new_password: '' } }
        run_test!
      end

      response '422', 'Validation error (short password)' do
        let(:reset_params) { { token: valid_token, new_password: '123' } }
        run_test!
      end
    end
  end
end
