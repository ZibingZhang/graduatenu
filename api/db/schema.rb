# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_11_26_215242) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "courses", force: :cascade do |t|
    t.integer "class_id", null: false
    t.string "subject", null: false
    t.bigint "user_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_courses_on_user_id"
  end

  create_table "plans", force: :cascade do |t|
    t.string "name"
    t.boolean "link_sharing_enabled"
    t.json "schedule"
    t.bigint "user_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "major"
    t.string "coop_cycle"
    t.json "course_warnings", default: [], array: true
    t.json "warnings", default: [], array: true
    t.integer "course_counter"
    t.boolean "is_currently_being_edited", default: false, null: false
    t.index ["user_id"], name: "index_plans_on_user_id"
  end

  create_table "template_plans", force: :cascade do |t|
    t.string "name", null: false
    t.integer "catalog_year", null: false
    t.json "schedule"
    t.string "major", null: false
    t.string "coop_cycle", null: false
    t.bigint "user_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_template_plans_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "username"
    t.integer "academic_year"
    t.integer "graduation_year"
    t.string "major"
    t.string "coop_cycle"
    t.string "image_url"
    t.boolean "is_advisor", default: false, null: false
    t.string "nu_id"
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "plans", "users"
end
