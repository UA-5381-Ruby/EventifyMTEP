# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    class BrandMembershipsBaseTest < ActionDispatch::IntegrationTest
      setup do
        @brand = create_brand
        @owner_user = create_user('owner@example.com')
        @member_user = create_user('member@example.com')
        @new_user = create_user('new_user@example.com')

        @owner_membership = BrandMembership.create!(brand: @brand, user: @owner_user, role: 'owner')
        @member_membership = BrandMembership.create!(brand: @brand, user: @member_user, role: 'user')

        @base_url = "/api/v1/brands/#{@brand.id}/memberships"
      end

      private

      def auth_headers(user)
        token = JwtService.encode(user_id: user.id)
        { 'Authorization' => "Bearer #{token}" }
      end

      def create_user(email)
        User.create!(
          name: email.split('@').first,
          email: email,
          password: 'password',
          is_superadmin: false
        )
      end

      def create_brand
        Brand.create!(
          name: 'Test Brand',
          subdomain: "test-brand-#{SecureRandom.hex(6)}"
        )
      end
    end

    # -------- INDEX --------
    class BrandMembershipsIndexTest < BrandMembershipsBaseTest
      test 'should return paginated list of memberships with user data' do
        get @base_url, headers: auth_headers(@owner_user), as: :json

        assert_response :ok
        json_response = JSON.parse(response.body)

        assert json_response.key?('data')
        assert json_response.key?('meta')

        assert_equal 2, json_response['data'].length

        first_record = json_response['data'].first
        assert first_record.key?('user')
        assert_equal %w[id name email].sort, first_record['user'].keys.sort
      end
    end

    # -------- CREATE --------
    class BrandMembershipsCreateTest < BrandMembershipsBaseTest
      test 'should create a new brand membership' do
        assert_difference('BrandMembership.count', 1) do
          post @base_url,
               params: { membership: { user_id: @new_user.id, role: 'manager' } },
               headers: auth_headers(@owner_user),
               as: :json
        end

        assert_response :created
      end

      test 'should return unprocessable_content when adding duplicate membership' do
        post @base_url,
             params: { membership: { user_id: @member_user.id, role: 'manager' } },
             headers: auth_headers(@owner_user),
             as: :json

        assert_response :unprocessable_content
        json_response = JSON.parse(response.body)
        assert_includes json_response['errors']['base'], 'User is already a member of this brand'
      end
    end

    # -------- UPDATE --------
    class BrandMembershipsUpdateTest < BrandMembershipsBaseTest
      test 'should allow updating membership role' do
        patch "#{@base_url}/#{@member_membership.id}",
              params: { membership: { role: 'manager' } },
              headers: auth_headers(@owner_user),
              as: :json

        assert_response :ok
        assert_equal 'manager', @member_membership.reload.role
      end

      test 'should not allow downgrading the last owner' do
        patch "#{@base_url}/#{@owner_membership.id}",
              params: { membership: { role: 'user' } },
              headers: auth_headers(@owner_user),
              as: :json

        assert_response :unprocessable_content
        json_response = JSON.parse(response.body)
        assert_includes json_response['errors']['base'], 'Cannot downgrade the last owner of a brand'

        assert_equal 'owner', @owner_membership.reload.role
      end

      test 'should allow downgrading owner if another owner exists' do
        BrandMembership.create!(brand: @brand, user: @new_user, role: 'owner')

        patch "#{@base_url}/#{@owner_membership.id}",
              params: { membership: { role: 'user' } },
              headers: auth_headers(@owner_user),
              as: :json

        assert_response :ok
        assert_equal 'user', @owner_membership.reload.role
      end
    end

    # -------- DESTROY --------
    class BrandMembershipsDestroyTest < BrandMembershipsBaseTest
      test 'should allow destroying a regular membership' do
        assert_difference('BrandMembership.count', -1) do
          delete "#{@base_url}/#{@member_membership.id}",
                 headers: auth_headers(@owner_user),
                 as: :json
        end

        assert_response :no_content
      end

      test 'should not allow destroying the last owner' do
        assert_no_difference('BrandMembership.count') do
          delete "#{@base_url}/#{@owner_membership.id}",
                 headers: auth_headers(@owner_user),
                 as: :json
        end

        assert_response :unprocessable_content
        json_response = JSON.parse(response.body)
        assert_includes json_response['errors']['base'], 'Cannot remove the last owner of a brand'
      end
    end

    # -------- ERRORS --------
    class BrandMembershipsErrorsTest < BrandMembershipsBaseTest
      test 'should return 404 if brand is not found' do
        get '/api/v1/brands/9999999/memberships',
            headers: auth_headers(@owner_user),
            as: :json

        assert_response :not_found
        json_response = JSON.parse(response.body)
        assert_equal 'Brand not found', json_response['error']
      end

      test 'should return 404 if membership is not found in the brand' do
        patch "#{@base_url}/9999999",
              params: { membership: { role: 'manager' } },
              headers: auth_headers(@owner_user),
              as: :json

        assert_response :not_found
        json_response = JSON.parse(response.body)
        assert_equal 'Membership not found in this brand', json_response['error']
      end
    end
  end
end