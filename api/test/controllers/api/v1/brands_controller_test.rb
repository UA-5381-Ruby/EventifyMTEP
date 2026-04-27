# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    class BrandsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = User.find_or_create_by!(email: 'test@example.com') do |u|
          u.name = 'testuser'
          u.password = 'password'
        end

        # Генеруємо реальний JWT токен
        token = JwtService.encode(user_id: @user.id)
        @headers = { 'Authorization' => "Bearer #{token}" }

        token = JwtService.encode(user_id: @user.id)
        @headers = { 'Authorization' => "Bearer #{token}" }

        @brand = Brand.create!(
          name: 'Test Brand',
          description: 'Test description',
          subdomain: "test-brand-#{SecureRandom.hex(4)}",
          primary_color: '#FF0000',
          secondary_color: '#00FF00'
        )

        BrandMembership.create!(brand: @brand, user: @user, role: 'owner')
        @category = Category.find_or_create_by!(name: 'Test Category')

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
        get '/api/v1/brands', headers: @headers, as: :json

        assert_response :ok

        body = response.parsed_body
        assert_kind_of Array, body
        assert(body.any? { |b| b['id'] == @brand.id })
      end

      # GET /api/v1/brands/:id
      test 'should show brand with events' do
        get "/api/v1/brands/#{@brand.id}", headers: @headers, as: :json

        assert_response :ok

        body = response.parsed_body
        assert_equal @brand.id, body['id']
        assert_kind_of Array, body['events']
        assert(body['events'].any? { |e| e['id'] == @event.id })
      end

      # GET /api/v1/brands/:id — 404
      test 'should return 404 when brand not found' do
        get '/api/v1/brands/999999', headers: @headers, as: :json

        assert_response :not_found
        assert_equal 'Brand not found', response.parsed_body['error']
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
               headers: @headers,
               as: :json
        end

        assert_response :created

        body = response.parsed_body
        assert_equal 'New Brand', body['name']
        # TODO: uncomment when auth is ready
        new_brand = Brand.find(body['id'])
        assert new_brand.brand_memberships.exists?(user: @user, role: 'owner')
      end

      # POST /api/v1/brands з невалідними даними
      test 'should not create brand with invalid data' do
        assert_no_difference('Brand.count') do
          post '/api/v1/brands',
               params: {
                 brand: {
                   name: '',
                   subdomain: ''
                 }
               },
               headers: @headers,
               as: :json
        end

        assert_response :unprocessable_content
        assert response.parsed_body['errors'].present?
      end

      test 'should return unauthorized if token is missing' do
        get '/api/v1/brands', as: :json
        assert_response :unauthorized
      end
    end
  end
end
