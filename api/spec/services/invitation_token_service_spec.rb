# frozen_string_literal: true

require 'rails_helper'

RSpec.describe InvitationTokenService do
  include ActiveSupport::Testing::TimeHelpers

  describe '.encode' do
    it 'returns a verifiable token with payload' do
      token = described_class.encode(email: 'user@example.com', brand_id: 1, role: 'member')

      payload = described_class.decode(token)
      expect(payload['email']).to eq('user@example.com')
      expect(payload['brand_id']).to eq(1)
      expect(payload['role']).to eq('member')
    end
  end

  describe '.decode' do
    it 'returns nil for tampered token' do
      token = described_class.encode(email: 'user@example.com', brand_id: 1, role: 'member')

      expect(described_class.decode("#{token}tampered")).to be_nil
    end

    it 'returns nil for expired token' do
      token = travel_to(8.days.ago) do
        described_class.encode(email: 'user@example.com', brand_id: 1, role: 'member')
      end

      expect(described_class.decode(token)).to be_nil
    end

    it 'returns nil when verifier raises InvalidSignature' do
      verifier = Rails.application.message_verifier(described_class::SALT)
      allow(Rails.application).to receive(:message_verifier).with(described_class::SALT).and_return(verifier)
      allow(verifier).to receive(:verified).and_raise(ActiveSupport::MessageVerifier::InvalidSignature)

      expect(described_class.decode('token')).to be_nil
    end
  end
end
