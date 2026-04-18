# frozen_string_literal: true

class AddUniqueIndexToOrganizers < ActiveRecord::Migration[8.1]
  def change
    add_index :organizers, %i[brand_id user_id], unique: true
  end
end
