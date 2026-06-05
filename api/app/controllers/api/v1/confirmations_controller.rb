# frozen_string_literal: true

module Api
  module V1
    class ConfirmationsController < ApplicationController
      skip_before_action :authorize_request, only: :create

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
    end
  end
end
