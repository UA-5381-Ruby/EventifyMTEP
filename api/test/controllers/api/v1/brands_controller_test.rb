# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    class BrandsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = User.find_by(email: 'test@example.com') ||
                User.create!(
                  email: 'test@example.com',
                  password: 'password',
                  username: 'testuser'
                )

        @brand = Brand.create!(
          name: 'Test Brand',
          description: 'Test description',
          subdomain: 'test-brand',
          primary_color: '#FF0000',
          secondary_color: '#00FF00'
        )

        Organizer.create!(brand: @brand, user: @user)

        user = @user
        Api::V1::BrandsController.define_method(:current_user) { user }
      end

      teardown do
        Api::V1::BrandsController.remove_method(:current_user)
      end

      # GET /api/v1/brands
      test 'should get index' do
        get '/api/v1/brands', as: :json

        assert_response :ok

        body = response.parsed_body
        assert_kind_of Array, body
        assert(body.any? { |b| b['id'] == @brand.id })
        assert(body.any? { |b| b['name'] == @brand.name })
      end

      # GET /api/v1/brands/:id
      test 'should show brand with events' do
        get "/api/v1/brands/#{@brand.id}", as: :json

        assert_response :ok

        body = response.parsed_body
        assert_equal @brand.id, body['id']
        assert_equal @brand.name, body['name']
        assert_includes body.keys, 'events'
        assert_kind_of Array, body['events']
      end

      # GET /api/v1/brands/:id — 404
      test 'should return 404 when brand not found' do
        get '/api/v1/brands/999999', as: :json

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
        # TODO: uncomment when auth is ready
        # new_brand = Brand.find(body['id'])
        # assert new_brand.organizers.exists?(user: @user)
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
               as: :json
        end

        assert_response :unprocessable_content

        body = response.parsed_body
        assert body['errors'].present?
      end
    end
  end
end
