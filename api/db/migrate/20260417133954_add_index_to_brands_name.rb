# frozen_string_literal: true

class AddIndexToBrandsName < ActiveRecord::Migration[8.1]
  def change
    add_index :brands, :name
  end
end
