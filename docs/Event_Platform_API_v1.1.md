# Eventify API v1.1

This document is an implementation-aligned API summary for the current repository.

## Scope of this document

This file is based on the code currently present in:

- `api/config/routes.rb`
- `api/app/controllers/`
- `api/app/policies/`
- `api/swagger/v1/swagger.yaml`

It intentionally describes what is implemented now, not earlier roadmap ideas that are not yet present in the codebase.

## Base conventions

- Base API path: `/api/v1`
- Authentication: JWT bearer token in the `Authorization` header for protected endpoints
- Swagger UI: `/api-docs` in development and test environments
- Primary generated OpenAPI file: `api/swagger/v1/swagger.yaml`

## Current domain model

The implemented API currently centers on:

- users
- brands
- brand memberships
- events
- event categories
- categories
- tickets
- event feedback

For the schema overview, see [`DB.md`](DB.md).

## Authentication endpoints

| Method | Path | Access | Purpose |
| ------ | ---- | ------ | ------- |
| POST | `/api/v1/auth/register` | Public | Create a user and return a JWT token. |
| POST | `/api/v1/auth/login` | Public | Authenticate with email and password and return a JWT token. |
| POST | `/api/v1/auth/password/reset` | Public | Request a password reset email, or confirm a reset when `token` is passed as a query parameter. |

### Register request body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login request body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Password reset flows

Request reset instructions:

```json
{
  "email": "john@example.com"
}
```

Confirm the reset by calling the same endpoint with a query token:

```text
POST /api/v1/auth/password/reset?token=<signed_token>
```

```json
{
  "new_password": "newpassword123"
}
```

## Users

| Method | Path | Access | Notes |
| ------ | ---- | ------ | ----- |
| GET | `/api/v1/users` | Authenticated | Lists users. |
| GET | `/api/v1/users/:id` | Authenticated | Shows a user profile. |
| PATCH/PUT | `/api/v1/users/:id` | Authenticated | Allowed for the same user or a superadmin. |
| DELETE | `/api/v1/users/:id` | Authenticated | Allowed for the same user or a superadmin. |

## Brands

| Method | Path | Access | Notes |
| ------ | ---- | ------ | ----- |
| GET | `/api/v1/brands` | Public | Lists brands. |
| POST | `/api/v1/brands` | Authenticated | Creates a brand and assigns the creator as `owner`. |
| GET | `/api/v1/brands/:id` | Public | Shows a brand and its associated events. |
| PATCH/PUT | `/api/v1/brands/:id` | Authenticated | Allowed for brand owners and superadmins. |
| DELETE | `/api/v1/brands/:id` | Authenticated | Allowed for brand owners and superadmins. |

### Brand memberships

| Method | Path | Access | Notes |
| ------ | ---- | ------ | ----- |
| GET | `/api/v1/brands/:brand_id/memberships` | Authenticated | Members can list memberships; response is paginated. |
| POST | `/api/v1/brands/:brand_id/memberships` | Authenticated | Owners can add any role. Managers can add non-owner roles. Superadmins can add any role. |
| PATCH/PUT | `/api/v1/brands/:brand_id/memberships/:id` | Authenticated | Same role restrictions as create. |
| DELETE | `/api/v1/brands/:brand_id/memberships/:id` | Authenticated | Owners and superadmins can remove anyone; managers can only remove `user` members. |

Additional application rules:

- a brand must keep at least one owner
- duplicate memberships are rejected
- membership lists support `page` and `per_page`

## Events

| Method | Path | Access | Notes |
| ------ | ---- | ------ | ----- |
| GET | `/api/v1/events` | Public | Returns a paginated event list with filters and sorting. |
| GET | `/api/v1/events/:id` | Authenticated | Returns one event including brand and category data. |
| POST | `/api/v1/events` | Authenticated | Current policy allows only superadmins to create events. |

### Event list filters

`GET /api/v1/events` currently supports these query parameters:

| Parameter | Purpose |
| --------- | ------- |
| `page` | Page number, minimum `1`. |
| `per_page` | Page size, clamped to `1..100`. |
| `sort` | Sort column. Allowed values are controlled in the model. |
| `order` | Sort direction: `asc` or `desc`. |
| `q` | Case-insensitive title search. |
| `from` | Lower bound for `start_date`. |
| `to` | Upper bound for `start_date`. |
| `brand_id` | Exact brand filter. |
| `status` | Exact status filter. |
| `category_id` | Filter by linked category. |

### Event categories

| Method | Path | Access | Notes |
| ------ | ---- | ------ | ----- |
| GET | `/api/v1/events/:event_id/categories` | Authenticated | Lists categories linked to an event. |
| POST | `/api/v1/events/:event_id/categories` | Authenticated | Owner, manager, or superadmin can link a category. |
| DELETE | `/api/v1/events/:event_id/categories/:category_id` | Authenticated | Owner, manager, or superadmin can remove a category. |

### Event lifecycle transitions

The `Event` model uses `AASM` for lifecycle management.

Implemented transition endpoints:

| Method | Path | Allowed by policy | Result |
| ------ | ---- | ----------------- | ------ |
| POST | `/api/v1/events/:id/submit` | brand owner, brand manager, or superadmin | `draft -> draft_on_review` or `published_unverified -> published_on_review` when required fields are present |
| POST | `/api/v1/events/:id/approve` | superadmin | `draft_on_review -> published` or `published_on_review -> published` |
| POST | `/api/v1/events/:id/reject` | superadmin | `draft_on_review -> rejected` or `published_on_review -> published_rejected` |
| POST | `/api/v1/events/:id/cancel` | brand owner, brand manager, or superadmin | Moves the event to `cancelled` and deactivates active tickets |

Current event statuses in the database:

```text
draft
draft_on_review
published
rejected
published_unverified
published_on_review
published_rejected
archived
cancelled
```

## Categories

| Method | Path | Access | Notes |
| ------ | ---- | ------ | ----- |
| GET | `/api/v1/categories` | Authenticated | Lists categories. |
| POST | `/api/v1/categories` | Authenticated | Creates a category. |

## Tickets and reviews

| Method | Path | Access | Notes |
| ------ | ---- | ------ | ----- |
| GET | `/api/v1/my_tickets` | Authenticated | Alias for the current user's ticket list. |
| GET | `/api/v1/tickets` | Authenticated | Paginated list of the current user's tickets. |
| POST | `/api/v1/tickets` | Authenticated | Creates a ticket for the current user. |
| GET | `/api/v1/tickets/:id` | Authenticated | Shows one owned ticket. |
| PATCH/PUT | `/api/v1/tickets/:id` | Authenticated | Updates ticket attributes such as `is_active`. |
| POST | `/api/v1/tickets/:id/review` | Authenticated | Creates or updates the feedback attached to the ticket. |

### Ticket request body

Canonical create payload:

```json
{
  "ticket": {
    "event_id": 10
  }
}
```

### Review request body

```json
{
  "ticket": {
    "rating": 5,
    "comment": "Amazing experience!"
  }
}
```

### Ticket filters

`GET /api/v1/tickets` supports:

| Parameter | Purpose |
| --------- | ------- |
| `page` | Page number, minimum `1`. |
| `per_page` | Page size, clamped to `1..100`. |
| `sort` | Sorting field. |
| `order` | `asc` or `desc`. |
| `q` | Search by event title. |
| `is_active` | Exact activity-state filter. |
| `event_id` | Exact event filter. |

Application rules:

- a user can only create one ticket per event
- QR codes are generated automatically on ticket creation
- ticket responses include nested event data and, when present, event feedback

## Response patterns

List endpoints commonly return:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 0
  }
}
```

Error responses are not fully standardized across all controllers yet. Depending on the endpoint, the API may return:

- `{ "error": "..." }`
- `{ "errors": ["..."] }`
- `{ "errors": { "field": ["..."] } }`

## Authorization model

The current implementation effectively uses these roles:

- guest
- authenticated user
- brand member with role `user`
- brand member with role `manager`
- brand member with role `owner`
- superadmin

High-level rules from current policies:

- public access is limited to registration, login, password reset, brand listing/show, and event listing
- most other endpoints require a valid JWT
- brand ownership controls brand mutation
- brand managers can manage some memberships and event category assignments
- only superadmins can approve or reject events and currently create events directly

## Not implemented in the current repository

The following items appeared in earlier planning notes but are not implemented in the code currently checked in:

- email confirmation endpoints
- refresh token or logout endpoints
- event subscriptions
- payment workflows and payment webhooks
- brand request moderation endpoints
- dedicated admin namespaces for event moderation
- separate `/users/me` endpoints

If these features are added later, this document should be updated alongside the routes, controllers, policies, tests, and Swagger output.
