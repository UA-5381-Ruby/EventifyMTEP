# frozen_string_literal: true

module InvitationTokenService
  SALT = 'brand_invitation'

  def self.encode(email:, brand_id:, role:)
    Rails.application.message_verifier(SALT).generate(
      { email: email, brand_id: brand_id, role: role },
      expires_in: 7.days
    )
  end

  def self.decode(token)
    Rails.application.message_verifier(SALT).verified(token)
  rescue ActiveSupport::MessageVerifier::InvalidSignature,
    ActiveSupport::MessageExpired
    nil
  end
end