# frozen_string_literal: true

class AddUniqueConstraintToTickets < ActiveRecord::Migration[8.1]
  def change
    add_index :tickets, [:user_id, :event_id], unique: true
  end
end
