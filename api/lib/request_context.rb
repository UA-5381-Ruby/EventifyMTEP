# frozen_string_literal: true

class RequestContext
  @@current_user = nil
  @@current_ip = nil
  @@current_user_agent = nil

  def self.current_user
    @@current_user
  end

  def self.current_user=(user)
    @@current_user = user
  end

  def self.current_ip
    @@current_ip
  end

  def self.current_ip=(ip)
    @@current_ip = ip
  end

  def self.current_user_agent
    @@current_user_agent
  end

  def self.current_user_agent=(user_agent)
    @@current_user_agent = user_agent
  end

  def self.clear
    @@current_user = nil
    @@current_ip = nil
    @@current_user_agent = nil
  end
end
