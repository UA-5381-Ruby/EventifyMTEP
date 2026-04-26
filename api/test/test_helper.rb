# frozen_string_literal: true

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

module ActiveSupport
  class TestCase
    # Generate JWT token for tests
    def auth_headers(user)
      token = JwtService.encode(user_id: user.id)
      { 'Authorization' => "Bearer #{token}" }
    end

    # Create a test user
    def create_test_user(email: "user-#{SecureRandom.hex(4)}@test.com", name: 'Test User')
      User.find_or_create_by!(email: email) do |user|
        user.name = name
        user.password = 'password123'
      end
    end
  end
end
