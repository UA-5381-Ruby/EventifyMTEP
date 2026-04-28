# frozen_string_literal: true

# Populate categories
categories = %w[Concert Workshop Conference Networking Education]
categories.each do |category_name|
  Category.find_or_create_by!(name: category_name)
end

# Create admin user
# CHANGED: 'username' -> 'name', 'is_admin' -> 'is_superadmin', relying on email for uniqueness
user = User.find_or_create_by!(email: 'admin@test.com') do |u|
  u.name = 'admin'
  u.password = 'password123'
  u.is_superadmin = true
end

# Create brand
# CHANGED: Added required 'subdomain' column to the lookup block
brand = Brand.find_or_create_by!(subdomain: 'tech-corp') do |b|
  b.name = 'Tech Corp'
  b.description = 'Main tech brand'
  b.primary_color = '#000000'
  b.secondary_color = '#FFFFFF'
end

# Create owner relationship
# CHANGED: Replaced the old 'Owner' model with the new join model 'BrandMembership'
BrandMembership.find_or_create_by!(user: user, brand: brand) do |m|
  m.role = 'owner'
end

# Seed events
Rails.logger.debug 'Seeding events...'

education_category = Category.find_by!(name: 'Education')
conference_category = Category.find_by!(name: 'Conference')
workshop_category = Category.find_by!(name: 'Workshop')
networking_category = Category.find_by!(name: 'Networking')

events_data = [
  {
    title: 'Future Conf',
    start_date: 1.month.from_now,
    end_date: 1.month.from_now + 2.hours,
    location: 'Kyiv',
    brand: brand,
    # CHANGED: 'category' -> 'categories' (accepts an array of objects)
    categories: [conference_category, networking_category],
    status: :published
  },
  {
    title: 'Past Meetup',
    start_date: 1.month.ago,
    end_date: 1.month.ago + 3.hours,
    location: 'Lviv',
    brand: brand,
    categories: [education_category],
    status: :archived
  },
  {
    title: 'Current Workshop',
    start_date: Time.current,
    end_date: 1.hour.from_now,
    location: 'Online',
    brand: brand,
    categories: [workshop_category],
    status: :published
  }
]

events_data.each do |attrs|
  # 1. Витягуємо категорії з хешу атрибутів, щоб вони не потрапили в update!
  event_categories = attrs.delete(:categories)

  # 2. Знаходимо або створюємо сам івент з іншими полями
  event = Event.find_or_initialize_by(title: attrs[:title])
  event.update!(attrs)

  # 3. Безпечно додаємо категорії по одній, уникаючи дублікатів
  event_categories.each do |category|
    EventCategory.find_or_create_by!(event: event, category: category)
  end
end

first_event = Event.first

Ticket.find_or_create_by!(user: user, event: first_event) do |t|
  t.qr_code = "QR-#{SecureRandom.hex(6)}"
end

Rails.logger.debug { "Done! #{Event.count} events seeded." }
