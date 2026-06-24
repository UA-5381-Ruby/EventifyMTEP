# Database Reference

This document summarizes the current database model for the Rails API.

- Source of truth: `api/db/schema.rb`
- Format: DBML-style reference for readability
- DBML docs: https://dbml.dbdiagram.io/docs

![DB Schema](images/db-schema.png)

## Notes

- The application uses PostgreSQL.
- Event status is stored as a PostgreSQL enum.
- A user can only hold one ticket per event; that rule is enforced by a unique index.
- The application models `Ticket` → `EventFeedback` as a one-to-one relation (`has_one` / `belongs_to`), although the current database schema only adds a non-unique index on `event_feedbacks.ticket_id`.
- `users.is_confirmed` is used by email-verification flows before login is allowed.
- `events.banner`, `events.price_cents`, and `events.available_tickets_count` support media and paid-ticket workflows.

```dbml
// ==========================================
// ENUMS
// ==========================================

Enum event_status {
  draft
  draft_on_review
  published
  rejected
  published_unverified
  published_on_review
  published_rejected
  archived
  cancelled
}

// ==========================================
// CORE TABLES
// ==========================================

Table users {
  id bigint [primary key]
  name varchar
  email varchar [unique, not null]
  password_digest varchar [not null]
  is_confirmed boolean [not null, default: false]
  is_superadmin boolean [not null, default: false]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table brands {
  id bigint [primary key]
  name varchar [not null]
  subdomain varchar [unique, not null]
  description text
  logo varchar
  primary_color varchar [not null, default: '#000000']
  secondary_color varchar [not null, default: '#FFFFFF']
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table categories {
  id bigint [primary key]
  name varchar [unique, not null]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

// ==========================================
// ASSOCIATIONS
// ==========================================

Table brand_memberships {
  id bigint [primary key]
  user_id bigint [not null, ref: > users.id]
  brand_id bigint [not null, ref: > brands.id]
  role varchar [not null]

  created_at timestamp [not null]
  updated_at timestamp [not null]

  indexes {
    (user_id, brand_id) [unique]
  }
}

Table events {
  id bigint [primary key]
  title varchar [not null]
  description text
  brand_id bigint [not null, ref: > brands.id]

  location varchar
  start_date timestamp
  end_date timestamp

  status event_status [default: 'draft']

  banner varchar

  price_cents integer [not null, default: 0]
  available_tickets_count integer [not null, default: 0]

  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table event_categories {
  id bigint [primary key]
  event_id bigint [not null, ref: > events.id]
  category_id bigint [not null, ref: > categories.id]

  created_at timestamp [not null]

  indexes {
    (event_id, category_id) [unique]
  }
}

// ==========================================
// TICKETS + FEEDBACK
// ==========================================

Table tickets {
  id bigint [primary key]
  user_id bigint [not null, ref: > users.id]
  event_id bigint [not null, ref: > events.id]

  qr_code varchar [unique, not null]
  qr_image_key varchar [unique]

  is_active boolean [not null, default: true]

  created_at timestamp [not null]
  updated_at timestamp [not null]

  indexes {
    (qr_code) [unique]
    (qr_image_key) [unique]
  }
}

Table event_feedbacks {
  id bigint [primary key]
  ticket_id bigint [not null, ref: > tickets.id]

  rating integer
  comment text

  created_at timestamp [not null]
  updated_at timestamp [not null]

  indexes {
    (ticket_id)
  }
}
```

## Key relationships

- `users` ↔ `brands` is many-to-many through `brand_memberships`.
- `brands` has many `events`.
- `events` ↔ `categories` is many-to-many through `event_categories`.
- `users` ↔ `events` is many-to-many through `tickets`, with one ticket per user per event.
- `tickets` may have one associated `event_feedback` record in application code.

