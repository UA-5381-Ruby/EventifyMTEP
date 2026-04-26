# frozen_string_literal: true

class UserMailer < ApplicationMailer
  def reset_password(user, signed_id)
    @user = user
    frontend_url = ENV.fetch('FRONTEND_URL')
    @reset_link = "#{frontend_url}/reset?token=#{signed_id}"
    mail(to: @user.email, subject: 'Reset your password')
  end
end
