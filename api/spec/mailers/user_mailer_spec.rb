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
      # Мокаємо ENV щоб не впасти на ENV.fetch
      allow(ENV)
        .to receive(:fetch)
        .with('FRONTEND_URL')
        .and_return('http://localhost:3000')
    end

    it 'sends email to correct recipient' do
      mail = UserMailer.reset_password(user, token)

      expect(mail.to).to eq([user.email])
    end

    it 'sets correct subject' do
      mail = UserMailer.reset_password(user, token)

      expect(mail.subject)
        .to eq('Reset your password')
    end

    it 'includes user name in email body' do
      mail = UserMailer.reset_password(user, token)

      expect(mail.body.encoded)
        .to include('Hi Test')
    end

    it 'includes reset link in email body' do
      mail = UserMailer.reset_password(user, token)

      expected_link =
        "http://localhost:3000/reset?token=#{token}"

      expect(mail.body.encoded)
        .to include(expected_link)
    end

    it 'generates valid mail object' do
      mail = UserMailer.reset_password(user, token)

      expect(mail).to be_present
      expect(mail.body).to be_present
    end

    it 'delivers email' do
      expect do
        UserMailer
          .reset_password(user, token)
          .deliver_now
      end.to change { ActionMailer::Base.deliveries.count }.by(1)
    end
  end
end
