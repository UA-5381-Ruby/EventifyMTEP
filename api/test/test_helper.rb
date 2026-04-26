# frozen_string_literal: true

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    def auth_headers(user)
      token = JwtService.encode(user_id: user.id)
      { 'Authorization' => "Bearer #{token}" }
    end

    # Add more helper methods to be used by all tests here...
  end
end
