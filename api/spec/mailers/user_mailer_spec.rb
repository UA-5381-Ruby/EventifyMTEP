# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserMailer, type: :mailer do
  let(:user) { create(:user) }

  before do
    ENV['FRONTEND_URL'] = 'http://localhost:5173'
  end

  describe '#email_verification' do
    let(:token) { user.generate_token_for(:email_verification) }
    let(:mail) { UserMailer.email_verification(user, token) }

    it 'renders the email subject' do
      expect(mail.subject).to eq('Verify your email address')
    end

    it 'sends email to the user' do
      expect(mail.to).to eq([user.email])
    end

    it 'includes the verification link with token' do
      expect(mail.body.encoded).to include("http://localhost:5173/verify-email?token=#{token}")
    end

    it 'includes the user name in the email' do
      expect(mail.body.encoded).to include(user.name)
    end
  end

  describe '#reset_password' do
    let(:token) { user.generate_token_for(:password_reset) }
    let(:mail) { UserMailer.reset_password(user, token) }

    it 'renders the email subject' do
      expect(mail.subject).to eq('Reset your password')
    end

    it 'sends email to the user' do
      expect(mail.to).to eq([user.email])
    end

    it 'includes the reset link with token' do
      expect(mail.body.encoded).to include("http://localhost:5173/reset-password?token=#{token}")
    end

    it 'includes the user name in the email' do
      expect(mail.body.encoded).to include(user.name)
    end
  end

  describe '#ticket_confirmation' do
    let(:ticket) { create(:ticket, user: user) }
    let(:mail) { UserMailer.ticket_confirmation(user, ticket) }

    it 'renders subject with event title' do
      expect(mail.subject).to eq("Your ticket for #{ticket.event.title}")
    end

    it 'attaches a PDF ticket' do
      expect(mail.attachments.map(&:filename)).to include("ticket-#{ticket.qr_code}.pdf")
    end
  end

  describe '#brand_invitation' do
    let(:brand) { create(:brand) }
    let(:token) { 'invite-token' }
    let(:mail) { UserMailer.brand_invitation('guest@example.com', brand, token) }

    it 'renders invitation subject' do
      expect(mail.subject).to eq("You're invited to join #{brand.name}")
    end

    it 'includes accept link with token and brand id' do
      expect(mail.body.encoded).to include('accept-invitation?token=invite-token')
      expect(mail.body.encoded).to include("brand_id=#{brand.id}")
    end
  end
  describe '#contact_message' do
    let(:contact_params) do
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Hello',
        message: 'This is a test message.'
      }
    end
    let(:mail) { UserMailer.contact_message(contact_params) }

    it 'sends to the support address' do
      expect(mail.to).to eq(['support@eventify.com'])
    end

    it 'sets reply_to to the submitter\'s email' do
      expect(mail.reply_to).to eq(['jane@example.com'])
    end

    it 'renders subject with the contact subject interpolated' do
      expect(mail.subject).to eq('[Contact] Hello')
    end

    it 'includes the submitter name and message in the body' do
      expect(mail.body.encoded).to include('Jane Doe')
      expect(mail.body.encoded).to include('This is a test message.')
    end
  end
end
