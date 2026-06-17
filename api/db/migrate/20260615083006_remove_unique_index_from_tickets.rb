# frozen_string_literal: true

class RemoveUniqueIndexFromTickets < ActiveRecord::Migration[8.1]
  def change
    remove_index :tickets, column: %i[user_id event_id], unique: true
  end
end
