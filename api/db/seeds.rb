# frozen_string_literal: true

# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Populate categories
categories = %w[Concert Workshop Conference Networking Education]
categories.each do |category_name|
  # Case-insensitive lookup to match existing records regardless of case
  # but still store the canonical cased name
  Category.where('lower(name) = ?', category_name.downcase).first_or_create!(name: category_name)
end

# Create admin user
user = User.find_by(username: 'admin') || User.create!(
  username: 'admin',
  email: 'admin@test.com',
  password: 'password123',
  is_admin: true
)

# Create brand
brand = Brand.find_or_create_by!(name: 'Tech Corp') do |b|
  b.description = 'Main tech brand',
  b.primary_color = '#FF0000',
  b.secondary_color = '#FF0000'
end

# Create owner relationship
Owner.find_or_create_by!(user: user, brand: brand)

# Seed events
Rails.logger.debug 'Seeding events...'

education_category = Category.find_by(name: 'Education')
conference_category = Category.find_by(name: 'Conference')
workshop_category = Category.find_by(name: 'Workshop')

events_data = [
  {
    title: 'Future Conf',
    start_date: 1.month.from_now,
    end_date: 1.month.from_now + 2.hours,
    location: 'Kyiv',
    brand: brand,
    category: conference_category,
    status: :published
  },
  {
    title: 'Past Meetup',
    start_date: 1.month.ago,
    end_date: 1.month.ago + 3.hours,
    location: 'Lviv',
    brand: brand,
    category: education_category,
    status: :archived
  },
  {
    title: 'Current Workshop',
    start_date: Time.current,
    end_date: 1.hour.from_now,
    location: 'Online',
    brand: brand,
    category: workshop_category,
    status: :published
  }
]

events_data.each do |attrs|
  event = Event.find_or_initialize_by(title: attrs[:title])
  event.update!(attrs)
end

Rails.logger.debug { "Done! #{Event.count} events seeded." }
