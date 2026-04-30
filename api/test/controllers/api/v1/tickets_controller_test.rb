# frozen_string_literal: true

require 'test_helper'

class TicketsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = create_user
    @ticket = create_ticket(user: @user)
  end

  test 'should allow review and update rating and comment' do
    post_with_auth "/api/v1/tickets/#{@ticket.id}/review",
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
    errors = response.parsed_body['errors']

    # errors це об'єкт типу { "base" => ["User is already..."] }
    error_messages = errors.values.join
    assert_includes error_messages, 'already registered'
  end

  test 'should return my tickets' do
    other_user = create_user(email: "other-#{SecureRandom.hex(4)}@example.com")
    other_ticket = create_ticket(user: other_user)

    get_with_auth '/api/v1/tickets', @user

    assert_response :ok
    body = response.parsed_body
    assert(body['data'].any? { |t| t['id'] == @ticket.id })
    refute(body['data'].any? { |t| t['id'] == other_ticket.id })
  end

  test 'should get single ticket' do
    get_with_auth "/api/v1/tickets/#{@ticket.id}", @user

    assert_response :ok
    assert_equal @ticket.id, response.parsed_body['id']
    assert response.parsed_body.key?('qr_code')
  end

  test 'should return 404 for non-existent ticket' do
    get_with_auth '/api/v1/tickets/99999', @user

    assert_response :not_found
  end

  test 'should update ticket status' do
    patch_with_auth "/api/v1/tickets/#{@ticket.id}",
                    @user,
                    params: { ticket: { is_active: false } }

    assert_response :ok
    assert_equal false, response.parsed_body['is_active']
  end

  test 'should search tickets by event name' do
    event = create_event(title: 'Unique Tech Summit 2025')
    ticket = create_ticket(user: @user, event: event)

    get_with_auth '/api/v1/tickets?q=Tech', @user

    assert_response :ok
    body = response.parsed_body
    assert(body['data'].any? { |t| t['id'] == ticket.id })
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

  def create_event(title: 'Event', brand: nil)
    Event.create!(
      brand: brand || Brand.create!(name: "Brand #{SecureRandom.hex(4)}", subdomain: SecureRandom.hex(4)),
      categories: [Category.find_or_create_by!(name: 'Music')],
      title: title,
      location: 'Loc',
      start_date: Time.current
    )
  end

  def create_ticket(user:, event: nil)
    Ticket.create!(user: user, event: event || create_event, is_active: true)
  end
end
