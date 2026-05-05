# EventifyMTEP API

Eventify — Multi-Tenant Event Platform

This directory contains the Rails API application for Eventify. It is responsible for authentication, business rules, authorization, persistence, and generated OpenAPI documentation.

## Stack

- Ruby `3.4.8`
- Rails API
- PostgreSQL
- RSpec, Minitest, SimpleCov, and rswag
- JWT-based authentication
- Pundit authorization policies

## Getting started

Run these commands from the `api/` directory unless noted otherwise.

### 1. Install dependencies

```bash
bundle install
```

### 2. Configure environment variables

```bash
cp .env.example .env
bin/rails secret
```

Copy the generated secret into `JWT_SECRET_KEY` in `api/.env`. See [`../docs/ENV_USAGE.md`](../docs/ENV_USAGE.md) for the full variable list.

### 3. Prepare the database

```bash
bin/rails db:prepare
```

Optional maintenance commands:

```bash
bin/rails db:seed
bin/rails db:reset
bin/rails db:test:prepare
```

### 4. Start the development server

```bash
bin/rails server -p 3000
```

## Testing and quality checks

### Run the full test suite

```bash
bundle exec rake test:all
```

The custom task runs:

1. Minitest
2. Swagger generation via rswag
3. RSpec

You can also run the suites individually:

```bash
bundle exec rake test
bundle exec rspec
bin/rubocop
```

### Coverage report

After the test suite runs, SimpleCov writes a report to:

```text
coverage/index.html
```

Open that file in your browser to inspect line coverage.

## API documentation

Interactive Swagger UI is mounted only in development and test environments.

| Environment | URL                            |
| ----------- | ------------------------------ |
| Local       | http://localhost:3000/api-docs |

The generated OpenAPI file lives at [`swagger/v1/swagger.yaml`](swagger/v1/swagger.yaml).

### Regenerate Swagger after request spec changes

```bash
RAILS_ENV=test bundle exec rake rswag:specs:swaggerize
```

## Implemented endpoint summary

The routes below are derived from `config/routes.rb` and the current controllers.

| Method | Path | Access | Notes |
| ------ | ---- | ------ | ----- |
| POST | `/api/v1/auth/register` | Public | Register a new user and return a JWT. |
| POST | `/api/v1/auth/login` | Public | Authenticate and return a JWT. |
| POST | `/api/v1/auth/password/reset` | Public | Request password reset email, or confirm reset when `token` is provided as a query parameter. |
| GET | `/api/v1/users` | Authenticated | List users. |
| GET | `/api/v1/users/:id` | Authenticated | Show a user profile. |
| PATCH/PUT | `/api/v1/users/:id` | Authenticated | Update a user; restricted by policy. |
| DELETE | `/api/v1/users/:id` | Authenticated | Delete a user; restricted by policy. |
| GET | `/api/v1/events` | Public | Paginated event list with filtering and sorting. |
| GET | `/api/v1/events/:id` | Authenticated | Show a single event with brand and categories. |
| POST | `/api/v1/events` | Authenticated | Create an event; current policy limits this to superadmins. |
| POST | `/api/v1/events/:id/submit` | Authenticated | Submit an event for review. |
| POST | `/api/v1/events/:id/cancel` | Authenticated | Cancel an event and deactivate active tickets. |
| POST | `/api/v1/events/:id/approve` | Authenticated | Approve an event; superadmin only. |
| POST | `/api/v1/events/:id/reject` | Authenticated | Reject an event; superadmin only. |
| GET | `/api/v1/events/:event_id/categories` | Authenticated | List categories attached to an event. |
| POST | `/api/v1/events/:event_id/categories` | Authenticated | Attach a category to an event. |
| DELETE | `/api/v1/events/:event_id/categories/:category_id` | Authenticated | Remove a category from an event. |
| GET | `/api/v1/brands` | Public | List brands. |
| POST | `/api/v1/brands` | Authenticated | Create a brand and assign the creator as owner. |
| GET | `/api/v1/brands/:id` | Public | Show a brand and its events. |
| PATCH/PUT | `/api/v1/brands/:id` | Authenticated | Update a brand; owner or superadmin. |
| DELETE | `/api/v1/brands/:id` | Authenticated | Delete a brand; owner or superadmin. |
| GET | `/api/v1/brands/:brand_id/memberships` | Authenticated | List brand members with pagination. |
| POST | `/api/v1/brands/:brand_id/memberships` | Authenticated | Add a membership to a brand. |
| PATCH/PUT | `/api/v1/brands/:brand_id/memberships/:id` | Authenticated | Change a membership role. |
| DELETE | `/api/v1/brands/:brand_id/memberships/:id` | Authenticated | Remove a membership, while preserving at least one owner. |
| GET | `/api/v1/categories` | Authenticated | List categories. |
| POST | `/api/v1/categories` | Authenticated | Create a category. |
| GET | `/api/v1/my_tickets` | Authenticated | Alias for the current user's ticket list. |
| GET | `/api/v1/tickets` | Authenticated | List the current user's tickets with filters. |
| POST | `/api/v1/tickets` | Authenticated | Create a ticket for the current user. |
| GET | `/api/v1/tickets/:id` | Authenticated | Show one ticket. |
| PATCH/PUT | `/api/v1/tickets/:id` | Authenticated | Update ticket state, such as `is_active`. |
| POST | `/api/v1/tickets/:id/review` | Authenticated | Create or update a ticket review. |

## Related documentation

- [`../docs/SETUP.md`](../docs/SETUP.md)
- [`../docs/ENV_USAGE.md`](../docs/ENV_USAGE.md)
- [`../docs/DB.md`](../docs/DB.md)
- [`../docs/Event_Platform_API_v1.1.md`](../docs/Event_Platform_API_v1.1.md)


