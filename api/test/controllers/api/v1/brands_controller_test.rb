# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    class BrandsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = create_test_user
        @brand = Brand.create!(
          name: 'Test Brand',
          description: 'Test description',
          subdomain: "test-brand-#{SecureRandom.hex(4)}",
          primary_color: '#FF0000',
          secondary_color: '#00FF00'
        )
        BrandMembership.create!(brand: @brand, user: @user, role: 'owner')
        @category = Category.create!(name: 'Test Category')

        @event = Event.create!(
          brand: @brand,
          categories: [@category],
          title: 'Test Event',
          location: 'Test location',
          start_date: Time.current
        )
      end

      # GET /api/v1/brands
      test 'should get index' do
        get '/api/v1/brands', headers: auth_headers(@user), as: :json

        assert_response :ok

        body = response.parsed_body
        assert_kind_of Array, body
        assert(body.any? { |b| b['id'] == @brand.id })
        assert(body.any? { |b| b['name'] == @brand.name })
      end

      # GET /api/v1/brands/:id
      test 'should show brand with events' do
        get "/api/v1/brands/#{@brand.id}", headers: auth_headers(@user), as: :json

        assert_response :ok

        body = response.parsed_body
        assert_equal @brand.id, body['id']
        assert_equal @brand.name, body['name']
        assert_includes body.keys, 'events'
        assert_kind_of Array, body['events']
        assert(body['events'].any? { |e| e['id'] == @event.id })
      end

      # GET /api/v1/brands/:id — 404
      test 'should return 404 when brand not found' do
        get '/api/v1/brands/999999', headers: auth_headers(@user), as: :json

        assert_response :not_found

        body = response.parsed_body
        assert_equal 'Brand not found', body['error']
      end

      # POST /api/v1/brands
      test 'should create brand' do
        assert_difference('Brand.count', 1) do
          post '/api/v1/brands',
               params: {
                 brand: {
                   name: 'New Brand',
                   description: 'New description',
                   subdomain: "new-brand-#{SecureRandom.hex(4)}",
                   primary_color: '#123456',
                   secondary_color: '#654321'
                 }
               },
               headers: auth_headers(@user),
               as: :json
        end

        assert_response :created

        body = response.parsed_body
        assert_equal 'New Brand', body['name']
      end

      # POST /api/v1/brands
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
               headers: auth_headers(@user),
               as: :json
        end

        assert_response :unprocessable_content

        body = response.parsed_body
        assert body['errors'].present?
      end
    end
  end
end
