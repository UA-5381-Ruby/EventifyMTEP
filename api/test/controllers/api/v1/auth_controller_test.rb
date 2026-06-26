# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    class AuthControllerTest < ActionDispatch::IntegrationTest
      def setup
        @confirmed_user = User.create!(
          name: 'Existing User',
          email: 'exist@test.com',
          password: 'password123',
          is_confirmed: true
        )
      end

      test 'should register a new user without returning JWT' do
        assert_difference('User.count', 1) do
          post '/api/v1/auth/register', params: {
            name: 'New User',
            email: 'new@test.com',
            password: 'password123'
          }, as: :json
        end

        assert_response :created
        json_response = JSON.parse(response.body)
        assert_nil json_response['token'], 'JWT token should NOT be present on registration'
        assert_includes json_response['message'], I18n.t('api.v1.auth.registered')
      end

      test 'should not register with duplicate email (Edge case)' do
        assert_no_difference('User.count') do
          post '/api/v1/auth/register', params: {
            name: 'Another User',
            email: @confirmed_user.email,
            password: 'password123'
          }, as: :json
        end

        assert_response :unprocessable_content
        json_response = JSON.parse(response.body)
        assert_includes json_response['errors'], 'Email has already been taken'
      end

      test 'should login successfully and return JWT' do
        post '/api/v1/auth/login', params: {
          email: @confirmed_user.email,
          password: 'password123'
        }, as: :json

        assert_response :success
        json_response = JSON.parse(response.body)
        assert_not_nil json_response['token'], 'JWT token should be present in response'
        assert_equal @confirmed_user.id, json_response['user']['id']
        assert_equal @confirmed_user.email, json_response['user']['email']
      end

      test 'should login successfully with email case variance' do
        post '/api/v1/auth/login', params: {
          email: @confirmed_user.email.upcase,
          password: 'password123'
        }, as: :json

        assert_response :success
        json_response = JSON.parse(response.body)
        assert_not_nil json_response['token'], 'JWT token should be present in response'
      end

      test 'should not login with invalid password (Edge case)' do
        post '/api/v1/auth/login', params: {
          email: @confirmed_user.email,
          password: 'wrong_password'
        }, as: :json

        assert_response :unauthorized
        json_response = JSON.parse(response.body)
        assert_equal I18n.t('api.v1.auth.invalid_credentials'), json_response['error']
      end

      test 'should not login with non-existent email (Edge case)' do
        post '/api/v1/auth/login', params: {
          email: 'ghost@test.com',
          password: 'password123'
        }, as: :json

        assert_response :unauthorized
        json_response = JSON.parse(response.body)
        assert_equal I18n.t('api.v1.auth.invalid_credentials'), json_response['error']
      end

      test 'should block unconfirmed user from logging in' do
        unconfirmed_user = User.create!(
          name: 'Unconfirmed User',
          email: 'unconfirmed@test.com',
          password: 'password123',
          is_confirmed: false
        )

        post '/api/v1/auth/login', params: {
          email: unconfirmed_user.email,
          password: 'password123'
        }, as: :json

        assert_response :forbidden
        json_response = JSON.parse(response.body)
        assert_equal I18n.t('api.v1.auth.email_not_confirmed'), json_response['error']
      end
    end
  end
end
