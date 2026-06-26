# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  # default from: 'onboarding@resend.dev'
  default from: 'noreply@eventify.com'
  layout 'mailer'
end
