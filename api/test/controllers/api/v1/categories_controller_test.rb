# frozen_string_literal: true

require 'test_helper'

class CategoriesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.find_by(email: 'test@example.com') ||
            User.create!(
              name: 'testuser',
              email: 'test@example.com',
              password: 'password'
            )

    token = JwtService.encode(user_id: @user.id)
    @headers = { 'Authorization' => "Bearer #{token}" }

    @category = Category.create!(name: 'Test Category')
  end

  test 'should get index' do
    get '/api/v1/categories', headers: @headers, as: :json
    assert_response :success
    assert_includes response.parsed_body.pluck('name'), 'Test Category'
  end

  test 'should create category' do
    assert_difference('Category.count', 1) do
      post '/api/v1/categories', params: { category: { name: 'New Category' } }, headers: @headers, as: :json
    end
    assert_response :created
  end
end
