# frozen_string_literal: true

class AddBrandFieldsToBrands < ActiveRecord::Migration[8.1]
  def change
    add_brand_columns
    add_brand_index

    reversible do |dir|
      dir.up { backfill_and_lock_subdomain }
    end
  end

  private

  def add_brand_columns
    change_table :brands, bulk: true do |t|
      t.string :subdomain
      t.text :logo_url
      t.string :primary_color, default: '#3b82f6'
      t.string :secondary_color, default: '#1f2937'
    end
  end

  def add_brand_index
    add_index :brands, :subdomain, unique: true
  end

  def backfill_and_lock_subdomain
    Brand.reset_column_information

    Brand.find_each do |brand|
      brand.update!(subdomain: "brand-#{brand.id}")
    end

    change_column_null :brands, :subdomain, false
  end
end
