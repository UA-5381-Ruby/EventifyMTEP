# frozen_string_literal: true

class RequestContext < ActiveSupport::CurrentAttributes
  attribute :current_user, :current_ip, :current_user_agent
end
