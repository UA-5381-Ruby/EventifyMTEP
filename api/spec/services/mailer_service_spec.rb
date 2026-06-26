# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MailerService do
  let(:user) { create(:user) }
  let(:ticket) { create(:ticket, user: user) }
  let(:brand) { create(:brand) }

  before do
    allow(UserMailer).to receive_message_chain(:email_verification, :deliver_later)
    allow(UserMailer).to receive_message_chain(:reset_password, :deliver_later)
    allow(UserMailer).to receive_message_chain(:ticket_confirmation, :deliver_later)
    allow(UserMailer).to receive_message_chain(:brand_invitation, :deliver_later)
  end

  describe '.send_email_verification' do
    it 'generates token and enqueues mail' do
      token = described_class.send_email_verification(user)

      expect(token).to be_present
      expect(UserMailer).to have_received(:email_verification).with(user, token)
    end
  end

  describe '.resend_email_verification' do
    it 'delegates to send_email_verification' do
      expect(described_class).to receive(:send_email_verification).with(user).and_call_original

      described_class.resend_email_verification(user)
    end
  end

  describe '.send_reset_password' do
    it 'generates token and enqueues mail' do
      token = described_class.send_reset_password(user)

      expect(token).to be_present
      expect(UserMailer).to have_received(:reset_password).with(user, token)
    end
  end

  describe '.send_ticket_confirmation' do
    it 'enqueues ticket confirmation mail' do
      described_class.send_ticket_confirmation(ticket)

      expect(UserMailer).to have_received(:ticket_confirmation).with(user, ticket)
    end
  end

  describe '.send_brand_invitation' do
    it 'encodes token and enqueues invitation mail' do
      token = described_class.send_brand_invitation('guest@example.com', brand, 'member')

      expect(token).to be_present
      expect(UserMailer).to have_received(:brand_invitation).with('guest@example.com', brand, token)
    end
  end

  describe '.send_contact_message' do
    it 'enqueues contact message mail' do
      allow(UserMailer).to receive_message_chain(:contact_message, :deliver_later)
      contact_params = { name: 'Alice', email: 'alice@example.com', message: 'Hello' }

      described_class.send_contact_message(contact_params)

      expect(UserMailer).to have_received(:contact_message).with(contact_params)
    end
  end
end
