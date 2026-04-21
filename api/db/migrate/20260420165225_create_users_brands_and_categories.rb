# frozen_string_literal: true

class CreateUsersBrandsAndCategories < ActiveRecord::Migration[8.1]
  ##
  # Creates the `users`, `brands`, and `categories` database tables used by the application.
  def change
    create_users_table
    create_brands_table
    create_categories_table
  end

  private

  ##
  # Creates the `users` database table.
  # 
  # The table includes: `name` (string); `email` (string, not null) with a unique index; `password_digest` (string, not null); `is_superadmin` (boolean, default `false`, not null); and standard Rails timestamp columns.
  def create_users_table
    create_table :users do |t|
      t.string :name
      t.string :email, null: false, index: { unique: true }
      t.string :password_digest, null: false
      t.boolean :is_superadmin, default: false, null: false

      t.timestamps
    end
  end

  ##
  # Creates the `brands` database table with required columns, defaults, and a unique index on `subdomain`.
  #
  # Columns:
  # - `name` : string, `null: false`
  # - `subdomain` : string, `null: false`, unique index
  # - `description` : text
  # - `logo_url` : string
  # - `primary_color` : string, `null: false`, default `'#000000'`
  # - `secondary_color` : string, `null: false`, default `'#FFFFFF'`
  # - standard Rails `created_at` and `updated_at` timestamps.
  def create_brands_table
    create_table :brands do |t|
      t.string :name, null: false
      t.string :subdomain, null: false, index: { unique: true }
      t.text :description
      t.string :logo_url
      t.string :primary_color, null: false, default: '#000000'
      t.string :secondary_color, null: false, default: '#FFFFFF'

      t.timestamps
    end
  end

  ##
  # Creates the `categories` database table with a required unique `name` column and Rails timestamp columns.
  # The `name` column is a non-null string with a unique index; standard `created_at` and `updated_at` timestamps are added.
  def create_categories_table
    create_table :categories do |t|
      t.string :name, null: false, index: { unique: true }

      t.timestamps
    end
  end
end
