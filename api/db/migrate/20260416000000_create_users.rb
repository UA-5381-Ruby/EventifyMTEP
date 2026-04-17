# frozen_string_literal: true

class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :username
      t.string :email
      t.string :password_digest
      t.boolean :is_admin, default: false, null: false, allow_nil: false

      t.timestamps
    end
  end
end
