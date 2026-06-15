# frozen_string_literal: true

require 'simplecov'
SimpleCov.start 'rails' do
  command_name 'Minitest'
  add_filter '/bin/'
  add_filter '/db/'
  add_filter '/test/' # Exclude test files from coverage
end

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
      token = JwtService.encode(user_id: user.id, password_salt: user.password_salt)
      { 'Authorization' => "Bearer #{token}" }
    end

    # Add more helper methods to be used by all tests here...
  end
end

if Rails.env.test?
  module S3BucketServiceTestStub
    def upload_body(_body, folder:, extension:, **)
      "#{folder}/#{SecureRandom.uuid}#{extension}"
    end
  end

  S3BucketService.prepend(S3BucketServiceTestStub)
end
