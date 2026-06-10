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

  def brand_invitation(email, brand, token)
    @brand = brand
    @accept_link = "#{ENV.fetch('FRONTEND_URL')}/accept-invitation?token=#{token}&brand_id=#{brand.id}"

    mail(
      to: email,
      subject: "You're invited to join #{brand.name}",
      content_type: 'text/html'
    )
  end
end
