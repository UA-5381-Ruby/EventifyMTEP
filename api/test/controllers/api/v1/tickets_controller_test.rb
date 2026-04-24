# frozen_string_literal: true

require 'test_helper'

class TicketsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @ticket = create_ticket

    token = JwtService.encode(user_id: @ticket.user_id)
    @headers = { 'Authorization' => "Bearer #{token}" }
  end

  test 'should allow review and update rating and comment' do
    patch "/api/v1/tickets/#{@ticket.id}/review", params: { ticket: { rating: 5, comment: 'Great event' } },
                                                  headers: @headers, as: :json
    assert_response :ok

    @ticket.reload

    feedback = @ticket.event_feedback

    assert_not_nil feedback, 'EventFeedback record should have been created'
    assert_equal 5, feedback.rating
    assert_equal 'Great event', feedback.comment
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
      subdomain: 'test-brand'
    )
  end

  def create_category
    Category.create!(name: 'Test Category')
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

  def create_ticket
    Ticket.create!(
      user: create_user,
      event: create_event,
      qr_code: 'test-qr-123',
      is_active: true
    )
  end
end
