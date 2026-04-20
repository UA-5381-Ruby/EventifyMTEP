# frozen_string_literal: true

class AddCaseInsensitiveUniqueIndexToCategories < ActiveRecord::Migration[8.1]
  def change
    remove_index :categories, :name, unique: true if index_exists?(:categories, :name, unique: true)

    add_index :categories, 'LOWER(name)', unique: true, name: 'index_categories_on_lower_name'
  end
end
