# frozen_string_literal: true

class CreateEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :events do |t|
      t.string :title, null: false
      t.text :description
      t.string :location, null: false
      t.integer :status, null: false, default: 0
      t.datetime :start_date, null: false
      t.datetime :end_date
      t.references :brand, null: false, foreign_key: false
      t.references :category, null: true, foreign_key: false

      t.timestamps
    end

    add_index :events, :title
    add_index :events, :start_date
    add_index :events, :status
  end
end
