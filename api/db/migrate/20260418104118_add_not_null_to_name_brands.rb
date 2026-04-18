# frozen_string_literal: true

class AddNotNullToNameBrands < ActiveRecord::Migration[8.1]
  def change
    change_column_null :brands, :name, false
  end
end
