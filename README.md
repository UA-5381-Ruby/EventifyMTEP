# EventifyMTEP

Eventify — Multi-Tenant Event Platform

`EventifyMTEP` is a repository for a multi-tenant event platform. The active application in this repository is a Rails API that handles authentication, brands, events, categories, tickets, and event reviews.

## Repository structure

The repository is organized into three top-level areas:

- [`api/`](api/README.md) — the Rails API application, including models, controllers, policies, tests, and generated Swagger documentation.
- [`docs/`](docs/README.md) — project documentation such as setup instructions, environment variable guidance, database notes, API summaries, and user stories.
- [`web/`](web/README.md) — a placeholder for the future frontend application. At the moment this directory contains documentation only.

## Current status

- The backend API is the main implemented component in this repository.
- OpenAPI/Swagger output is generated from request specs and stored in `api/swagger/v1/swagger.yaml`.
- The frontend application has not been added yet.

## Documentation map

Start with these files:

- [`docs/SETUP.md`](docs/SETUP.md) — local development setup.
- [`docs/ENV_USAGE.md`](docs/ENV_USAGE.md) — required environment variables.
- [`docs/DB.md`](docs/DB.md) — database structure reference.
- [`docs/Event_Platform_API_v1.1.md`](docs/Event_Platform_API_v1.1.md) — repository-aligned API overview.
- [`api/README.md`](api/README.md) — API-specific commands and endpoint summary.
