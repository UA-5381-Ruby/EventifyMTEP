# frozen_string_literal: true

class DeleteUnconfirmedUserJob < ApplicationJob
  queue_as :default

  def perform(user_id)
    user = User.find_by(id: user_id)
    return unless user
    return if user.is_confirmed?

    user.destroy
  end
end
