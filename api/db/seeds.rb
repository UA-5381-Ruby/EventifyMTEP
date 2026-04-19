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

User.find_or_create_by!(username: 'admin') do |u|
  u.email = 'admin@test.com',
            u.password = 'password123',
            u.is_admin = true
end

user = User.find_by(username: 'admin') || User.create!(
  username: 'admin',
  email: 'admin@test.com',
  password: 'password123',
  is_admin: true
)

brand = Brand.find_or_create_by!(name: 'Tech Corp') do |b|
  b.description = 'Main tech brand'
end

category = Category.find_or_create_by!(name: 'Education')

Owner.find_or_create_by!(user: user, brand: brand)

Rails.logger.debug 'Seeding events...'
# Event.destroy_all

events_data = [
  {
    title: 'Future Conf',
    start_date: 1.month.from_now,
    end_date: 1.month.from_now + 2.hours,
    location: 'Kyiv',
    brand: brand,
    category: category,
    status: :published
  },
  {
    title: 'Past Meetup',
    start_date: 1.month.ago,
    end_date: 1.month.ago + 3.hours,
    location: 'Lviv',
    brand: brand,
    category: category,
    status: :archived
  },
  {
    title: 'Current Workshop',
    start_date: Time.current,
    end_date: 1.hour.from_now,
    location: 'Online',
    brand: brand,
    category: category,
    status: :published
  }
]

events_data.each do |attrs|
  event = Event.find_or_initialize_by(title: attrs[:title])
  event.update!(attrs)
end

Rails.logger.debug { "Done! #{Event.count} events seeded." }
