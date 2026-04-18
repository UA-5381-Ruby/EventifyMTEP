# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    class BrandsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @brand = Brand.create!(
          name: 'Test Brand',
          description: 'Test description',
          subdomain: 'test-brand',
          primary_color: '#FF0000',
          secondary_color: '#00FF00'
        )
      end

      test 'should get index' do
        get '/api/v1/brands', as: :json

        assert_response :ok

        body = response.parsed_body
        assert_equal 1, body.length
        assert_equal @brand.name, body[0]['name']
      end

      test 'should show brand' do
        get "/api/v1/brands/#{@brand.id}", as: :json

        assert_response :ok

        body = response.parsed_body
        assert_equal @brand.id, body['id']
        assert_equal @brand.name, body['name']
      end

      test 'should return 404 when brand not found' do
        get '/api/v1/brands/999999', as: :json

        assert_response :not_found

        body = response.parsed_body
        assert_equal 'Brand not found', body['error']
      end

      test 'should create brand' do
        assert_difference('Brand.count', 1) do
          post '/api/v1/brands',
               params: {
                 brand: {
                   name: 'New Brand',
                   description: 'New description',
                   subdomain: 'new-brand',
                   primary_color: '#123456',
                   secondary_color: '#654321'
                 }
               },
               as: :json
        end

        assert_response :created

        body = response.parsed_body
        assert_equal 'New Brand', body['name']
      end

      test 'should not create brand with invalid data' do
        assert_no_difference('Brand.count') do
          post '/api/v1/brands',
               params: {
                 brand: {
                   name: '',
                   subdomain: '',
                   primary_color: 'red',
                   secondary_color: 'blue'
                 }
               },
               as: :json
        end

        assert_response :unprocessable_content

        body = response.parsed_body
        assert body['errors'].present?
      end
    end
  end
end
