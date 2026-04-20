# frozen_string_literal: true

class AddSubdomainToBrands < ActiveRecord::Migration[8.1]
  def change
    add_column :brands, :subdomain, :string
  end
end
