# frozen_string_literal: true

class CreateActivities < ActiveRecord::Migration[8.1]
  def change
    create_table :activities do |t|
      t.references :user, null: false, foreign_key: true
      t.string :activity_type, null: false, index: true
      t.string :resource_type, null: false
      t.bigint :resource_id
      t.string :resource_name
      t.string :status, null: false, default: 'success', index: true
      t.text :details
      t.string :ip_address
      t.string :user_agent

      t.timestamps
    end

    add_index :activities, %i[user_id created_at], order: { created_at: :desc }
    add_index :activities, %i[activity_type created_at], order: { created_at: :desc }
    add_index :activities, %i[resource_type resource_id]
  end
end
