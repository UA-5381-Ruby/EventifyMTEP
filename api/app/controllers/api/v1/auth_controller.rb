# frozen_string_literal: true

module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authorize_request, only: %i[register login]

      # POST /auth/register
      def register
        user = User.new(user_params)

        if user.save
          token = JwtService.encode(user_id: user.id, password_salt: user.password_salt)
          render json: { token: token, user: user_as_json(user) }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_content
        end
      end

      # POST /auth/login
      def login
        email = params[:email].to_s.strip.downcase
        user = User.find_by('LOWER(email) = ?', email)

        if user&.authenticate(params[:password])
          token = JwtService.encode(user_id: user.id, password_salt: user.password_salt)
          render json: { token: token, user: user_as_json(user) }, status: :ok
        else
          render json: { error: 'Invalid email or password' }, status: :unauthorized
        end
      end

      private

      def user_params
        attributes = %i[name email password]

        if params[:user].present?
          params.expect(user: attributes)
        else
          ActionController::Parameters.new(user: params.to_unsafe_h).expect(user: attributes)
        end
      end

      def user_as_json(user)
        user.as_json(only: %i[id name email is_superadmin])
      end
    end
  end
end
