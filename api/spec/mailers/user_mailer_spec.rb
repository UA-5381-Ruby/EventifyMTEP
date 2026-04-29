# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserMailer, type: :mailer do
  describe '#reset_password' do
    let(:user) do
      create(
        :user,
        name: 'Test',
        email: 'test@example.com'
      )
    end

    let(:token) { 'fake_token_123' }

    before do
      allow(ENV)
        .to receive(:fetch)
        .with('FRONTEND_URL')
        .and_return('http://localhost:3000')
    end

    subject(:mail) { UserMailer.reset_password(user, token) }

    it 'sends email to correct recipient' do
      expect(mail.to).to eq([user.email])
    end

    it 'sets correct subject' do
      expect(mail.subject).to eq('Reset your password')
    end

    it 'includes user name in email body' do
      expect(mail.body.encoded).to include('Hi Test')
    end

    it 'includes reset link in email body' do
      expected_link = "http://localhost:3000/reset?token=#{token}"
      expect(mail.body.encoded).to include(expected_link)
    end

    it 'generates valid mail object' do
      expect(mail).to be_present
      expect(mail.body).to be_present
    end

    it 'delivers email' do
      expect { mail.deliver_now }
        .to change { ActionMailer::Base.deliveries.count }.by(1)
    end
  end
end
