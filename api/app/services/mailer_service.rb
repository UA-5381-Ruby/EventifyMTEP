# frozen_string_literal: true

class MailerService
  # Send email verification and return the signed token
  def self.send_email_verification(user)
    token = user.generate_token_for(:email_verification)
    UserMailer.email_verification(user, token).deliver_later
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

  def self.send_ticket_confirmation(ticket)
    UserMailer.ticket_confirmation(ticket.user, ticket).deliver_later
  end

  def self.send_brand_invitation(email, brand, role)
    token = InvitationTokenService.encode(email: email, brand_id: brand.id, role: role)
    UserMailer.brand_invitation(email, brand, token).deliver_later
    token
  end

  def self.send_contact_message(params)
    contact = params.to_h.symbolize_keys
    UserMailer.contact_message(contact).deliver_later
  end
end
