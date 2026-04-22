# frozen_string_literal: true

require 'cgi'

class UserMailer < ApplicationMailer
  def password_reset(user, token)
    @user = user
    @reset_link = "#{frontend_reset_url}?token=#{CGI.escape(token)}"

    mail(to: @user.email, subject: 'Reset your password')
  end

  private

  def frontend_reset_url
    frontend_url = ENV['FRONTEND_URL']
    return "#{frontend_url.chomp('/')}/reset" if frontend_url.present?

    default_url_options = Rails.application.config.action_mailer.default_url_options || {}
    host = default_url_options[:host]
    if host.blank?
      raise ArgumentError,
            'Configuration error: Set FRONTEND_URL environment variable (preferred) or configure action_mailer.default_url_options[:host] for password reset emails.'
    end

    protocol = default_url_options[:protocol] || 'https'
    port = default_url_options[:port]

    base_url = "#{protocol}://#{host}"
    base_url = "#{base_url}:#{port}" if port.present?

    "#{base_url}/reset"
  end
end
