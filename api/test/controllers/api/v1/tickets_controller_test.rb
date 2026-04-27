# frozen_string_literal: true

require 'test_helper'

class TicketsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = create_user
    @ticket = create_ticket(user: @user)
  end

  test 'should allow review and update rating and comment' do
    patch_with_auth "/api/v1/tickets/#{@ticket.id}/review",
                    @user,
                    params: { ticket: { rating: 5, comment: 'Great event' } }

    assert_response :ok
    assert_equal 5, @ticket.event_feedback.reload.rating
  end

  test 'should create ticket and return qr_code' do
    event = create_event

    post_with_auth '/api/v1/tickets', @user, params: { ticket: { event_id: event.id } }

    assert_response :created
    assert response.parsed_body.key?('qr_code')
  end

  test 'should not allow duplicate registration for same event' do
    event = @ticket.event

    post_with_auth '/api/v1/tickets', @user, params: { ticket: { event_id: event.id } }

    assert_response :unprocessable_content
    assert_includes response.parsed_body['errors'].join, 'already registered'
  end

  test 'should return my tickets' do
    other_user = create_user(email: "other-#{SecureRandom.hex(4)}@example.com")
    other_ticket = create_ticket(user: other_user)

    get_with_auth '/api/v1/my_tickets', @user

    assert_response :ok
    body = response.parsed_body
    assert(body.any? { |t| t['id'] == @ticket.id })
    refute(body.any? { |t| t['id'] == other_ticket.id })
  end

  private

  # Генерує заголовок авторизації з JWT токеном
  def auth_headers(user)
    token = JwtService.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end

  def post_with_auth(path, user, params: {})
    post path, params: params, headers: auth_headers(user), as: :json
  end

  def get_with_auth(path, user)
    get path, headers: auth_headers(user), as: :json
  end

  def patch_with_auth(path, user, params: {})
    patch path, params: params, headers: auth_headers(user), as: :json
  end

  def create_user(email: 'test@example.com')
    User.find_or_create_by!(email: email) do |u|
      u.name = 'testuser'
      u.password = 'password'
    end
  end

  def create_event
    Event.create!(
      brand: Brand.create!(name: "Brand #{SecureRandom.hex(4)}", subdomain: SecureRandom.hex(4)),
      categories: [Category.find_or_create_by!(name: 'Music')],
      title: 'Event',
      location: 'Loc',
      start_date: Time.current
    )
  end

  def create_ticket(user:)
    Ticket.create!(user: user, event: create_event, is_active: true)
  end
end
