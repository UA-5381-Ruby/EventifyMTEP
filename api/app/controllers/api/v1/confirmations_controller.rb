# frozen_string_literal: true

module Api
  module V1
    class ConfirmationsController < ApplicationController
      skip_before_action :authorize_request, only: %i[create resend]

      # POST /api/v1/auth/confirm_email
      def create
        user = User.find_by_token_for(:email_verification, params[:token])

        return render json: { error: 'Invalid or expired verification link' }, status: :bad_request if user.nil?

        if user.update(is_confirmed: true)
          render json: { message: 'Email verified successfully! You can now log in.' }, status: :ok
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_content
        end
      end

      # POST /api/v1/auth/resend_confirmation
      def resend
        user = User.find_by('LOWER(email) = ?', params[:email].to_s.strip.downcase)

        return render json: { error: 'User not found' }, status: :not_found if user.nil?
        return render json: { error: 'Email already verified' }, status: :unprocessable_content if user.is_confirmed?

        MailerService.send_email_verification(user)
        render json: { message: 'Verification email sent' }, status: :ok
      end
    end
  end
end