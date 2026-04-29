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

      response('201', 'successfully registered') do
        let(:user_params) { { name: 'Test User', email: 'newuser@test.com', password: 'password123' } }
        run_test!
      end

      response('422', 'validation error (malformed attributes)') do
        let(:user_params) { { name: '', email: 'invalid_email', password: '123' } }
        run_test!
      end
    end
  end

  path '/api/v1/auth/login' do
    post('Authenticate user (get token)') do
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

      response('200', 'successful login') do
        let(:user) { User.create!(name: 'Login User', email: 'login@test.com', password: 'password123') }
        let(:credentials) { { email: user.email, password: 'password123' } }
        run_test!
      end

      response('401', 'invalid email or password') do
        let(:credentials) { { email: 'wrong@mail.com', password: 'wrong_password' } }
        run_test!
      end
    end
  end
end
