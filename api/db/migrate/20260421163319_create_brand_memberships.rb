# frozen_string_literal: true

class CreateBrandMemberships < ActiveRecord::Migration[8.1]
  ##
  # Creates the `bbrand_memberships` join table with required `user` and `brand`
  # foreign keys, a required `role` string, timestamps, and a unique composite
  # index on `[user_id, brand_id]`.
  def change
    create_table :brand_memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :brand, null: false, foreign_key: true
      t.string :role, null: false

      t.timestamps
    end
    add_index :brand_memberships, %i[user_id brand_id], unique: true
  end
end
