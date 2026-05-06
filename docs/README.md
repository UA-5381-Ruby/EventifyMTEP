# Documentation Index

This directory contains project-level documentation for `EventifyMTEP`.

## Files in this directory

- [`README.md`](README.md) — documentation index for the `docs/` directory.
- [`SETUP.md`](SETUP.md) — local development setup instructions for the Rails API.
- [`ENV_USAGE.md`](ENV_USAGE.md) — environment variable reference for local development.
- [`DB.md`](DB.md) — database overview and DBML-style schema reference.
- [`Event_Platform_API_v1.1.md`](Event_Platform_API_v1.1.md) — repository-aligned API summary based on the current implementation.
- [`user_story.txt`](user_story.txt) — role-based user stories for the currently implemented API scope.
- [`images/db-schema.png`](images/db-schema.png) — schema image referenced by the database documentation.

## How to use these docs

- Start with [`SETUP.md`](SETUP.md) if you are preparing a local environment.
- Read [`ENV_USAGE.md`](ENV_USAGE.md) when creating `api/.env`.
- Use [`DB.md`](DB.md) and [`Event_Platform_API_v1.1.md`](Event_Platform_API_v1.1.md) as quick references while developing.
- Open [`../api/README.md`](../api/README.md) for API-specific commands and the current route summary.

## Maintenance guidelines

Keep this directory aligned with the codebase:

- treat `api/config/routes.rb`, `api/app/`, and `api/db/schema.rb` as the primary source of truth
- regenerate Swagger when request specs change
- update this index whenever a documentation file is added, removed, or repurposed
