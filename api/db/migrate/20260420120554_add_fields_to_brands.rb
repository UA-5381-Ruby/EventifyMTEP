# frozen_string_literal: true

class AddFieldsToBrands < ActiveRecord::Migration[8.1]
  def change
    change_table :brands, bulk: true do |t|
      t.string :primary_color, null: false, default: '#3b82f6'
      t.string :secondary_color, null: false, default: '#1f2937'
    end

    add_index :brands, :subdomain, unique: true
  end
end
