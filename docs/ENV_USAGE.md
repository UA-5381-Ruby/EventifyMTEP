# Environment Variables and Local Setup

The API uses `dotenv-rails` in development and test environments. Local secrets belong in `api/.env`, which should never be committed.
The web app uses Vite environment files (for example `web/.env`) for `VITE_*` variables.

## Create your local environment file

From the repository root, run:

```bash
cd api
cp .env.example .env
```

## Generate a JWT secret

Generate a secure random value for local JWT signing:

```bash
cd api
bin/rails secret
```

Copy the generated value into `JWT_SECRET_KEY` inside `api/.env`.

## Variables used by the current application

The current `api/.env.example` defines these variables:

| Variable | Purpose |
| -------- | ------- |
| `DB_USERNAME` | PostgreSQL username used by Rails. |
| `DB_PASSWORD` | PostgreSQL password used by Rails. |
| `DB_HOST` | PostgreSQL host, if it is not the local default. |
| `DB_PORT` | PostgreSQL port, if it is not the local default. |
| `JWT_SECRET_KEY` | Secret used to sign and verify JWT tokens. |
| `SWAGGER_SERVER_URL` | Base URL injected into generated Swagger/OpenAPI output. |
| `MONOBANK_API_TOKEN` | API token used for Monobank invoice creation and webhook verification. |
| `MONOBANK_BASE_URL` | Monobank API base URL. |
| `FRONTEND_BASE_URL` | Frontend base URL used in payment redirect links. |
| `BACKEND_BASE_URL` | Backend base URL used to build payment webhook URLs. |

The current `web/.env.example` defines these variables:

| Variable | Purpose |
| -------- | ------- |
| `VITE_API_BASE_URL` | Base URL for frontend API requests. |
| `VITE_MAP_API_BASE_URL` | Base URL for map/geocoding requests, when enabled. |

## Recommended local values

- Set `DB_USERNAME` and `DB_PASSWORD` to your local PostgreSQL credentials.
- Leave `DB_HOST` and `DB_PORT` blank if your local setup uses the defaults from `config/database.yml`.
- Set `SWAGGER_SERVER_URL` to your local API base URL, usually `http://localhost:3000`.
- Set `FRONTEND_BASE_URL` to your web app URL (locally usually `http://localhost:5173`).
- Set `BACKEND_BASE_URL` to your API URL (locally usually `http://localhost:3000`).
- Set `MONOBANK_API_TOKEN` and `MONOBANK_BASE_URL` when testing payment flows.
- In `web/.env`, keep `VITE_API_BASE_URL` aligned with your backend URL.

## Team rules

- Never commit your real `api/.env` file.
- Never commit your real `web/.env` file.
- Update `api/.env.example` whenever a new required variable is introduced.
- Update `web/.env.example` whenever a new required frontend variable is introduced.
- Keep documentation and setup instructions in sync with the example file.

