# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Api::V1::Users', type: :request do
  path '/api/v1/users' do
    get('Get a list of all users') do
      tags 'Users'
      security [{ bearer_auth: [] }]
      produces 'application/json'

      parameter name: :Authorization, in: :header, type: :string, required: true, description: 'JWT Token'

      response('200', 'successful') do
        let(:admin) do
          User.create!(name: 'Admin', email: 'admin_index@test.com', password: 'password123', is_superadmin: true)
        end
        let(:Authorization) { "Bearer #{JwtService.encode(user_id: admin.id)}" }
        run_test!
      end

      response('401', 'missing or invalid token') do
        let(:Authorization) { '' }
        run_test!
      end
    end
  end

  path '/api/v1/users/{id}' do
    parameter name: :id, in: :path, type: :integer, description: 'User ID'

    parameter name: :Authorization, in: :header, type: :string, required: true, description: 'JWT Token'

    get('View user profile') do
      tags 'Users'
      security [{ bearer_auth: [] }]
      produces 'application/json'

      response('200', 'successfully found') do
        let(:user) { User.create!(name: 'User Show', email: 'show@test.com', password: 'password123') }
        let(:id) { user.id }
        let(:Authorization) { "Bearer #{JwtService.encode(user_id: user.id)}" }
        run_test!
      end

      response('404', 'user not found') do
        let(:user) { User.create!(name: 'User', email: 'random@test.com', password: 'password123') }
        let(:id) { 999_999 }
        let(:Authorization) { "Bearer #{JwtService.encode(user_id: user.id)}" }
        run_test!
      end
    end

    patch('Update user data') do
      tags 'Users'
      security [{ bearer_auth: [] }]
      consumes 'application/json'
      produces 'application/json'

      parameter name: :user_params, in: :body, schema: {
        type: :object,
        properties: {
          name: { type: :string, example: 'Updated Name' },
          email: { type: :string, example: 'updated@example.com' },
          password: { type: :string, example: 'newpassword123' }
        }
      }

      response('200', 'successfully updated') do
        let(:user) { User.create!(name: 'Old Name', email: 'update@test.com', password: 'password123') }
        let(:id) { user.id }
        let(:Authorization) { "Bearer #{JwtService.encode(user_id: user.id)}" }
        let(:user_params) { { name: 'New Name' } }
        run_test!
      end
    end

    delete('Delete user') do
      tags 'Users'
      security [{ bearer_auth: [] }]

      response('204', 'successfully deleted (no content)') do
        let(:user) { User.create!(name: 'To Delete', email: 'delete@test.com', password: 'password123') }
        let(:id) { user.id }
        let(:Authorization) { "Bearer #{JwtService.encode(user_id: user.id)}" }
        run_test!
      end
    end
  end
end
