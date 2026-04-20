# frozen_string_literal: true

class AddFieldsToBrands < ActiveRecord::Migration[8.1]
  def change
    add_column :brands, :primary_color, :string, null: false, default: '#3b82f6'
    add_column :brands, :secondary_color, :string, null: false, default: '#1f2937'
    add_index :brands, :subdomain, unique: true
  end
end
