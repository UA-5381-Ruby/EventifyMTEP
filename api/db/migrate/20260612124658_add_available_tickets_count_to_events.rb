# frozen_string_literal: true

class AddAvailableTicketsCountToEvents < ActiveRecord::Migration[8.1]
  def change
    add_column :events, :available_tickets_count, :integer
  end
end
