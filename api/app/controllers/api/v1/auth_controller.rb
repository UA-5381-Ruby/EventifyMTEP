# frozen_string_literal: true

module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authorize_request, only: %i[register login]

      # POST /auth/register
      def register
        user = User.new(user_params)

        if user.save
          MailerService.send_email_verification(user)

          DeleteUnconfirmedUserJob.set(wait: 24.hours).perform_later(user.id)

          render json: { message: t('api.v1.auth.registered') }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_content
        end
      end

      # POST /auth/login
      def login
        user = find_user_by_email

        unless user&.authenticate(params[:password])
          return render json: { error: t('api.v1.auth.invalid_credentials') }, status: :unauthorized
        end

        unless user.email_confirmed?
          return render json: { error: t('api.v1.auth.email_not_confirmed') }, status: :forbidden
        end

        render json: auth_success_payload(user), status: :ok
      end

      private

      def find_user_by_email
        User.find_by('LOWER(email) = ?', params[:email].to_s.strip.downcase)
      end

      def auth_success_payload(user)
        token = JwtService.encode(user_id: user.id, password_salt: user.password_salt)
        { token: token, user: user_as_json(user) }
      end

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
