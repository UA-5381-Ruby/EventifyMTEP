# frozen_string_literal: true

require 'rails_helper'

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
end
