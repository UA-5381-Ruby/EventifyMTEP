# frozen_string_literal: true

class AddUniqueConstraintToTickets < ActiveRecord::Migration[8.1]
  def up
    # Remove duplicates keeping only the most recent ticket per user/event
    execute <<~SQL.squish
      DELETE FROM tickets
      WHERE id NOT IN (
        SELECT MAX(id) FROM tickets GROUP BY user_id, event_id
      )
    SQL
    add_index :tickets, %i[user_id event_id], unique: true
  end

  def down
    remove_index :tickets, %i[user_id event_id], unique: true
  end
end
