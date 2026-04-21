# frozen_string_literal: true

class CreateEvents < ActiveRecord::Migration[8.1]
  ##
  # Creates the `events` table with required `title` and `brand` foreign key,
  # optional `description`, `location`, `start_date`, and `end_date` columns.
  # Creates a native Postgres enum type `event_status` with predefined statuses.
  # Includes a `status` column backed by the enum (default `draft`), timestamps,
  # and indexes on `start_date`, `status`, and `title`.
  def change
    create_enum :event_status,
                %w[draft draft_on_review published rejected published_unverified published_on_review
                   published_rejected archived cancelled]

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
    add_index :events, :start_date
    add_index :events, :status
    add_index :events, :title
  end
end
