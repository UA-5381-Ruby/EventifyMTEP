# frozen_string_literal: true

require 'test_helper'

class TicketsControllerTest < ActionDispatch::IntegrationTest
  setup do
    Api::V1::TicketsController.class_eval do
      def authenticate_user!; end
    end
    @user = create_user
    @ticket = create_ticket(user: @user)
  end

  test 'should allow review and update rating and comment' do
    patch "/api/v1/tickets/#{@ticket.id}/review", params: { ticket: { rating: 5, comment: 'Great event' } }, as: :json
    assert_response :ok
    @ticket.reload
    feedback = @ticket.event_feedback
    assert_not_nil feedback
    assert_equal 5, feedback.rating
    assert_equal 'Great event', feedback.comment
  end

  test 'should create ticket and return qr_code' do
    event = create_event
    user = @user
    Api::V1::TicketsController.class_eval do
      define_method(:current_user) { user }
    end

    post '/api/v1/tickets', params: { event_id: event.id }, as: :json

    assert_response :created
    body = response.parsed_body
    assert body.key?('qr_code')
    assert_not_nil body['qr_code']
  end

  test 'should not allow duplicate registration for same event' do
    event = @ticket.event
    user = @user
    Api::V1::TicketsController.class_eval do
      define_method(:current_user) { user }
    end

    post '/api/v1/tickets', params: { event_id: event.id }, as: :json

    assert_response :unprocessable_entity
    body = response.parsed_body
    assert body.key?('errors')
  end

  test 'should return my tickets' do
    user = @user
    Api::V1::TicketsController.class_eval do
      define_method(:current_user) { user }
    end

    get '/api/v1/tickets/my_tickets', as: :json

    assert_response :ok
    body = response.parsed_body
    assert_kind_of Array, body
    assert(body.any? { |t| t['id'] == @ticket.id })
  end

  private

  def create_user
    User.create!(
      name: 'testuser',
      email: 'test@example.com',
      password: 'password',
      is_superadmin: false
    )
  end

  def create_brand
    Brand.create!(
      name: 'Test Brand',
      subdomain: "test-brand-#{SecureRandom.hex(4)}"
    )
  end

  def create_category
    Category.create!(name: "Test Category #{SecureRandom.hex(4)}")
  end

  def create_event
    Event.create!(
      brand: create_brand,
      categories: [create_category],
      title: 'Test Event',
      location: 'Test Location',
      start_date: Time.current
    )
  end

  def create_ticket(user:)
    Ticket.create!(
      user: user,
      event: create_event,
      is_active: true
    )
  end
end
