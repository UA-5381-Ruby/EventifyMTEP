# Backend Technical Audit – EventifyMTEP API

> **Initial audit date:** 2026-04-30
> **Updated:** 2026-04-30 (re-audit after `main` merged in: PR #39 / PR #41 — full Tickets API rewrite)
> **Branch audited:** `copilot/eventify-mtep-backend-audit` (includes `origin/main`)
> **Scope:** `/api` (Rails 8 API) + `/docs`

---

## Table of Contents

1. [Summary](#summary)
2. [Changelog from Previous Audit](#changelog-from-previous-audit)
3. [🔴 Critical / High-Priority Findings](#-critical--high-priority-findings)
4. [🟡 Technical Debt Hotspots](#-technical-debt-hotspots)
5. [🟠 Data Integrity Issues](#-data-integrity-issues)
6. [🔵 API Design Issues](#-api-design-issues)
7. [📄 Documentation Gaps](#-documentation-gaps)
8. [Top 10 Recommendations](#top-10-recommendations)
9. [Applied Fixes in This PR](#applied-fixes-in-this-pr)

---

## Summary

The main branch received a substantial Tickets API rewrite (full CRUD, filtering,
pagination, `rack-attack` gem) since the previous audit. Several previously reported
issues were already fixed upstream. A new set of findings has been identified in the
updated code. Overall the codebase is improving; the outstanding issues below are
medium-to-high severity and should be resolved before production.

---

## Changelog from Previous Audit

| Finding | Status |
|---|---|
| `EventsController#create` missing `authorize @event` | ✅ **Fixed in this PR** |
| `rejection_reason` column missing from `events` | ✅ **Fixed in this PR** (migration 20260430000001) |
| `:status` leaked in `EventsController#event_params` | ✅ **Fixed in this PR** |
| CORS wildcard `origins '*'` | ✅ **Fixed in this PR** – reads `ALLOWED_ORIGINS` from ENV |
| `BrandsController` dual-auth dead code | ✅ **Fixed upstream** (PR #41 `rubocop brands controller` commit) |
| `FRONTEND_URL` missing from `.env.example` | ✅ **Fixed in this PR** |
| `resources :tickets` declared `:update` with no action | ✅ **Fixed upstream** – `update` action now fully implemented |
| `(brand_id, role)` index missing on `brand_memberships` | ✅ **Fixed in this PR** (migration 20260430000002) |
| `NOT NULL` missing on `events.location` / `events.start_date` | ✅ **Fixed in this PR** (migration 20260430000003) |

---

## 🔴 Critical / High-Priority Findings

### 1 – `rack-attack` gem installed but not configured

`rack-attack` was added to `Gemfile` (PR #39) but no initializer exists in
`config/initializers/`. The gem is loaded but provides zero protection; auth
endpoints (`/auth/login`, `/auth/register`, `/auth/password/reset`) are still
fully open to brute-force and credential-stuffing attacks.

**File:** `Gemfile` line 16 (gem present), `config/initializers/` (no rack_attack.rb)
**Fix:** Create `config/initializers/rack_attack.rb` with throttles on login,
register, and password-reset endpoints.

---

### 2 – No JWT token revocation

Tokens have a 24-hour lifetime and cannot be invalidated server-side. A
client-side "logout" is meaningless; stolen tokens remain valid until expiry.

**Files:** `app/services/jwt_service.rb`, `app/controllers/api/v1/auth_controller.rb`
**Recommendation:** Implement a token denylist (Redis or DB table) and a dedicated
`DELETE /auth/logout` endpoint. Add a refresh-token flow for sessions longer than
24 hours.

---

### 3 – Tickets can be purchased for non-published events

`TicketsController#create` only validates that the current user can be associated
with any `event_id`; there is no check that the event's status is `:published`.
Users can purchase tickets for `draft`, `rejected`, `cancelled`, or `archived` events.

**File:** `app/controllers/api/v1/tickets_controller.rb` (no event-status guard in `create`)
**Fix:** Add a validation in `Ticket` or a guard in the controller that rejects
ticket creation for events that are not in `:published` state.

---

## 🟡 Technical Debt Hotspots

| # | Issue | Location |
|---|---|---|
| T1 | **`update_password_params` dead code** – method defined in `PasswordsController` but never called; `update` uses `params[:new_password]` directly. | `passwords_controller.rb` last method |
| T2 | **Duplicate pagination logic** – identical offset/limit/meta code in `EventsController`, `TicketsController`, and `BrandMembershipsController`. Should be extracted to a shared concern. | all three controllers |
| T3 | **No serializer layer** – raw `as_json` with inline field lists in 9+ controllers. Inconsistent error-response shapes (some use `{ errors: array }`, others `{ errors: hash }`). | all controllers |
| T4 | **`Devise` gem declared but never used** – adds boot overhead and confusion. Remove it. | `Gemfile` line 11 |
| T5 | **`@current_user` direct ivar vs `current_user` method** – `TicketsController` references `@current_user` (with `@`) directly while all other controllers use the `current_user` reader method. | `tickets_controller.rb` lines 65, 168 |
| T6 | **`my_tickets` route is a duplicate alias** – `GET /api/v1/my_tickets` maps to `tickets#index`, which is identical to `GET /api/v1/tickets`. If the alias exists for backward compatibility it should be documented; otherwise remove it to reduce routing surface. | `config/routes.rb` line 43 |
| T7 | **`EventPolicy` scope commented out** – `Scope#resolve` returns `scope.all` with an `if user.is_superadmin` block commented out. This means all events are visible to all users regardless of publish status. | `app/policies/event_policy.rb` lines 51-55 |

---

## 🟠 Data Integrity Issues

| # | Issue | Location |
|---|---|---|
| D1 | **`event_feedbacks.ticket_id` missing UNIQUE constraint** – there is no DB-level unique index on `ticket_id`; concurrent requests can create duplicate feedback rows. | `db/schema.rb` |
| D2 | **`users.name` nullable at DB level** – validated `presence: true` in model but `t.string "name"` has no `null: false`; raw SQL inserts bypass the rule. | `db/schema.rb` |
| D3 | **`TicketsController#update` permits `is_active`** – any ticket owner can deactivate/reactivate their own ticket via `PATCH /api/v1/tickets/:id`. If deactivated tickets are meant to be admin-only controlled (e.g., when an event is cancelled), this is a business logic leak. | `tickets_controller.rb` `ticket_update_params` |

---

## 🔵 API Design Issues

| # | Issue | Location |
|---|---|---|
| A1 | **`UsersController#index` returns all users** – no pagination and exposes the full user list (including email) to any authenticated user. Superadmin-only access should be enforced. | `users_controller.rb` |
| A2 | **`BrandsController#index` / `CategoriesController#index` have no pagination** – unbounded query, could return thousands of rows. | both controllers |
| A3 | **No `GET /users/me` endpoint** – clients must already know their user ID to fetch their own profile. | missing route |
| A4 | **`EventsController#create` builds event before `authorize`** – `Event.new(event_params.except(:category_ids))` is called before `authorize @event`, so an unauthorized user triggers `event_params` processing (including potential strong-param warnings) before being rejected. Authorizing first (or before building) is cleaner. | `events_controller.rb` line 35-36 |
| A5 | **`Ticket#user_can_have_only_one_ticket_per_event` TOCTOU** – the model validation uses a `WHERE ... NOT IN` read-then-write pattern. A DB unique index already exists, so the application-level check is a nice complement, but the race condition is fully covered by the index. The `RecordNotUnique` rescue in the controller is the correct last line of defense. | `ticket.rb`, `tickets_controller.rb` |

---

## 📄 Documentation Gaps

| # | Issue | File |
|---|---|---|
| Doc1 | `Event_Platform_API_v1.1.md` documents JWT refresh, email confirmation, EventSubscriptions, Payments, BrandRequests, `/users/me`, and event fields `capacity`, `price`, `is_free` – **none are implemented**. | `docs/Event_Platform_API_v1.1.md` |
| Doc2 | `SETUP.md` references MongoDB (irrelevant – project uses PostgreSQL) and pins Ruby 3.3.0 (`.ruby-version` specifies 3.4.8). | `docs/SETUP.md` |
| Doc3 | `spec/swagger_helper.rb` now has rswag path blocks for tickets but not for events, brands, users, or categories. Swagger UI is still mostly empty. | `spec/swagger_helper.rb` |
| Doc4 | `rack-attack` rate-limit configuration (thresholds, window sizes) is not documented anywhere. Operators have no visibility into what limits are in place. | `config/initializers/` (file missing) |

---

## Top 10 Recommendations

| Priority | Recommendation | File(s) |
|---|---|---|
| 1 | **Configure `rack-attack`** – add `config/initializers/rack_attack.rb` with throttles on login, register, and password-reset | new `rack_attack.rb` initializer |
| 2 | **Guard ticket creation** against non-published events | `ticket.rb` or `tickets_controller.rb` |
| 3 | **Implement JWT logout / denylist** + refresh token flow | `jwt_service.rb`, `auth_controller.rb` |
| 4 | **Remove dead `update_password_params`** from `PasswordsController` | `passwords_controller.rb` |
| 5 | **Add UNIQUE index on `event_feedbacks.ticket_id`** | new migration |
| 6 | **Restrict `UsersController#index`** to superadmins; add pagination | `users_controller.rb` |
| 7 | **Extract pagination to shared concern** | `events_controller.rb`, `tickets_controller.rb`, `brand_memberships_controller.rb` |
| 8 | **Remove unused `Devise` gem** | `Gemfile` |
| 9 | **Implement `EventPolicy::Scope`** to filter events by publish status for non-admin users | `event_policy.rb` |
| 10 | **Add DB `NOT NULL` on `users.name`**; add `null: false` on `event_feedbacks.ticket_id` | new migration |

---

## Applied Fixes in This PR

The following findings from both audit rounds are addressed directly in this pull request:

| Finding | Change |
|---|---|
| **#1 (original)** – Missing `authorize @event` in `EventsController#create` | Added `authorize @event` after building the event object |
| **#2 (original)** – `rejection_reason` column missing | Migration `20260430000001_add_rejection_reason_to_events.rb` |
| **A4 (original)** – `:status` leaking in `event_params` | Removed `:status` from `EventsController#event_params` |
| **#3 (original)** – CORS wildcard `origins '*'` | `cors.rb` reads `ALLOWED_ORIGINS` from ENV (default: `http://localhost:3000`) |
| **Doc4 (original)** – `FRONTEND_URL` / `ALLOWED_ORIGINS` missing from `.env.example` | Added both to `.env.example` |
| **T1 (original)** – `BrandsController` dual-auth dead code | Fixed upstream (PR #41); `skip_before_action :authorize_request` now used |
| **D4 (original)** – Missing `(brand_id, role)` index | Migration `20260430000002_add_brand_role_index_to_brand_memberships.rb` |
| **D1 (original)** – Missing `NOT NULL` on `events.location` / `events.start_date` | Migration `20260430000003_add_not_null_to_events_required_fields.rb` |
| **#1 (re-audit)** – `rack-attack` unconfigured | Created `config/initializers/rack_attack.rb` with throttles |
| **T1 (re-audit)** – `update_password_params` dead code | Removed from `PasswordsController` |
| **D1 (re-audit)** – `event_feedbacks.ticket_id` missing UNIQUE index | Migration `20260430000004_add_unique_index_to_event_feedbacks_ticket_id.rb` |
