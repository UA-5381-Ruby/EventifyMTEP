# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_16_174629) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "brands", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name"
    t.datetime "updated_at", null: false
  end

  create_table "events", force: :cascade do |t|
    t.bigint "brand_id", null: false
    t.bigint "category_id", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.datetime "end_date"
    t.string "location"
    t.datetime "start_date"
    t.string "status"
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["brand_id"], name: "index_events_on_brand_id"
    t.index ["category_id"], name: "index_events_on_category_id"
  end

  create_table "owners", force: :cascade do |t|
    t.bigint "brand_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["brand_id"], name: "index_owners_on_brand_id"
    t.index ["user_id"], name: "index_owners_on_user_id"
  end

  create_table "tickets", force: :cascade do |t|
    t.text "comment"
    t.datetime "created_at", null: false
    t.bigint "event_id", null: false
    t.boolean "is_active"
    t.string "qr_code"
    t.integer "rating"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["event_id"], name: "index_tickets_on_event_id"
    t.index ["user_id"], name: "index_tickets_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email"
    t.boolean "is_admin"
    t.string "password_digest"
    t.datetime "updated_at", null: false
    t.string "username"
  end

  add_foreign_key "events", "brands"
  add_foreign_key "events", "categories"
  add_foreign_key "owners", "brands"
  add_foreign_key "owners", "users"
  add_foreign_key "tickets", "events"
  add_foreign_key "tickets", "users"
end
