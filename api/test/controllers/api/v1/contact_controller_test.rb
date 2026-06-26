# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    class ContactControllerTest < ActionDispatch::IntegrationTest
      include ActiveJob::TestHelper

      def setup
        @valid_params = {
          contact: {
            name: 'Jane Doe',
            email: 'jane@example.com',
            subject: 'Hello',
            message: 'This is a test message.'
          }
        }
      end

      test 'should send contact message with valid params' do
        perform_enqueued_jobs do
          post '/api/v1/contact', params: @valid_params, as: :json
        end

        assert_response :success
        json_response = JSON.parse(response.body)
        assert_equal 'Message sent successfully', json_response['message']

        assert_equal 1, ActionMailer::Base.deliveries.size
        mail = ActionMailer::Base.deliveries.last
        assert_equal ['support@eventify.com'], mail.to
        assert_equal ['jane@example.com'], mail.reply_to
        assert_equal '[Contact] Hello', mail.subject
      end

      test 'should pass permitted params to the mailer' do
        perform_enqueued_jobs do
          post '/api/v1/contact', params: @valid_params, as: :json
        end

        assert_response :success

        mail = ActionMailer::Base.deliveries.last
        assert_equal '[Contact] Hello', mail.subject
        assert_equal ['jane@example.com'], mail.reply_to
        assert_match 'Jane Doe', mail.body.encoded
        assert_match 'This is a test message.', mail.body.encoded
      end

      test 'should reject blank name (Edge case)' do
        @valid_params[:contact][:name] = ''

        post '/api/v1/contact', params: @valid_params, as: :json

        assert_response :unprocessable_content
        assert_equal 'Invalid parameters', JSON.parse(response.body)['error']
      end

      test 'should reject invalid email format (Edge case)' do
        @valid_params[:contact][:email] = 'not-an-email'

        post '/api/v1/contact', params: @valid_params, as: :json

        assert_response :unprocessable_content
        assert_equal 'Invalid parameters', JSON.parse(response.body)['error']
      end

      test 'should reject blank subject (Edge case)' do
        @valid_params[:contact][:subject] = ''

        post '/api/v1/contact', params: @valid_params, as: :json

        assert_response :unprocessable_content
        assert_equal 'Invalid parameters', JSON.parse(response.body)['error']
      end

      test 'should reject blank message (Edge case)' do
        @valid_params[:contact][:message] = ''

        post '/api/v1/contact', params: @valid_params, as: :json

        assert_response :unprocessable_content
        assert_equal 'Invalid parameters', JSON.parse(response.body)['error']
      end

      test 'should not enqueue mailer job when params are invalid' do
        @valid_params[:contact][:message] = ''

        assert_no_enqueued_jobs do
          post '/api/v1/contact', params: @valid_params, as: :json
        end
      end

      test 'should not require authentication to submit contact form' do
        post '/api/v1/contact', params: @valid_params, as: :json

        assert_response :success
      end
    end
  end
end
