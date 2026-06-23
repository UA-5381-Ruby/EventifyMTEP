# frozen_string_literal: true

class ApplicationController < ActionController::API
  include AbstractController::Translation
  include Pundit::Authorization

  before_action :set_locale
  before_action :authorize_request

  attr_reader :current_user

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  private

  def set_locale
    locale = extract_locale_from_header || extract_locale_from_params
    I18n.locale = I18n.available_locales.map(&:to_s).include?(locale) ? locale : I18n.default_locale
  end

  def extract_locale_from_params
    params[:locale]
  end

  def extract_locale_from_header
    request.headers['Accept-Language']&.scan(/[a-z]{2}/)&.first
  end

  def authorize_request
    header = request.headers['Authorization']

    unless header
      @current_user = nil
      return
    end

    authenticate_with_token(header.split.last)
  end

  def authenticate_with_token(token)
    decoded = JwtService.decode(token)
    if decoded
      @current_user = User.find(decoded[:user_id])
      unless JwtService.valid_token_salt?(token, @current_user)
        render json: { error: t('api.v1.auth.token_invalidated') }, status: :unauthorized
      end
    else
      render json: { error: t('api.v1.auth.invalid_token') }, status: :unauthorized
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: t('api.v1.auth.user_not_found') }, status: :unauthorized
  rescue StandardError => e
    render json: { error: t('api.v1.auth.unauthorized', message: e.message) }, status: :unauthorized
  end

  def require_authentication!
    return if current_user

    render json: { error: t('api.v1.auth.missing_token') }, status: :unauthorized
  end

  def user_not_authorized
    render json: { error: t('api.v1.auth.not_authorized') }, status: :forbidden
  end
end
