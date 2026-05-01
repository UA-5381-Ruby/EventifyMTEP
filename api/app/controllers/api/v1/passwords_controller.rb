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

        if user
          token = user.generate_token_for(:password_reset)
          UserMailer.reset_password(user, token).deliver_later
        end

        render json: { message: 'If your email exists, you will receive reset instructions' }, status: :ok
      end

      # POST /api/v1/auth/password/reset?token={signed_id}
      def update
        user = User.find_by_token_for(:password_reset, params[:token])

        return render json: { error: 'Invalid or expired token' }, status: :bad_request if user.nil?
        if params[:new_password].blank?
          return render json: { error: 'New password cannot be blank' },
                        status: :unprocessable_content
        end

        if user.update(password: params[:new_password])
          render json: { message: 'Password successfully updated' }, status: :ok
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_content
        end
      end

      # PATCH /api/v1/auth/password/change
      def change
        if current_user.update(password: params[:new_password])
          render json: { message: 'Password successfully changed' }, status: :ok
        else
          render json: { errors: current_user.errors.full_messages },
                 status: :unprocessable_content
        end
      end

      private

      def require_valid_password_params
        if params[:current_password].blank?
          return render json: { error: 'Current password cannot be blank' }, status: :unprocessable_content
        elsif params[:new_password].blank?
          return render json: { error: 'New password cannot be blank' }, status: :unprocessable_content
        end
      end

      def require_correct_current_password
        return if current_user.authenticate(params[:current_password])

        return render json: { error: 'Current password is incorrect' }, status: :unauthorized
      end
    end
  end
end
