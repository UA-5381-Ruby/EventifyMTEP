# frozen_string_literal: true

class CreateTickets < ActiveRecord::Migration[8.1]
  def change
    create_table :tickets do |t|
      t.references :user, null: false, foreign_key: true
      t.references :event, null: false, foreign_key: true
      t.integer :rating
      t.text :comment
      t.string :qr_code
      t.boolean :is_active, default: false, null: false

      t.timestamps
    end
  end
end
