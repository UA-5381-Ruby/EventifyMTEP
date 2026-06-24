# Development Setup Guide

This guide covers local setup for the current repository state: the Rails API in `api/` and the React frontend in `web/`.

## What you need

According to `.tool-versions`, `api/Gemfile`, and the current Rails configuration, the project expects:

- Ruby `3.4.8`
- Bundler
- PostgreSQL
- Node.js `24.15.0` (from `web/package.json`)
- npm
- Git
- build tools required for native gems such as `pg`

Optional but useful:

- Docker and Docker Compose, for running the full stack in containers (see [Docker Compose setup](#docker-compose-setup) below)
- an editor with Ruby support such as JetBrains RubyMine or VS Code

## Quick start

From a terminal:

```bash
git clone https://github.com/UA-5381-Ruby/EventifyMTEP.git
cd EventifyMTEP

cd api
bundle install
cp .env.example .env
bin/rails secret
bin/rails db:prepare

cd ../web
npm install
cp .env.example .env
```

After running `bin/rails secret`, copy the generated value into `JWT_SECRET_KEY` inside `api/.env`.

Run API and web in separate terminals:

```bash
cd api
bin/rails server -p 3000
```

```bash
cd web
npm run dev
```

## Linux or WSL setup

If you are using Ubuntu or WSL, install the common dependencies first:

```bash
sudo apt update
sudo apt install -y build-essential git curl libpq-dev pkg-config postgresql-client
```

### Install Ruby 3.4.8

Use your preferred version manager. Examples include `asdf` or `rbenv`.

If you use `rbenv`, make sure your shell initializes it correctly, then install the required Ruby version:

```bash
rbenv install 3.4.8
rbenv global 3.4.8
gem install bundler
```

If you use `asdf`, install the version from `.tool-versions` and then install Bundler.

### PostgreSQL

Make sure you have a running PostgreSQL instance and credentials that match your local `api/.env` and `api/config/database.yml` setup.

Minimal verification commands:

```bash
psql --version
cd api
bin/rails db:version
```

## Windows notes

The repository can be worked on from Windows, but WSL2 is usually the simplest path for a Rails/PostgreSQL stack.

### Recommended approach: WSL2

1. Install WSL2 and an Ubuntu distribution.
2. Clone the repository inside the Linux filesystem.
3. Follow the Linux/WSL setup steps above.

### Native Windows option

If you prefer a native Windows setup, you will generally need:

- Ruby `3.4.8` via RubyInstaller
- MSYS2 / DevKit support for native gem compilation
- PostgreSQL installed locally
- Bundler

Command-line details vary by installation method, so treat the Linux/WSL instructions as the canonical workflow for this repository.

## Environment variables

Create `api/.env` from the example file:

```bash
cd api
cp .env.example .env
```

The currently documented variables are:

- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `JWT_SECRET_KEY`
- `SWAGGER_SERVER_URL`
- `MONOBANK_API_TOKEN`
- `MONOBANK_BASE_URL`
- `FRONTEND_BASE_URL`
- `BACKEND_BASE_URL`

The web app environment example currently includes:

- `VITE_API_BASE_URL`
- `VITE_MAP_API_BASE_URL`

See [`ENV_USAGE.md`](ENV_USAGE.md) for details.

## Database commands

Use these commands from `api/`:

```bash
bin/rails db:prepare
bin/rails db:seed
bin/rails db:seed:replant
bin/rails db:test:prepare
bin/rails db:reset
```

## Testing and developer commands

```bash
cd api
bundle exec rake test
bundle exec rspec
bundle exec rake test:all
bin/rubocop
RAILS_ENV=test bundle exec rake rswag:specs:swaggerize
```

What these commands do:

- `bundle exec rake test` runs the Minitest suite.
- `bundle exec rspec` runs the RSpec suite.
- `bundle exec rake test:all` runs Minitest, regenerates Swagger, then runs RSpec.
- `bin/rubocop` runs the linter configured in the bundle.
- `RAILS_ENV=test bundle exec rake rswag:specs:swaggerize` refreshes the generated OpenAPI file.

For frontend checks, from `web/`:

```bash
npm run test
npm run lint
npm run lint:css
npm run build
```

## Swagger and local verification

Start the API locally:

```bash
cd api
bin/rails server -p 3000
```

Then open:

```text
http://localhost:3000/api-docs
```

Swagger UI is mounted only in development and test environments.

## Docker Compose setup

Docker Compose is the recommended way to run the full stack locally without installing Ruby, Node.js, or PostgreSQL on your machine. It orchestrates three containers: `db` (PostgreSQL), `api` (Rails), and `web` (Vite + React).

### Prerequisites

- Docker Desktop (macOS or Windows) or Docker Engine with the Compose plugin (Linux)

### First-time setup

**1. Create the root environment file**

```bash
cp .env.example .env
```

Open `.env` and fill in your local PostgreSQL credentials:

```env
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=api_development
```

**2. Create the API environment file**

```bash
cp api/.env.example api/.env
```

Edit `api/.env`. At minimum set `DB_USERNAME` and `DB_PASSWORD` to the same values as in the root `.env`, and generate a JWT secret:

```bash
# If Ruby is available locally:
cd api && bin/rails secret

# Otherwise use OpenSSL:
openssl rand -hex 64
```

Copy the output into `JWT_SECRET_KEY` inside `api/.env`.

**3. Create the web environment file**

```bash
cp web/.env.example web/.env
```

For local Docker usage, `web/.env` should contain:

```env
VITE_API_BASE_URL=http://localhost:3000
```

**4. Build and start all containers**

```bash
docker compose up --build
```

On the first run Docker will pull images, install gems and npm packages, create the database, and run migrations automatically before starting the Rails server.

### Accessing the services

| Service | URL |
| ------- | --- |
| Rails API | <http://localhost:3000> |
| Swagger UI | <http://localhost:3000/api-docs> |
| Vite dev server | <http://localhost:5173> |

### Daily workflow

```bash
# Start all containers in the background
docker compose up -d

# Follow logs for all services
docker compose logs -f

# Follow logs for a single service
docker compose logs -f api

# Stop all containers (data is preserved)
docker compose down

# Stop and delete all data (full reset)
docker compose down -v
```

### Running commands inside containers

```bash
# Rails console
docker compose exec api bundle exec rails console

# Run migrations
docker compose exec api bundle exec rails db:migrate

# Run the API test suite
docker compose exec api bundle exec rspec

# Run frontend linting
docker compose exec web npm run lint
```

### Docker file overview

| File | Purpose |
| ---- | ------- |
| `docker-compose.yml` | Orchestrates `db`, `api`, and `web` services |
| `api/Dockerfile.dev` | Development image for the Rails API (used by Compose) |
| `api/Dockerfile` | Production image for the Rails API (used by Kamal) |
| `web/Dockerfile` | Multi-stage image for the Vite frontend |

## Editor support

Any Ruby-aware editor should work. Helpful features include:

- Ruby LSP support
- RuboCop integration
- YAML and Markdown support

If you add editor-specific setup notes later, keep them aligned with the actual toolchain in this repository.
