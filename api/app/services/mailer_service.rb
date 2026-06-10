# frozen_string_literal: true

class MailerService
  # Send email verification and return the signed token
  def self.send_email_verification(user)
    token = user.generate_token_for(:email_verification)
    UserMailer.email_verification(user, token).deliver_now
    token
  end

  def self.resend_email_verification(user)
    send_email_verification(user)
  end

  # Send password reset email and return the signed token
  def self.send_reset_password(user)
    token = user.generate_token_for(:password_reset)
    UserMailer.reset_password(user, token).deliver_later
    token
  end
end
