# frozen_string_literal: true

module Api
  module V1
    class PasswordsController < ApplicationController
      skip_before_action :authorize_request, only: %i[create update]

      before_action :require_valid_password_params, only: :change
      before_action :require_correct_current_password, only: :change

      # POST /api/v1/auth/password/reset
      def create
        email = params[:email].to_s.strip.downcase
        user = User.find_by('LOWER(email) = ?', email)

        MailerService.send_reset_password(user) if user

        render json: { message: t('api.v1.auth.password.reset_requested') }, status: :ok
      end

      # POST /api/v1/auth/password/reset?token={signed_id}
      def update
        user = User.find_by_token_for(:password_reset, params[:token])
        error = password_reset_validation_error(user)
        return render json: { error: error[:message] }, status: error[:status] if error

        if user.update(password: params[:new_password])
          render json: { message: t('api.v1.auth.password.updated') }, status: :ok
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_content
        end
      end

      # PATCH /api/v1/auth/password/change
      def change
        if current_user.update(password: params[:new_password])
          render json: { message: t('api.v1.auth.password.changed') }, status: :ok
        else
          render json: { errors: current_user.errors.full_messages },
                 status: :unprocessable_content
        end
      end

      private

      def require_valid_password_params
        if params[:current_password].blank?
          render json: { error: t('api.v1.auth.password.current_password_blank') }, status: :unprocessable_content
        elsif params[:new_password].blank?
          render json: { error: t('api.v1.auth.password.new_password_blank') }, status: :unprocessable_content
        end
      end

      def require_correct_current_password
        return if current_user.authenticate(params[:current_password])

        render json: { error: t('api.v1.auth.password.current_password_incorrect') }, status: :unauthorized
      end

      def password_reset_validation_error(user)
        return { message: t('api.v1.auth.password.invalid_or_expired_token'), status: :bad_request } if user.nil?
        if params[:new_password].blank?
          return { message: t('api.v1.auth.password.new_password_blank'),
                   status: :unprocessable_content }
        end

        nil
      end
    end
  end
end
