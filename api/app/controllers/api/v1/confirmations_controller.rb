# frozen_string_literal: true

module Api
  module V1
    class ConfirmationsController < ApplicationController
      skip_before_action :authorize_request, only: %i[create resend]

      # POST /api/v1/auth/confirm_email
      def create
        user = User.find_by_token_for(:email_verification, params[:token])

        if user.nil?
          return render json: { error: t('api.v1.auth.confirmation.invalid_or_expired') }, status: :bad_request
        end

        if user.update(is_confirmed: true)
          render json: { message: t('api.v1.auth.confirmation.success') }, status: :ok
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_content
        end
      end

      # POST /api/v1/auth/resend_confirmation
      def resend
        user = User.find_by('LOWER(email) = ?', params[:email].to_s.strip.downcase)

        return render json: { error: t('api.v1.errors.users.not_found') }, status: :not_found if user.nil?

        if user.is_confirmed?
          return render json: { error: t('api.v1.auth.confirmation.already_confirmed') },
                        status: :unprocessable_content
        end

        MailerService.send_email_verification(user)
        render json: { message: t('api.v1.auth.confirmation.resend_success') }, status: :ok
      end
    end
  end
end
