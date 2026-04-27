# 🚀 Event Platform API (v1) — Final (Production Ready)

---

# 📦 1. Domain Model (Updated DB)

## ✅ New Tables (Critical Fixes)

```sql
Table EventSubscriptions {
  id integer [primary key]
  user_id integer [ref: > Users.id, not null]
  event_id integer [ref: > Events.id, not null]

  indexes {
    (user_id, event_id) [unique]
  }
}

Table BrandRequests {
  id integer [primary key]
  user_id integer [ref: > Users.id, not null]
  name varchar [not null]
  description text
  status varchar [default: 'pending'] // pending | approved | rejected
  comment text
  created_at timestamp
}

Table Payments {
  id integer [primary key]
  user_id integer [ref: > Users.id, not null]
  amount decimal [not null]
  status varchar [not null] // pending | paid | failed
  provider varchar
  external_id varchar
  created_at timestamp
}
```

---

## 🔄 Updated Tables

### Events

```sql
+ capacity integer
+ price decimal
+ is_free boolean [default: false]
```

---

### Tickets

```sql
+ payment_id integer [ref: > Payments.id]
+ price decimal
+ status varchar // active | cancelled | refunded
```

---

# 🔐 2. Authentication

```md
POST   /api/v1/auth/register
POST   /api/v1/auth/confirm-email
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

POST   /api/v1/auth/password/reset
POST   /api/v1/auth/password/reset/confirm
```

### 🔒 Rules

* JWT (access + refresh)
* Rate limit:

    * login
    * password reset
* Email confirmation required

---

# 👤 3. Users

```md
GET    /api/v1/users/me
PATCH  /api/v1/users/me
PATCH  /api/v1/users/me/password

GET    /api/v1/users/me/subscriptions
```

---

# 🏢 4. Brands

```md
GET    /api/v1/brands
GET    /api/v1/brands/:id
```

---

# 📝 5. Brand Requests (Moderation)

```md
POST   /api/v1/brand-requests              (USER)

GET    /api/v1/admin/brand-requests        (ADMIN)
PATCH  /api/v1/admin/brand-requests/:id    (ADMIN)
```

### Body

```json
{
  "status": "approved" | "rejected",
  "comment": "Required if rejected"
}
```

---

# 👥 6. Brand Memberships (RBAC Core)

```md
GET    /api/v1/brands/:id/memberships          (owner/manager)
POST   /api/v1/brands/:id/memberships          (owner)
PATCH  /api/v1/brands/:id/memberships/:id      (owner)
DELETE /api/v1/brands/:id/memberships/:id      (owner)
```

---

# 🎉 7. Events

```md
GET    /api/v1/events
GET    /api/v1/events/:id

POST   /api/v1/brands/:brand_id/events     (manager)
PATCH  /api/v1/events/:id                 (manager)
```

---

# 🔄 8. Event Lifecycle (STRICT)

```md
draft
→ draft_on_review
→ published | rejected

published
→ published_on_review
→ published | published_rejected

published → archived | cancelled
```

---

## 🎯 Status Update Endpoint

```md
PATCH /api/v1/events/:id/status
```

```json
{
  "status": "published"
}
```

---

## 🔒 Rules

* Only managers/admin can change status
* Only valid transitions allowed (state machine)

---

# 🏷 9. Categories

```md
GET /api/v1/categories
```

---

```md
POST   /api/v1/events/:id/categories
DELETE /api/v1/events/:id/categories/:category_id
```

---

# 🔍 10. Filtering / Pagination / Sorting

```md
GET /api/v1/events?:
  page=1
  per_page=20
  sort=start_date
  order=asc|desc
  status=published
  category_id=1
  brand_id=1
  date_from=
  date_to=
```

---

# ⭐ 11. Event Subscriptions

```md
POST   /api/v1/events/:id/subscription
DELETE /api/v1/events/:id/subscription
```

---

# 🎟 12. Tickets

```md
POST   /api/v1/tickets
GET    /api/v1/tickets
GET    /api/v1/tickets/:id

POST   /api/v1/tickets/resend
```

---

## 🎯 Buy Tickets

```json
{
  "event_id": 1,
  "count": 2
}
```

---

## ⚙️ Processing Flow

1. Create Payment (status=pending)
2. Call payment provider
3. On success → create N tickets
4. Generate QR
5. Send email (async)

---

## 🔒 Idempotency (REQUIRED)

```http
Idempotency-Key: UUID
```

---

# 💳 13. Payments

```md
POST /api/v1/payments
GET  /api/v1/payments/:id
```

---

## Webhook (provider)

```md
POST /api/v1/payments/webhook
```

---

# ⭐ 14. Feedback (Anti-Fraud)

```md
POST /api/v1/tickets/:id/feedback
```

```json
{
  "rating": 5,
  "comment": "Great event"
}
```

---

## 🔒 Rules

* 1 ticket = 1 feedback
* Only ticket owner
* Only after event finished

---

# 🛡 15. Admin

```md
GET   /api/v1/admin/events?status=draft_on_review
PATCH /api/v1/admin/events/:id/status

GET   /api/v1/admin/brand-requests
PATCH /api/v1/admin/brand-requests/:id
```

---

# 👮 16. Roles & Permissions

```md
GUEST
USER
BRAND_MANAGER
BRAND_OWNER
ADMIN
```

---

## Core Rules

* USER:

    * tickets
    * subscriptions
    * feedback

* BRAND_MANAGER:

    * manage events

* BRAND_OWNER:

    * manage brand
    * manage members

* ADMIN:

    * moderation
    * full control

---

# 📊 17. Response Standards

## Pagination

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 120
  }
}
```

---

## Errors

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {}
  }
}
```

---

# ⚙️ 18. System Design Rules

---

## ✅ Async Processing (MANDATORY)

Queue:

* emails
* PDF tickets

---

## ✅ Security

* JWT + refresh
* email verification
* rate limiting

---

## ✅ Observability

* request_id
* audit logs:

    * event status change
    * brand approval

---

## ✅ Data Integrity

* unique constraints (subscriptions, memberships)
* transactional ticket purchase
* state machine for events

---

# 🧠 Final Tech Lead Notes

### ✔ Що тепер добре:

* DB і API синхронізовані
* RBAC через memberships
* lifecycle контрольований
* payments інтегровані
* anti-fraud (tickets → feedback)
* система готова до scaling
