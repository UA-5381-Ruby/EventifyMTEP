# frozen_string_literal: true

class FixTicketIsActiveDefault < ActiveRecord::Migration[8.1]
  def change
    change_column_default :tickets, :is_active, from: false, to: true
  end
end
