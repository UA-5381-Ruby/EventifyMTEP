# frozen_string_literal: true

class DeleteUnconfirmedUserJob < ApplicationJob
  queue_as :default

  def perform(user_id)
    user = User.find_by(id: user_id)
    return unless user

    return if user.is_confirmed?

    cutoff = user.confirmation_sent_at || user.created_at
    if cutoff <= 24.hours.ago
      user.destroy
    end
  end
end
