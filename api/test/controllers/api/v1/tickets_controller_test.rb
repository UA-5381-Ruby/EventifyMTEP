# frozen_string_literal: true

require 'test_helper'

class TicketsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = create_test_user
    @event = create_event
    @ticket = create_ticket(user: @user, event: @event)
  end

  test 'should allow review and update rating and comment' do
    patch "/api/v1/tickets/#{@ticket.id}/review",
          params: { ticket: { rating: 5, comment: 'Great event' } },
          headers: auth_headers(@user),
          as: :json

    assert_response :ok
    assert_equal 5, @ticket.event_feedback.reload.rating
  end

  test 'should create ticket and return qr_code' do
    new_event = create_event
    assert_difference('Ticket.count') do
      post '/api/v1/tickets',
           params: { ticket: { event_id: new_event.id } },
           headers: auth_headers(@user),
           as: :json
    end

    assert_response :created
    assert response.parsed_body.key?('qr_code')
  end

  test 'should not allow duplicate registration for same event' do
    post '/api/v1/tickets',
         params: { ticket: { event_id: @event.id } },
         headers: auth_headers(@user),
         as: :json

    assert_response :unprocessable_content
    assert_includes response.parsed_body['errors'].join, 'already registered'
  end

  test 'should return my tickets' do
    other_user = create_test_user(email: "other-#{SecureRandom.hex(4)}@test.com")
    other_event = create_event
    other_ticket = create_ticket(user: other_user, event: other_event)

    get '/api/v1/my_tickets',
        headers: auth_headers(@user),
        as: :json

    assert_response :ok
    body = response.parsed_body
    assert(body.any? { |t| t['id'] == @ticket.id })
    refute(body.any? { |t| t['id'] == other_ticket.id })
  end

  private

  def create_event
    brand = Brand.create!(
      name: "Brand-#{SecureRandom.hex(4)}",
      subdomain: SecureRandom.hex(4)
    )
    Event.create!(
      brand: brand,
      categories: [Category.find_or_create_by!(name: 'Music')],
      title: "Event-#{SecureRandom.hex(4)}",
      location: 'Test Location',
      start_date: Time.current + 7.days
    )
  end

  def create_ticket(user:, event:)
    Ticket.create!(user: user, event: event, is_active: true)
  end
end
