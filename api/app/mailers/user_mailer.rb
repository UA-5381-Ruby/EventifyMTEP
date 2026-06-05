# frozen_string_literal: true

class UserMailer < ApplicationMailer
  def email_verification(user, signed_id)
    @user = user
    @verify_link = "#{ENV.fetch('FRONTEND_URL')}/verify-email?token=#{signed_id}"

    mail(
      to: @user.email,
      subject: 'Verify your email address',
      content_type: 'text/html'
    )
  end

  def reset_password(user, signed_id)
    @user = user
    frontend_url = ENV.fetch('FRONTEND_URL')
    @reset_link = "#{frontend_url}/reset-password?token=#{signed_id}"
    mail(to: @user.email, subject: 'Reset your password')
  end
end
