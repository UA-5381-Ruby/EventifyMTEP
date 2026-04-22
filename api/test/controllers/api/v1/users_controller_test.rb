require 'test_helper'

module Api
  module V1
    class UsersControllerTest < ActionDispatch::IntegrationTest
      def setup
        @user = User.create!(name: 'Normal User', email: 'user@test.com', password: 'password123')
        @other_user = User.create!(name: 'Other User', email: 'other@test.com', password: 'password123')
        @admin = User.create!(name: 'Admin User', email: 'admin@test.com', password: 'password123', is_superadmin: true)
      end

      def auth_headers(user)
        token = JwtService.encode(user_id: user.id)
        { 'Authorization' => "Bearer #{token}" }
      end

      test 'should get index if authorized' do
        get '/api/v1/users', headers: auth_headers(@user)
        assert_response :success

        json_response = JSON.parse(response.body)
        assert_equal 3, json_response.length
      end

      test 'should NOT get index without token' do
        get '/api/v1/users'
        assert_response :unauthorized
      end

      test 'should show any user profile if authorized' do
        get "/api/v1/users/#{@other_user.id}", headers: auth_headers(@user)
        assert_response :success

        json_response = JSON.parse(response.body)
        assert_equal @other_user.email, json_response['email']
      end

      test 'should update own profile' do
        patch "/api/v1/users/#{@user.id}",
              params: { name: 'Updated Name' },
              headers: auth_headers(@user),
              as: :json

        assert_response :success
        @user.reload
        assert_equal 'Updated Name', @user.name
      end

      test 'should NOT update other user profile (Pundit block)' do
        patch "/api/v1/users/#{@other_user.id}",
              params: { name: 'Hacked Name' },
              headers: auth_headers(@user),
              as: :json

        assert_response :forbidden # 403
      end

      test 'should destroy own profile' do
        assert_difference('User.count', -1) do
          delete "/api/v1/users/#{@user.id}", headers: auth_headers(@user)
        end

        assert_response :no_content # 204
      end

      test 'should NOT destroy other user profile (Pundit block)' do
        assert_no_difference('User.count') do
          delete "/api/v1/users/#{@other_user.id}", headers: auth_headers(@user)
        end

        assert_response :forbidden # 403
      end

      test 'superadmin CAN destroy other user profile' do
        assert_difference('User.count', -1) do
          delete "/api/v1/users/#{@other_user.id}", headers: auth_headers(@admin) # Заходимо як @admin
        end

        assert_response :no_content
      end
    end
  end
end
