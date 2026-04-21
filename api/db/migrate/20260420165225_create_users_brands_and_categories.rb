# frozen_string_literal: true

class CreateUsersBrandsAndCategories < ActiveRecord::Migration[8.1]
  def change
    create_users_table
    create_brands_table
    create_categories_table
  end

  private

  def create_users_table
    create_table :users do |t|
      t.string :name
      t.string :email, null: false, index: { unique: true }
      t.string :password_digest, null: false
      t.boolean :is_superadmin, default: false, null: false

      t.timestamps
    end
  end

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

  def create_categories_table
    create_table :categories do |t|
      t.string :name, null: false, index: { unique: true }

      t.timestamps
    end
  end
end
