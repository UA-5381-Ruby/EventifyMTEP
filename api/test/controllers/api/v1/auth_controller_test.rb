# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    class AuthControllerTest < ActionDispatch::IntegrationTest
      def setup
        @existing_user = User.create(name: 'Existing User', email: 'exist@test.com', password: 'password123')
      end

      test 'should register a new user and return JWT' do
        assert_difference('User.count', 1) do
          post '/api/v1/auth/register', params: {
            name: 'New User',
            email: 'new@test.com',
            password: 'password123',
            password_confirmation: 'password123'
          }, as: :json
        end

        assert_response :created # 201

        json_response = JSON.parse(response.body)
        assert_not_nil json_response['token'], 'JWT token should be present in response'
        assert_equal 'new@test.com', json_response['user']['email']
      end

      test 'should not register with duplicate email (Edge case)' do
        assert_no_difference('User.count') do
          post '/api/v1/auth/register', params: {
            name: 'Another User',
            email: @existing_user.email,
            password: 'password123',
            password_confirmation: 'password123'
          }, as: :json
        end

        assert_response :unprocessable_entity # 422

        json_response = JSON.parse(response.body)
        assert_includes json_response['errors'], 'Email has already been taken'
      end

      test 'should login successfully and return JWT' do
        post '/api/v1/auth/login', params: {
          email: @existing_user.email,
          password: 'password123'
        }, as: :json

        assert_response :success # 200

        json_response = JSON.parse(response.body)
        assert_not_nil json_response['token'], 'JWT token should be present in response'
      end

      test 'should not login with invalid password (Edge case)' do
        post '/api/v1/auth/login', params: {
          email: @existing_user.email,
          password: 'wrong_password'
        }, as: :json

        assert_response :unauthorized # 401

        json_response = JSON.parse(response.body)
        assert_equal 'Invalid email or password', json_response['error']
      end
    end
  end
end
