# Backend Technical Audit – EventifyMTEP API

> **Audit date:** 2026-04-30
> **Branch audited:** `copilot/eventify-mtep-backend-audit`
> **Scope:** `/api` (Rails 8 API) + `/docs`

---

## Table of Contents

1. [Summary](#summary)
2. [🔴 Critical / High-Priority Findings](#-critical--high-priority-findings)
3. [🟡 Technical Debt Hotspots](#-technical-debt-hotspots)
4. [🟠 Data Integrity Issues](#-data-integrity-issues)
5. [🔵 API Design Issues](#-api-design-issues)
6. [📄 Documentation Gaps](#-documentation-gaps)
7. [Top 10 Recommendations](#top-10-recommendations)
8. [Applied Fixes in This PR](#applied-fixes-in-this-pr)

---

## Summary

The codebase is well-structured and has a reasonable Pundit policy setup, AASM state machine, and solid model validations. However, several high-severity issues undermine security and data integrity and must be addressed before a production launch.

---

## 🔴 Critical / High-Priority Findings

### 1 – `EventsController#create` missing authorization

`EventPolicy#create?` correctly restricts event creation to superadmins, but
`EventsController#create` never calls `authorize @event`. Any authenticated
user can create events by bypassing the policy entirely.

**File:** `app/controllers/api/v1/events_controller.rb` line 34
**Fix:** Call `authorize @event` after building the object.

---

### 2 – `rejection_reason` silently discarded on every `reject` call

`Event#reject` AASM transition runs a `before` block that calls
`self.rejection_reason = reason`, but the `rejection_reason` column does not
exist in `db/schema.rb`. The `respond_to?(:rejection_reason=)` guard prevents
a crash, but rejection reasons are always lost.

**File:** `app/models/event.rb` lines 44-46, `db/schema.rb`
**Fix:** Add `rejection_reason` column via a new migration.

---

### 3 – CORS wildcard `origins '*'`

`config/initializers/cors.rb` allows requests from any origin. This must be
restricted to the actual frontend domain(s) before production.

**File:** `config/initializers/cors.rb`
**Fix:** Read allowed origins from `ENV['ALLOWED_ORIGINS']`.

---

### 4 – No JWT token revocation or refresh

Tokens have a 24-hour lifetime and cannot be invalidated server-side. A
client-side "logout" is meaningless; stolen tokens remain valid until expiry.

**Files:** `app/services/jwt_service.rb`, `app/controllers/api/v1/auth_controller.rb`
**Recommendation:** Implement a token denylist (Redis or DB table) and a
dedicated `DELETE /auth/logout` endpoint. Add a refresh-token flow if sessions
longer than 24 hours are required.

---

### 5 – No rate limiting on login / password-reset endpoints

Login (`POST /auth/login`) and password reset (`POST /auth/password/reset`)
are unprotected against brute-force and credential-stuffing attacks.

**Recommendation:** Add `Rack::Attack` with a limit of ~5 requests / minute
per IP on these endpoints.

---

## 🟡 Technical Debt Hotspots

| # | Issue | Location |
|---|---|---|
| T1 | **`BrandsController` dual authentication** – local `current_user` override references `AuthHelper.decode` (a test-only helper). Works only because `ApplicationController#authorize_request` always runs first and populates `@current_user`. If call order changes, requests crash with `NoMethodError`. | `brands_controller.rb` lines 61-80 |
| T2 | **Duplicate pagination logic** – identical offset/limit/meta code lives in both `EventsController` and `BrandMembershipsController`. | both controllers |
| T3 | **No serializer layer** – raw `as_json` with inline field lists in 9+ controllers; 4+ different error-response shapes across the app. | all controllers |
| T4 | **`Devise` gem declared but never used** – adds boot overhead and confusion. Remove it. | `Gemfile` line 11 |
| T5 | **Last-owner protection in three places** – model callbacks (`BrandMembership`), controller guard methods (`BrandMembershipsController`), and controller checks all duplicate the same rule. | `brand_membership.rb`, `brand_memberships_controller.rb` |
| T6 | **`brands_spec.txt`** – test file with a `.txt` extension; RSpec never loads it. | `spec/requests/api/v1/brands_spec.txt` |
| T7 | **`EventPolicy#create?` and `EventsController` mismatch** – policy restricts creation to superadmins but owners/managers can submit events. Clarify the intended permission model. | `event_policy.rb`, `events_controller.rb` |

---

## 🟠 Data Integrity Issues

| # | Issue | Location |
|---|---|---|
| D1 | `events.location` and `events.start_date` are validated at the model level but have **no `NOT NULL` constraint** in the DB schema; raw SQL inserts bypass these rules. | `db/schema.rb` |
| D2 | `event_feedbacks` has no `UNIQUE` constraint on `ticket_id`; a race condition could produce duplicate feedback rows at the DB level. | `db/schema.rb` |
| D3 | `users.name` is validated `presence: true` in the model but is nullable in the DB (`t.string "name"` without `null: false`). | `db/schema.rb` |
| D4 | `(brand_id, role)` composite index missing on `brand_memberships` – `owners_count` queries run a full table scan per request. | `db/schema.rb`, `brand_memberships_controller.rb` |

---

## 🔵 API Design Issues

| # | Issue | Location |
|---|---|---|
| A1 | `resources :tickets, only: [:create, :update]` – `:update` route is declared but no `update` action exists in `TicketsController`; any `PATCH /api/v1/tickets/:id` raises an `AbstractController::ActionNotFound` routing error. | `config/routes.rb` |
| A2 | `GET /api/v1/my_tickets` – non-RESTful top-level route; should be nested under `/users/:id/tickets` or exposed as `/users/me/tickets`. | `config/routes.rb` |
| A3 | `UsersController`, `CategoriesController`, `BrandsController` index endpoints have **no pagination**; they return unbounded query results. | all three controllers |
| A4 | `EventsController#create` accepts `:status` in strong params but immediately overwrites it with `'draft'`; the param is ignored and leaks the internal enum vocabulary to callers. | `events_controller.rb` lines 38, 56-59 |
| A5 | No `GET /users/me` endpoint; clients must know their user ID to fetch their own profile. | missing route |

---

## 📄 Documentation Gaps

| # | Issue | File |
|---|---|---|
| Doc1 | `Event_Platform_API_v1.1.md` documents JWT refresh tokens, email confirmation, EventSubscriptions, Payments, BrandRequests, `/users/me`, and event fields `capacity`, `price`, `is_free` – **none are implemented**. | `docs/Event_Platform_API_v1.1.md` |
| Doc2 | `SETUP.md` references MongoDB (irrelevant – the project uses PostgreSQL) and pins Ruby 3.3.0 (the `.ruby-version` file specifies 3.4.8). | `docs/SETUP.md` |
| Doc3 | `spec/swagger_helper.rb` has `paths: {}` – no rswag path DSL blocks exist (except `passwords_spec.rb`). No `swagger.yaml` is generated; the Swagger UI is empty. | `spec/swagger_helper.rb` |
| Doc4 | `FRONTEND_URL` is used in `UserMailer` but is missing from `.env.example`; developers get a `KeyError` on first run if the variable is unset. | `.env.example`, `app/mailers/user_mailer.rb` |

---

## Top 10 Recommendations

| Priority | Recommendation | File(s) |
|---|---|---|
| 1 | **Add `authorize @event`** in `EventsController#create` | `events_controller.rb` |
| 2 | **Add `rejection_reason` migration**; remove `:status` from `event_params` | `db/migrate/`, `events_controller.rb` |
| 3 | **Restrict CORS** to ENV-configured origins | `cors.rb`, `.env.example` |
| 4 | **Implement JWT logout / denylist** + refresh token flow | `jwt_service.rb`, `auth_controller.rb` |
| 5 | **Add `Rack::Attack`** rate limiting on auth endpoints | new `rack_attack.rb` initializer |
| 6 | **Fix `BrandsController`** – remove local `authenticate_user!` / `current_user` override; use `skip_before_action :authorize_request` | `brands_controller.rb` |
| 7 | **Remove `:update` route from `resources :tickets`**; implement or drop the action | `routes.rb` |
| 8 | **Extract pagination to a shared concern**; add pagination to all unbounded index endpoints | `users_controller.rb`, `brands_controller.rb`, `categories_controller.rb` |
| 9 | **Remove unused `Devise` gem** | `Gemfile` |
| 10 | **Add DB `NOT NULL` constraints**; add `(brand_id, role)` index on `brand_memberships`; add `UNIQUE` on `event_feedbacks.ticket_id` | new migrations |

---

## Applied Fixes in This PR

The following findings from this audit were fixed directly in this pull request:

| Finding | Change |
|---|---|
| **#1** – Missing `authorize @event` in `EventsController#create` | Added `authorize @event` after building the event object |
| **#2** – `rejection_reason` column missing | Added `20260430000001_add_rejection_reason_to_events.rb` migration |
| **A4** – `:status` leaking in `event_params` | Removed `:status` from `EventsController#event_params` |
| **#3** – CORS wildcard | `cors.rb` now reads `ALLOWED_ORIGINS` from the environment |
| **Doc4** – `FRONTEND_URL` missing from `.env.example` | Added `FRONTEND_URL` and `ALLOWED_ORIGINS` to `.env.example` |
| **T1** – `BrandsController` dual-auth / `AuthHelper.decode` dead-code | Removed local `authenticate_user!` and `current_user`; added `skip_before_action :authorize_request, only: %i[index show]` |
| **A1** – `:update` route declared without action | Removed `:update` from `resources :tickets` |
| **D4** – Missing `(brand_id, role)` index | Added `20260430000002_add_brand_role_index_to_brand_memberships.rb` migration |
| **D1** – Missing `NOT NULL` on `events.location` / `events.start_date` | Added `20260430000003_add_not_null_to_events_required_fields.rb` migration |
