# frozen_string_literal: true

class AddBrandRoleIndexToBrandMemberships < ActiveRecord::Migration[8.1]
  def change
    add_index :brand_memberships, %i[brand_id role], name: 'index_brand_memberships_on_brand_id_and_role'
  end
end
