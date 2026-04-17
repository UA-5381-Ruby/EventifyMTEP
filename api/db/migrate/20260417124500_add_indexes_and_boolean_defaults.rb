# frozen_string_literal: true

class AddIndexesAndBooleanDefaults < ActiveRecord::Migration[8.1]
  def change
    # Add unique indexes to match uniqueness validations
    add_index :categories, :name, unique: true unless index_exists?(:categories, :name, unique: true)
    add_index :users, :username, unique: true unless index_exists?(:users, :username, unique: true)
    add_index :users, :email, unique: true unless index_exists?(:users, :email, unique: true)

    # Use a partial index so multiple NULL qr_code values are allowed
    unless index_exists?(:tickets, :qr_code, unique: true)
      add_index :tickets, :qr_code, unique: true, where: 'qr_code IS NOT NULL'
    end

    # Ensure boolean columns are NOT NULL with sensible defaults
    change_table :users, bulk: true do
      change_column_default :users, :is_admin, from: nil, to: false
      change_column_null :users, :is_admin, false, false
    end

    change_table :tickets, bulk: true do
      change_column_default :tickets, :is_active, from: nil, to: false
      change_column_null :tickets, :is_active, false, false
    end
  end
end
