# frozen_string_literal: true

class Rack::Attack
  # Prevent brute force attacks on login
  throttle('api/v1/auth/login', limit: 5, period: 1.minute) do |req|
    req.ip if req.path == '/api/v1/auth/login' && req.post?
  end

  # Prevent registration spam
  throttle('api/v1/auth/register', limit: 20, period: 1.hour) do |req|
    req.ip if req.path == '/api/v1/auth/register' && req.post?
  end

  # Prevent password reset request spam (email bombing)
  throttle('api/v1/auth/password/reset', limit: 3, period: 1.hour) do |req|
    req.ip if req.path == '/api/v1/auth/password/reset' && req.post? && !req.params['token']
  end
end

# Customize the throttled response
Rack::Attack.throttled_responder = lambda { |env|
  [429, { 'Content-Type' => 'application/json' }, [{ error: 'Too many requests. Please try again later.' }.to_json]]
}
