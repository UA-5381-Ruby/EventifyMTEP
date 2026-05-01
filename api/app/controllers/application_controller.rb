# frozen_string_literal: true

class ApplicationController < ActionController::API
  include Pundit::Authorization

  before_action :authorize_request

  attr_reader :current_user

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  private

  def authorize_request
    header = request.headers['Authorization']

    # Return 401 if no Authorization header
    return render json: { error: 'Unauthorized access. Missing token.' }, status: :unauthorized unless header

    # Extract token from "Bearer <token>" format
    token = header.split.last

    begin
      decoded = JwtService.decode(token)
      if decoded
        @current_user = User.find(decoded[:user_id])
        # Validate password_salt to ensure JWT is still valid after password changes
        unless JwtService.valid_token_salt?(token, @current_user)
          render json: { error: 'Unauthorized access. Token has been invalidated.' }, status: :unauthorized
        end
      else
        render json: { error: 'Unauthorized access. Invalid token.' }, status: :unauthorized
      end
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'User with this token no longer exists.' }, status: :unauthorized
    rescue StandardError => e
      render json: { error: "Unauthorized access. #{e.message}" }, status: :unauthorized
    end
  end

  def user_not_authorized
    render json: { error: 'You are not authorized to perform this action.' }, status: :forbidden
  end
end
