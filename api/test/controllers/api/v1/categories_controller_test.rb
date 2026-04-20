# frozen_string_literal: true

require 'test_helper'

class CategoriesControllerTest < ActionDispatch::IntegrationTest
  setup do
    # Bypass authentication for controller tests
    Api::V1::CategoriesController.class_eval do
      def authenticate_user!; end
    end

    @category = Category.create!(name: 'Test Category')
  end

  test 'should get index' do
    get '/api/v1/categories', as: :json
    assert_response :success
    assert_includes response.parsed_body.map { |c| c['name'] }, 'Test Category'
  end

  test 'should create category' do
    assert_difference('Category.count') do
      post '/api/v1/categories', params: { category: { name: 'New Category' } }, as: :json
    end
    assert_response :created
  end
end
