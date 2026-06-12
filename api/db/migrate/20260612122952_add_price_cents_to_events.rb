# frozen_string_literal: true

class AddPriceCentsToEvents < ActiveRecord::Migration[8.1]
  def change
    add_column :events, :price_cents, :integer
  end
end
