# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    class CategoriesControllerTest < ActionDispatch::IntegrationTest
      test 'GET /api/v1/categories returns all categories' do
        Category.create!(name: 'Music')
        Category.create!(name: 'Tech')

        get api_v1_categories_url, as: :json
        assert_response :success

        json = response.parsed_body
        assert_kind_of Array, json
        assert_equal Category.count, json.length

        names = json.pluck('name')
        assert_includes names, 'Music'
        assert_includes names, 'Tech'
      end

      test 'POST /api/v1/categories creates a category' do
        post api_v1_categories_url, params: { category: { name: 'Sports' } }, as: :json
        assert_response :created

        json = response.parsed_body
        assert_equal 'Sports', json['name']
        assert Category.exists?(name: 'Sports')
      end

      test 'POST /api/v1/categories rejects case-insensitive duplicate' do
        post api_v1_categories_url, params: { category: { name: 'Sports' } }, as: :json
        assert_response :created

        post api_v1_categories_url, params: { category: { name: 'sports' } }, as: :json
        assert_response :unprocessable_content

        json = response.parsed_body
        assert_equal 1, Category.count
        assert json['name'].present?
      end
    end
  end
end
