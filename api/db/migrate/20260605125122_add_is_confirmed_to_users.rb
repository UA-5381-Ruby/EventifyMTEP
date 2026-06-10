# frozen_string_literal: true

class AddIsConfirmedToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :is_confirmed, :boolean, default: false, null: false
    add_index :users, :is_confirmed
  end
end
