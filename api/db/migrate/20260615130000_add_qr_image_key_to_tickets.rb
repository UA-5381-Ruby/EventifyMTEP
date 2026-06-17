# frozen_string_literal: true

class AddQrImageKeyToTickets < ActiveRecord::Migration[8.1]
  def change
    add_column :tickets, :qr_image_key, :string
    add_index :tickets, :qr_image_key, unique: true
  end
end
