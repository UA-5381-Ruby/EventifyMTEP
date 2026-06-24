# frozen_string_literal: true

require 'faker'

# Helpers
def s3
  @s3_bucket_service ||= S3BucketService.new
end

def seed_file(path)
  Rails.root.join("db/seed_files/#{path}")
end

def fake_upload(path, filename:)
  ActionDispatch::Http::UploadedFile.new(
    tempfile: File.open(seed_file(path)),
    filename: filename,
    type: "image/jpeg"
  )
end

def upload_seed(path, folder:, filename: "image.jpg")
  file = fake_upload(path, filename: filename)
  s3.upload(file, folder: folder)
end

# Seeds pipeline
def run_seeds
  users = seed_users
  categories = seed_categories
  brands = seed_brands(users)
  events = seed_events(brands, categories)
  tickets = seed_tickets(events, users)
  seed_feedback(tickets)
end

# ---------------- USERS ----------------
def seed_users
  admin = User.find_or_create_by!(email: 'admin@test.com') do |u|
    u.name = 'Admin'
    u.password = '123123'
    u.is_superadmin = true
    u.is_confirmed = true
  end

  users = 15.times.map do |i|
    email = "user#{i}@test.com"

    User.find_or_create_by!(email: email) do |u|
      u.name = Faker::Name.name
      u.password = '123123'
      u.is_confirmed = [true, true, false].sample
    end
  end

  [admin, *users]
end

# ---------------- CATEGORIES ----------------
def seed_categories
  %w[
    Concert Workshop Conference Networking Education
    Gaming Startup Business Tech
  ].map do |name|
    Category.find_or_create_by!(name: name)
  end
end

# ---------------- BRANDS ----------------
def seed_brands(users)
  logo_files = %w[
    brands/logo1.jpg
    brands/logo2.jpg
    brands/logo3.jpg
    brands/logo4.jpg
  ]

  brands = []

  8.times do |i|
    subdomain = "brand#{i}"
    owner = users.sample

    brand = Brand.find_or_create_by!(subdomain: subdomain) do |b|
      b.name = Faker::Company.name
      b.description = Faker::Company.catch_phrase
      b.primary_color = Faker::Color.hex_color.downcase
      b.secondary_color = Faker::Color.hex_color.downcase
      b.logo = upload_seed(logo_files.sample, folder: "brands/logos")
    end

    brands << brand

    # гарантований owner
    BrandMembership.find_or_create_by!(user: owner, brand: brand) do |m|
      m.role = 'owner'
    end
  end

  seed_memberships(brands, users)
  brands
end

def seed_memberships(brands, users)
  roles = %w[manager member]

  brands.each do |brand|
    users.sample(3).each do |user|
      BrandMembership.find_or_create_by!(user: user, brand: brand) do |m|
        m.role = roles.sample
      end
    end
  end
end

# ---------------- EVENTS ----------------
def seed_events(brands, categories)
  statuses = Event.statuses.keys

  banner_files = %w[
    events/banner1.jpg
    events/banner2.jpg
    events/banner3.jpg
    events/banner4.jpg
  ]

  events = []

  40.times do |i|
    start_date =
      if rand < 0.5
        Time.current + rand(1..14).days
      else
        Time.current - rand(1..60).days
      end

    event = Event.find_or_initialize_by(title: "event-#{i}")

    event.assign_attributes(
      brand: brands.sample,
      description: Faker::Lorem.paragraph(sentence_count: 5),
      location: %w[Lviv Kyiv Dnipro Online].sample,
      start_date: start_date,
      end_date: start_date + rand(2..8).hours,
      status: statuses.sample,
      price_cents: rand(0..50_000),
      available_tickets_count: rand(20..500),
      banner: upload_seed(banner_files.sample, folder: "events/banners")
    )

    event.save!
    event.categories = categories.sample(rand(1..3))

    events << event
  end

  events
end

# ---------------- TICKETS ----------------
def seed_tickets(events, users)
  tickets = []

  events.each do |event|
    users.sample(rand(3..8)).each do |user|
      ticket = Ticket.find_or_create_by!(user: user, event: event) do |t|
        t.qr_code = SecureRandom.uuid
      end

      tickets << ticket
    end
  end

  tickets
end

# ---------------- FEEDBACK ----------------
def seed_feedback(tickets)
  return if tickets.empty?

  tickets.sample(tickets.size / 2).each do |ticket|
    EventFeedback.find_or_create_by!(ticket: ticket) do |f|
      f.rating = rand(1..5)
      f.comment = Faker::Lorem.sentence
    end
  end
end

run_seeds
