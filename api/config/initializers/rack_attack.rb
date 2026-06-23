# frozen_string_literal: true

module Rack
  class Attack
    throttle('api/v1/auth/login', limit: 5, period: 1.minute) do |req|
      req.ip if req.path == '/api/v1/auth/login' && req.post?
    end

    throttle('api/v1/auth/register', limit: 3, period: 1.hour) do |req|
      req.ip if req.path == '/api/v1/auth/register' && req.post?
    end

    throttle('api/v1/auth/password/reset', limit: 3, period: 1.hour) do |req|
      req.ip if req.path == '/api/v1/auth/password/reset' && req.post? && !req.params['token']
    end
  end
end

Rack::Attack.throttled_responder = lambda { |_env|
  message = I18n.t('api.v1.errors.too_many_requests')
  [429, { 'Content-Type' => 'application/json' }, [{ error: message }.to_json]]
}
