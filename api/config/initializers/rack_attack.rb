# frozen_string_literal: true

# Rack::Attack – rate limiting and throttling
#
# Environment variables (with sensible defaults):
#   RACK_ATTACK_LOGIN_LIMIT        – max requests per window on login endpoint  (default: 5)
#   RACK_ATTACK_LOGIN_PERIOD       – window in seconds for login throttle        (default: 60)
#   RACK_ATTACK_AUTH_LIMIT         – max requests per window on register/reset   (default: 10)
#   RACK_ATTACK_AUTH_PERIOD        – window in seconds for register/reset throttle (default: 60)

Rack::Attack.throttle(
  'auth/login',
  limit: ENV.fetch('RACK_ATTACK_LOGIN_LIMIT', 5).to_i,
  period: ENV.fetch('RACK_ATTACK_LOGIN_PERIOD', 60).to_i
) do |request|
  request.ip if request.path == '/api/v1/auth/login' && request.post?
end

Rack::Attack.throttle(
  'auth/register',
  limit: ENV.fetch('RACK_ATTACK_AUTH_LIMIT', 10).to_i,
  period: ENV.fetch('RACK_ATTACK_AUTH_PERIOD', 60).to_i
) do |request|
  request.ip if request.path == '/api/v1/auth/register' && request.post?
end

Rack::Attack.throttle(
  'auth/password_reset',
  limit: ENV.fetch('RACK_ATTACK_AUTH_LIMIT', 10).to_i,
  period: ENV.fetch('RACK_ATTACK_AUTH_PERIOD', 60).to_i
) do |request|
  request.ip if request.path == '/api/v1/auth/password/reset' && request.post?
end

Rack::Attack.throttled_responder = lambda do |_request|
  [
    429,
    { 'Content-Type' => 'application/json' },
    [{ error: 'Too many requests. Please try again later.' }.to_json]
  ]
end
