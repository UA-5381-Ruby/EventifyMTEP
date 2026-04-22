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
    "#{ENV.fetch('FRONTEND_URL', 'https://app.com')}/reset"
  end
end
