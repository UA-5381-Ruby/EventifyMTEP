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

  def ticket_confirmation(user, ticket)
    @user   = user
    @ticket = ticket
    @event  = ticket.event

    pdf = TicketPdfService.generate(ticket)

    attachments["ticket-#{ticket.qr_code}.pdf"] = {
      mime_type: 'application/pdf',
      content: pdf
    }

    mail(
      to: @user.email,
      subject: "Your ticket for #{@event.title}"
    )
  end
end
