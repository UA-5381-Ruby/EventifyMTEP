# frozen_string_literal: true

class RenameOwnersToOrganizers < ActiveRecord::Migration[8.1]
  def change
    rename_table :owners, :organizers
  end
end
