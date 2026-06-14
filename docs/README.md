# Documentation Index

This directory contains project-level documentation for `EventifyMTEP`.

## Files in this directory

- [`README.md`](README.md) — documentation index for the `docs/` directory.
- [`SETUP.md`](SETUP.md) — local development setup instructions for the Rails API, React web app, and Docker Compose.
- [`ENV_USAGE.md`](ENV_USAGE.md) — environment variable reference for local development and Docker Compose.
- [`DB.md`](DB.md) — database overview and DBML-style schema reference.
- [`Event_Platform_API_v1.1.md`](Event_Platform_API_v1.1.md) — repository-aligned API summary based on the current implementation.
- [`design-system.md`](design-system.md) — frontend design tokens and reusable UI component conventions.
- [`../web/README.md`](../web/README.md) — web frontend development setup, tech stack, and scripts.
- [`user_story.txt`](user_story.txt) — role-based user stories for the currently implemented API scope.
- [`images/db-schema.png`](images/db-schema.png) — schema image referenced by the database documentation.

## How to use these docs

- Start with [`SETUP.md`](SETUP.md) if you are preparing a local environment — it covers both direct local setup and Docker Compose.
- Read [`ENV_USAGE.md`](ENV_USAGE.md) when creating `api/.env`, `web/.env`, and the root `.env` for Docker Compose.
- Use [`DB.md`](DB.md) and [`Event_Platform_API_v1.1.md`](Event_Platform_API_v1.1.md) as quick references while developing.
- Open [`../api/README.md`](../api/README.md) for API-specific commands and the current route summary.
- Open [`../web/README.md`](../web/README.md) for frontend setup, scripts, and routing architecture.

## Maintenance guidelines

Keep this directory aligned with the codebase:

- treat `api/config/routes.rb`, `api/app/`, and `api/db/schema.rb` as the primary source of truth
- regenerate Swagger when request specs change
- update this index whenever a documentation file is added, removed, or repurposed
