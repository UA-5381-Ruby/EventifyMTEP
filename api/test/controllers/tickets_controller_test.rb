# frozen_string_literal: true

require 'test_helper'

class TicketsControllerTest < ActionDispatch::IntegrationTest
  setup do
    # Bypass authentication for controller tests
    Api::V1::TicketsController.class_eval do
      def authenticate_user!; end
    end

    @user = User.create!(username: 'testuser', email: 'test@example.com', password: 'password', is_admin: false)
    @brand = Brand.create!(name: 'Test Brand', subdomain: 'test-brand')
    @category = Category.create!(name: 'Test Category')
    @event = Event.create!(brand: @brand, category: @category, title: 'Test Event', start_date: Time.zone.now)
    @ticket = Ticket.create!(user: @user, event: @event, is_active: true)
  end

  test 'should allow review and update rating and comment' do
    patch "/api/v1/tickets/#{@ticket.id}/review", params: { ticket: { rating: 5, comment: 'Great event' } }, as: :json
    assert_response :ok

    @ticket.reload
    assert_equal 5, @ticket.rating
    assert_equal 'Great event', @ticket.comment
  end
end
