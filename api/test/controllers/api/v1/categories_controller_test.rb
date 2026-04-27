# frozen_string_literal: true

require 'test_helper'

class CategoriesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.find_or_create_by!(email: 'test@example.com') do |u|
      u.name = 'testuser'
      u.password = 'password'
    end

    # Генеруємо токен
    token = JwtService.encode(user_id: @user.id)
    @headers = { 'Authorization' => "Bearer #{token}" }

    @category = Category.find_or_create_by!(name: 'Test Category')
  end

  test 'should get index' do
    # Передаємо заголовок авторизації
    get '/api/v1/categories', headers: @headers, as: :json

    assert_response :success
    # Перевіряємо наявність категорії у відповіді
    names = response.parsed_body.map { |c| c['name'] }
    assert_includes names, 'Test Category'
  end

  test 'should create category' do
    assert_difference('Category.count') do
      # Передаємо заголовок авторизації
      post '/api/v1/categories',
           params: { category: { name: 'New Category' } },
           headers: @headers,
           as: :json
    end

    assert_response :created
    assert_equal 'New Category', response.parsed_body['name']
  end

  test 'should return unauthorized if no token provided' do
    get '/api/v1/categories', as: :json
    assert_response :unauthorized
  end
end
