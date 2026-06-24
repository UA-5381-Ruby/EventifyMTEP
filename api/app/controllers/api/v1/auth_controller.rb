# frozen_string_literal: true

module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authorize_request, only: %i[register login]

      def register
        user = User.new(user_params)

        if user.save

          Activity.log_activity(
            user,
            'create',
            'User',
            user.id,
            user.email,
            'Account registered successfully',
            request.remote_ip,
            request.user_agent,
            'success'
          )

          MailerService.send_email_verification(user)
          DeleteUnconfirmedUserJob.set(wait: 24.hours).perform_later(user.id)

          render json: { message: 'Account created! Please check your email to verify your account.' }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_content
        end
      end

      def login
        user = find_user_by_email

        unless user&.authenticate(params[:password])

          if user
            Activity.log_activity(
              user,
              'login',
              'System',
              nil,
              nil,
              'Invalid password attempt',
              request.remote_ip,
              request.user_agent,
              'failed'
            )
          end

          return render json: { error: 'Invalid email or password' }, status: :unauthorized
        end

        unless user.email_confirmed?

          Activity.log_activity(
            user,
            'login',
            'System',
            nil,
            nil,
            'Login failed: Email not verified',
            request.remote_ip,
            request.user_agent,
            'failed'
          )

          return render json: { error: 'Please verify your email address to log in.' }, status: :forbidden
        end

        Activity.log_activity(
          user,
          'login',
          'System',
          nil,
          nil,
          'Successful login',
          request.remote_ip,
          request.user_agent,
          'success'
        )

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
