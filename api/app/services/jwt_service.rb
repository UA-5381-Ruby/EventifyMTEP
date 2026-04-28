# frozen_string_literal: true

class JwtService
  env_secret = ENV['JWT_SECRET_KEY'].presence
  SECRET_KEY = env_secret || Rails.application.secret_key_base.to_s
  raise 'JWT_SECRET_KEY must be set in production' if Rails.env.production? && env_secret.blank?

  ALGORITHM = 'HS256'

  def self.encode(payload, exp = 24.hours.from_now)
    payload_with_exp = payload.merge(exp: exp.to_i)
    JWT.encode(payload_with_exp, SECRET_KEY, ALGORITHM)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY, true, { algorithm: ALGORITHM, verify_expiration: true })[0]
    HashWithIndifferentAccess.new(decoded)
  rescue JWT::ExpiredSignature, JWT::DecodeError
    nil
  end
end
