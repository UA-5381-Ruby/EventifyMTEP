# frozen_string_literal: true

Rails.logger.debug 'Bắt đầu заповнення бази даних (Seeding)...'

# ==========================================
# 1. Створення категорій
# ==========================================
category_names = %w[Concert Workshop Conference Networking Education]
category_names.each { |name| Category.find_or_create_by!(name: name) }

# Завантажуємо всі категорії в хеш для швидкого доступу: {'Concert' => <Category>, ...}
categories_map = Category.where(name: category_names).index_by(&:name)

# ==========================================
# 2. Створення користувачів
# ==========================================
admin_user = User.find_or_create_by!(email: 'admin@test.com') do |u|
  u.name          = 'Admin'
  u.password      = 'password123'
  u.is_superadmin = true
  u.is_confirmed  = true
end

# Звичайні користувачі
attendees = Array.new(5) do |i|
  User.find_or_create_by!(email: "user#{i + 1}@test.com") do |u|
    u.name          = "User #{i + 1}"
    u.password      = 'password123'
    u.is_superadmin = false
    u.is_confirmed  = true
  end
end

# ==========================================
# 3. Створення брендів та призначення власників
# ==========================================
brands_config = [
  { subdomain: 'tech-corp', name: 'Tech Corp', desc: 'Main tech brand organizing IT events', primary: '#000000', secondary: '#FFFFFF', owner: admin_user },
  { subdomain: 'music-live', name: 'Music Live UA', desc: 'Concerts and music festivals across Ukraine', primary: '#E50914', secondary: '#221F1F', owner: admin_user },
  { subdomain: 'skill-up', name: 'SkillUp Academy', desc: 'Educational workshops and courses', primary: '#4CAF50', secondary: '#E8F5E9', owner: attendees.first }
]

brands = {}

brands_config.each do |config|
  brand = Brand.find_or_create_by!(subdomain: config[:subdomain]) do |b|
    b.name            = config[:name]
    b.description     = config[:desc]
    b.primary_color   = config[:primary]
    b.secondary_color = config[:secondary]
  end

  BrandMembership.find_or_create_by!(user: config[:owner], brand: brand) do |m|
    m.role = 'owner'
  end

  # Зберігаємо бренд у хеш для створення подій
  brands[config[:subdomain]] = brand
end

# ==========================================
# 4. Створення подій
# ==========================================
Rails.logger.debug 'Seeding events...'

events_data = [
  # Tech Corp Events
  {
    title: 'Future Conf 2026', start_date: 1.month.from_now, end_date: 1.month.from_now + 8.hours,
    location: 'Kyiv, Parkovy', brand: brands['tech-corp'], status: :published, price_cents: 15_000, available_tickets_count: 500,
    categories: %w[Conference Networking]
  },
  {
    title: 'Ruby on Rails Meetup', start_date: 2.weeks.from_now, end_date: 2.weeks.from_now + 3.hours,
    location: 'Lviv, IZONE', brand: brands['tech-corp'], status: :published, price_cents: 5_000, available_tickets_count: 100,
    categories: %w[Education Networking]
  },
  {
    title: 'Past AI Summit', start_date: 2.months.ago, end_date: 2.months.ago + 5.hours,
    location: 'Online', brand: brands['tech-corp'], status: :archived, price_cents: 10_000, available_tickets_count: 300,
    categories: %w[Conference]
  },

  # Music Live UA Events
  {
    title: 'Summer Rock Fest', start_date: 3.months.from_now, end_date: 3.months.from_now + 12.hours,
    location: 'Kyiv, VDNG', brand: brands['music-live'], status: :published, price_cents: 85_000, available_tickets_count: 5000,
    categories: %w[Concert]
  },
  {
    title: 'Jazz & Wine Evening', start_date: Time.current.end_of_week + 19.hours, end_date: Time.current.end_of_week + 23.hours,
    location: 'Odesa, Green Theatre', brand: brands['music-live'], status: :published, price_cents: 45_000, available_tickets_count: 200,
    categories: %w[Concert Networking]
  },

  # SkillUp Academy Events
  {
    title: 'PostgreSQL Advanced Workshop', start_date: Time.current + 2.days, end_date: Time.current + 2.days + 4.hours,
    location: 'Online', brand: brands['skill-up'], status: :published, price_cents: 25_000, available_tickets_count: 50,
    categories: %w[Workshop Education]
  },
  {
    title: 'Design Patterns for Beginners', start_date: 1.week.ago, end_date: 1.week.ago + 2.hours,
    location: 'Kharkiv', brand: brands['skill-up'], status: :archived, price_cents: 0, available_tickets_count: 150,
    categories: %w[Education]
  }
]

events_data.each do |attrs|
  event_category_names = attrs.delete(:categories)

  event = Event.find_or_initialize_by(title: attrs[:title])
  event.update!(attrs)

  # Прив'язуємо категорії до події за допомогою нашого хеша
  event_category_names.each do |category_name|
    EventCategory.find_or_create_by!(
      event: event, 
      category: categories_map[category_name]
    )
  end
end

# Ticket.find_or_create_by!(user: user, event: first_event) do |t|
 # t.qr_code = "QR-#{SecureRandom.hex(6)}"
#end
# 5. Підсумки
# ==========================================
Rails.logger.debug "Done! Seeds summary:"
Rails.logger.debug "- #{User.count} users"
Rails.logger.debug "- #{Brand.count} brands"
Rails.logger.debug "- #{Event.count} events"