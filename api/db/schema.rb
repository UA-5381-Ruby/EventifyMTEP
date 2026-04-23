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

ActiveRecord::Schema[8.1].define(version: 2026_04_23_075033) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  # Custom types defined in this database.
  # Note that some types may not work with other database engines. Be careful if changing database.
  create_enum "event_status", ["draft", "draft_on_review", "published", "rejected", "published_unverified", "published_on_review", "published_rejected", "archived", "cancelled"]

  create_table "brand_memberships", force: :cascade do |t|
    t.bigint "brand_id", null: false
    t.datetime "created_at", null: false
    t.string "role", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["brand_id"], name: "index_brand_memberships_on_brand_id"
    t.index ["user_id", "brand_id"], name: "index_brand_memberships_on_user_id_and_brand_id", unique: true
    t.index ["user_id"], name: "index_brand_memberships_on_user_id"
  end

  create_table "brands", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "logo_url"
    t.string "name", null: false
    t.string "primary_color", default: "#000000", null: false
    t.string "secondary_color", default: "#FFFFFF", null: false
    t.string "subdomain", null: false
    t.datetime "updated_at", null: false
    t.index ["subdomain"], name: "index_brands_on_subdomain", unique: true
  end

  create_table "categories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_categories_on_name", unique: true
  end

  create_table "event_categories", force: :cascade do |t|
    t.bigint "category_id", null: false
    t.datetime "created_at", null: false
    t.bigint "event_id", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_event_categories_on_category_id"
    t.index ["event_id", "category_id"], name: "index_event_categories_on_event_id_and_category_id", unique: true
    t.index ["event_id"], name: "index_event_categories_on_event_id"
  end

  create_table "event_feedbacks", force: :cascade do |t|
    t.text "comment"
    t.datetime "created_at", null: false
    t.integer "rating"
    t.bigint "ticket_id", null: false
    t.datetime "updated_at", null: false
    t.index ["ticket_id"], name: "index_event_feedbacks_on_ticket_id"
  end

  create_table "events", force: :cascade do |t|
    t.bigint "brand_id", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.datetime "end_date"
    t.string "location"
    t.datetime "start_date"
    t.enum "status", default: "draft", enum_type: "event_status"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["brand_id"], name: "index_events_on_brand_id"
    t.index ["start_date"], name: "index_events_on_start_date"
    t.index ["status"], name: "index_events_on_status"
    t.index ["title"], name: "index_events_on_title"
  end

  create_table "tickets", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "event_id", null: false
    t.boolean "is_active", default: true, null: false
    t.string "qr_code", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["event_id"], name: "index_tickets_on_event_id"
    t.index ["qr_code"], name: "index_tickets_on_qr_code", unique: true
    t.index ["user_id"], name: "index_tickets_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.boolean "is_superadmin", default: false, null: false
    t.string "name"
    t.string "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "brand_memberships", "brands"
  add_foreign_key "brand_memberships", "users"
  add_foreign_key "event_categories", "categories"
  add_foreign_key "event_categories", "events"
  add_foreign_key "event_feedbacks", "tickets"
  add_foreign_key "events", "brands"
  add_foreign_key "tickets", "events"
  add_foreign_key "tickets", "users"
end
