# frozen_string_literal: true

module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authorize_request, only: %i[register login]

      # POST /auth/register
      def register
        user = User.new(user_params)

        if user.save
          token = JwtService.encode(user_id: user.id)
          render json: { token: token, user: user_as_json(user) }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /auth/login
      def login
        user = User.find_by(email: params[:email])

        if user&.authenticate(params[:password])
          token = JwtService.encode(user_id: user.id)
          render json: { token: token, user: user_as_json(user) }, status: :ok
        else
          render json: { error: 'Invalid email or password' }, status: :unauthorized
        end
      end

      private

      def user_params
        params.permit(:name, :email, :password, :password_confirmation)
      end

      def user_as_json(user)
        user.as_json(only: %i[id name email is_superadmin])
      end
    end
  end
end
