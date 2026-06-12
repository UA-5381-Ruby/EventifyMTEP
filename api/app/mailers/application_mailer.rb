# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: 'onboarding@resend.dev'
  layout 'mailer'
end
