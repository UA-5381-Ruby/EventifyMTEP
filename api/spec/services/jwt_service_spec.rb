# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe JwtService do
  it 'successfully encodes and decodes a valid token' do
    valid_token = JwtService.encode({ user_id: 1 })
    result = JwtService.decode(valid_token)

    expect(result[:user_id]).to eq(1)
  end

  it 'returns nil when decoding an expired token (JWT::ExpiredSignature)' do
    # Створюємо токен, який "прострочився" годину тому
    expired_token = JwtService.encode({ user_id: 1 }, 1.hour.ago)
    result = JwtService.decode(expired_token)

    expect(result).to be_nil
  end

  it 'returns nil when decoding a completely invalid string (JWT::DecodeError)' do
    invalid_token = 'fake.invalid.token'
    result = JwtService.decode(invalid_token)

    expect(result).to be_nil
  end

  it 'returns nil when decoding a nil token' do
    result = JwtService.decode(nil)

    expect(result).to be_nil
  end

  describe '#valid_token_salt?' do
    let(:user) { create(:user) }

    it 'returns true if token salt matches user password_salt' do
      token = JwtService.encode(user_id: user.id, password_salt: user.password_salt)

      expect(JwtService.valid_token_salt?(token, user)).to be(true)
    end

    it 'returns false if token does not have password_salt' do
      token = JwtService.encode(user_id: user.id)

      expect(JwtService.valid_token_salt?(token, user)).to be(false)
    end

    it 'returns false if token salt does not match user password_salt' do
      token = JwtService.encode(user_id: user.id, password_salt: 'old_salt')
      user.update(password: 'newpassword123') # This changes password_salt

      expect(JwtService.valid_token_salt?(token, user)).to be(false)
    end

    it 'returns false if token is invalid' do
      expect(JwtService.valid_token_salt?('invalid.token', user)).to be(false)
    end
  end
end
