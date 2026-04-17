# frozen_string_literal: true

class CreateOwners < ActiveRecord::Migration[8.1]
  def change
    create_table :owners do |t|
      t.references :user, null: false, foreign_key: true
      t.references :brand, null: false, foreign_key: true

      t.timestamps
    end
  end
end
