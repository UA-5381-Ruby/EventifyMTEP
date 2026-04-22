# frozen_string_literal: true

require 'uri/mailto'

module Api
  module V1
    class PasswordsController < ApplicationController
      rescue_from ActionController::ParameterMissing, with: :render_bad_request

      # POST /api/v1/auth/password/reset
      def create
        email = params.require(:email).to_s
        user = valid_email_format?(email) ? User.find_by(email: email) : nil

        if user
          token = user.signed_id(purpose: :password_reset, expires_in: 2.days)
          UserMailer.password_reset(user, token).deliver_later
        end

        render json: { message: 'If the account exists, password reset instructions were sent.' }, status: :ok
      end

      # POST /api/v1/auth/password/reset?token={signed_id}
      def update
        user = User.find_signed(params[:token], purpose: :password_reset)
        return render json: { error: 'Invalid or expired token' }, status: :bad_request if user.nil?

        user.update!(password: params.require(:new_password))

        render json: { message: 'Password has been reset successfully.' }, status: :ok
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.record.errors.full_messages.join(', ') }, status: :unprocessable_content
      end

      private

      def render_bad_request(error)
        render json: { error: error.message }, status: :bad_request
      end

      def valid_email_format?(email)
        email.match?(URI::MailTo::EMAIL_REGEXP)
      end
    end
  end
end
