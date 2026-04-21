# frozen_string_literal: true

class CreateMembershipsAndEvents < ActiveRecord::Migration[8.1]
  def change
    # The Join Table
    create_table :brand_memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :brand, null: false, foreign_key: true
      t.string :role, null: false

      t.timestamps
    end
    add_index :brand_memberships, %i[user_id brand_id], unique: true

    # Native Postgres Enum (Rails 7+)
    create_enum :event_status,
                %w[draft draft_on_review published rejected published_unverified published_on_review
                   published_rejected archived cancelled]

    # The Events Table
    create_table :events do |t|
      t.string :title, null: false
      t.text :description
      t.references :brand, null: false, foreign_key: true
      t.string :location
      t.datetime :start_date
      t.datetime :end_date
      t.enum :status, enum_type: 'event_status', default: 'draft'

      t.timestamps
    end
  end
end
