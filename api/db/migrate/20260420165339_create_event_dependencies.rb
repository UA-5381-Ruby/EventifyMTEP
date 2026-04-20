# frozen_string_literal: true

class CreateEventDependencies < ActiveRecord::Migration[8.1]
  def change
    # Many-to-Many Categories
    create_table :event_categories do |t|
      t.references :event, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true

      t.timestamps
    end
    add_index :event_categories, %i[event_id category_id], unique: true

    # Tickets for Access
    create_table :tickets do |t|
      t.references :user, null: false, foreign_key: true
      t.references :event, null: false, foreign_key: true
      t.string :qr_code, null: false, index: { unique: true }
      t.boolean :is_active, default: true, null: false

      t.timestamps
    end

    # 1-to-1 Feedback
    create_table :event_feedbacks do |t|
      t.references :ticket, null: false, foreign_key: true # Links to Ticket, not User directly
      t.integer :rating
      t.text :comment

      t.timestamps
    end
  end
end
