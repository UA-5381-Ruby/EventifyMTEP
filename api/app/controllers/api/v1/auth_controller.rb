# frozen_string_literal: true

module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authorize_request, only: %i[register login]

      # POST /auth/register
      def register
        user = User.new(user_params)

        if user.save
          token = user.generate_token_for(:email_verification)
          UserMailer.email_verification(user, token).deliver_later

          DeleteUnconfirmedUserJob.set(wait: 24.hours).perform_later(user.id)

          render json: { message: 'Account created! Please check your email to verify your account.' }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_content
        end
      end

      # POST /auth/login
      def login
        email = params[:email].to_s.strip.downcase
        user = User.find_by('LOWER(email) = ?', email)

        if user&.authenticate(params[:password])
          unless user.email_confirmed?
            return render json: { error: 'Please verify your email address to log in.' }, status: :forbidden
          end

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
