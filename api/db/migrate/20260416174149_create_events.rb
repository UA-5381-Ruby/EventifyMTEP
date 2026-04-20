# frozen_string_literal: true

class CreateEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :events do |t|
      t.string :title, null: false
      t.text :description
      t.string :location, null: false
      t.string :status, null: false, default: 'draft'
      t.datetime :start_date, null: false
      t.datetime :end_date
      t.references :brand, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true

      t.timestamps
    end

    add_index :events, :title
    add_index :events, :start_date
    add_index :events, :status
  end
end
