# frozen_string_literal: true

class UserMailer < ApplicationMailer
  def reset_password(user, signed_id)
    @user = user
    @reset_link = "https://app.com/reset?token=#{signed_id}"
    mail(to: @user.email, subject: 'Reset your password')
  end
end
