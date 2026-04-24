# frozen_string_literal: true

require 'test_helper'

class CategoriesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(
      name: 'testuser',
      email: 'test@example.com',
      password: 'password'
    )

    @category = Category.create!(name: 'Test Category')
  end

  private

  def auth_headers(user)
    token = JwtService.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end

  test 'should get index' do
    get '/api/v1/categories', headers: auth_headers(@user), as: :json
    assert_response :success
    assert_includes response.parsed_body.pluck('name'), 'Test Category'
  end

  test 'should create category' do
    assert_difference('Category.count') do
      post '/api/v1/categories', params: { category: { name: 'New Category' } }, headers: auth_headers(@user), as: :json
    end
    assert_response :created
  end
end
