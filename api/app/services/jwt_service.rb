# frozen_string_literal: true

class JwtService
  SECRET_KEY = ENV.fetch('JWT_SECRET_KEY') { Rails.application.secret_key_base.to_s }
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
