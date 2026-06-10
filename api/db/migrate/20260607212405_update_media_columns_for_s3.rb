# frozen_string_literal: true

class UpdateMediaColumnsForS3 < ActiveRecord::Migration[8.1]
  def change
    remove_column :brands, :logo_url, :string
    add_column :brands, :logo, :string

    add_column :events, :banner, :string
  end
end
