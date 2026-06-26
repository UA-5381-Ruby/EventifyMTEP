# frozen_string_literal: true

# rubocop:disable Metrics/AbcSize, Metrics/MethodLength
require 'faker'

RNG = Random.new(42)
Faker::Config.random = RNG

EVENT_DURATION_RANGE  = (2..8)
TICKET_CAPACITY_RANGE = (20..500)
MAX_PRICE_CENTS       = 50_000
DAYS_OFFSET_RANGE     = (-60..14)
MEMBERSHIPS_PER_BRAND = 3
USERS_COUNT           = 15
BRANDS_COUNT          = 8
EVENTS_COUNT          = 40

LOGO_FILES = %w[
  brands/logo1.jpg
  brands/logo2.jpg
  brands/logo3.jpg
  brands/logo4.jpg
].freeze

BANNER_FILES = %w[
  events/banner1.jpg
  events/banner2.jpg
  events/banner3.jpg
  events/banner4.jpg
].freeze

# ---------------- OPTIONAL STORAGE ----------------
S3 = begin
  S3BucketService.new
rescue StandardError
  nil
end

def upload_seed(path, folder:, filename: 'image.jpg')
  return nil if path.nil?
  return nil unless S3

  file_path = Rails.root.join("db/seed_files/#{path}")

  File.open(file_path) do |file|
    uploaded = ActionDispatch::Http::UploadedFile.new(
      tempfile: file,
      filename: filename,
      type: 'image/jpeg'
    )

    S3.upload(uploaded, folder: folder)
  end
end

# ---------------- PIPELINE ----------------
def run_seeds
  ActiveRecord::Base.transaction do
    users      = seed_users
    categories = seed_categories
    brands     = seed_brands(users)
    seed_memberships(brands, users)
    events     = seed_events(brands, categories)
    tickets    = seed_tickets(events, users)
    seed_feedback(tickets)
  end
end

# ---------------- USERS ----------------
def seed_admin
  User.find_or_create_by!(email: 'admin@test.com') do |u|
    u.name = 'Admin'
    u.password = '123123'
    u.is_superadmin = true
    u.is_confirmed = true
  end
end

def seed_normal_users
  USERS_COUNT.times.map do |i|
    User.find_or_create_by!(email: "user#{i}@test.com") do |u|
      u.name = Faker::Name.name
      u.password = '123123'
      u.is_confirmed = true
    end
  end
end

def seed_users
  [seed_admin, *seed_normal_users]
end

# ---------------- CATEGORIES ----------------
def seed_categories
  %w[Concert Workshop Conference Networking Education Gaming Startup Business Tech]
    .map { |name| Category.find_or_create_by!(name: name) }
end

# ---------------- BRANDS ----------------
def seed_brands(users)
  BRANDS_COUNT.times.map do |i|
    brand = Brand.find_or_initialize_by(subdomain: "brand#{i}")

    if brand.new_record?
      brand.assign_attributes(
        name: Faker::Company.name,
        description: Faker::Company.catch_phrase,
        primary_color: Faker::Color.hex_color.downcase,
        secondary_color: Faker::Color.hex_color.downcase,
        logo: upload_seed(LOGO_FILES.sample(random: RNG), folder: 'brands/logos')
      )

      brand.save!

      owner = users.sample(random: RNG)
      BrandMembership.create!(user: owner, brand: brand, role: 'owner')
    end

    brand
  end
end

def seed_memberships(brands, users)
  roles = %w[manager member].freeze

  brands.each do |brand|
    users.sample(MEMBERSHIPS_PER_BRAND, random: RNG).each do |user|
      BrandMembership.find_or_create_by!(user: user, brand: brand) do |m|
        m.role = roles.sample(random: RNG)
      end
    end
  end
end

# ---------------- EVENTS ----------------
def seed_events(brands, categories)
  statuses = Event.statuses.keys

  EVENTS_COUNT.times.map do |i|
    event = Event.find_or_initialize_by(title: "event-#{i}")

    is_new = event.new_record?

    if is_new
      days_offset = RNG.rand(DAYS_OFFSET_RANGE)
      start_date  = Time.current + days_offset.days
      end_date    = start_date + RNG.rand(EVENT_DURATION_RANGE).hours

      event.assign_attributes(
        brand: brands.sample(random: RNG),
        description: Faker::Lorem.paragraph(sentence_count: 5),
        location: %w[Lviv Kyiv Online].sample(random: RNG),
        start_date: start_date,
        end_date: end_date,
        status: statuses.sample(random: RNG),
        price_cents: RNG.rand(0..MAX_PRICE_CENTS),
        available_tickets_count: RNG.rand(TICKET_CAPACITY_RANGE),
        banner: upload_seed(BANNER_FILES.sample(random: RNG), folder: 'events/banners')
      )
    end

    event.save!

    event.category_ids = categories.sample(RNG.rand(1..3), random: RNG).map(&:id) if is_new

    event
  end
end

# ---------------- TICKETS ----------------
def seed_tickets(events, users)
  events.flat_map do |event|
    users.sample(RNG.rand(3..8), random: RNG).map do |user|
      ticket = Ticket.find_or_initialize_by(user: user, event: event)

      ticket.qr_code ||= SecureRandom.uuid
      ticket.save!

      ticket
    end
  end
end

# ---------------- FEEDBACK ----------------
def seed_feedback(tickets)
  return if tickets.empty?

  sample_size = [tickets.size / 2, 1].max

  tickets.sample(sample_size, random: RNG).each do |ticket|
    EventFeedback.find_or_create_by!(ticket: ticket) do |f|
      f.rating  = RNG.rand(1..5)
      f.comment = Faker::Lorem.sentence
    end
  end
end

run_seeds
# rubocop:enable Metrics/AbcSize, Metrics/MethodLength
