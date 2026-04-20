# frozen_string_literal: true

class AddFieldsToBrands < ActiveRecord::Migration[8.1]
  def change
    add_column :brands, :primary_color, :string, null: false
    add_column :brands, :secondary_color, :string, null: false
  end
end
