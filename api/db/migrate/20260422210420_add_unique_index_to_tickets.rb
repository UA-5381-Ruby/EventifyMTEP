# frozen_string_literal: true

class AddUniqueIndexToTickets < ActiveRecord::Migration[8.1]
  def change
    add_index :tickets, %i[user_id event_id], unique: true
  end
end
