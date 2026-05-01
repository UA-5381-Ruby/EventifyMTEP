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
  id integer [primary key]
  name varchar
  email varchar [unique, not null]
  password_digest varchar [not null]
  is_superadmin boolean [not null, default: false]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table brands {
  id integer [primary key]
  name varchar [not null]
  subdomain varchar [unique, not null]
  description text
  logo_url varchar
  primary_color varchar [not null, default: '#000000']
  secondary_color varchar [not null, default: '#FFFFFF']
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table categories {
  id integer [primary key]
  name varchar [unique, not null]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

// ==========================================
// ASSOCIATION TABLES
// ==========================================

Table brand_memberships {
  id integer [primary key]
  user_id integer [ref: > users.id, not null]
  brand_id integer [ref: > brands.id, not null]
  role varchar [not null, note: "Allowed values: owner, manager, user"]
  created_at timestamp [not null]
  updated_at timestamp [not null]

  indexes {
    (user_id, brand_id) [unique, name: 'index_brand_memberships_on_user_id_and_brand_id']
  }
}

Table events {
  id integer [primary key]
  title varchar [not null]
  description text
  brand_id integer [ref: > brands.id, not null]
  location varchar
  start_date timestamp
  end_date timestamp
  status event_status [default: 'draft']
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table event_categories {
  id integer [primary key]
  event_id integer [ref: > events.id, not null]
  category_id integer [ref: > categories.id, not null]
  created_at timestamp [not null]
  updated_at timestamp [not null]

  indexes {
    (event_id, category_id) [unique, name: 'index_event_categories_on_event_id_and_category_id']
  }
}

// ==========================================
// TICKETS AND FEEDBACK
// ==========================================

Table tickets {
  id integer [primary key]
  user_id integer [ref: > users.id, not null]
  event_id integer [ref: > events.id, not null]
  qr_code varchar [unique, not null]
  is_active boolean [not null, default: true]
  created_at timestamp [not null]
  updated_at timestamp [not null]

  indexes {
    (user_id, event_id) [unique, name: 'index_tickets_on_user_id_and_event_id']
  }
}

Table event_feedbacks {
  id integer [primary key]
  ticket_id integer [ref: > tickets.id, not null]
  rating integer [note: 'Allowed range: 1..5']
  comment text
  created_at timestamp [not null]
  updated_at timestamp [not null]
}
```

## Key relationships

- `users` ↔ `brands` is many-to-many through `brand_memberships`.
- `brands` has many `events`.
- `events` ↔ `categories` is many-to-many through `event_categories`.
- `users` ↔ `events` is many-to-many through `tickets`, with one ticket per user per event.
- `tickets` may have one associated `event_feedback` record in application code.

