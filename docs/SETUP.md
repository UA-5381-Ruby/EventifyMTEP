# Development Setup Guide

This guide focuses on the environment required by the current repository state. The active application is the Rails API in `api/`.

## What you need

According to `.tool-versions`, `api/Gemfile`, and the current Rails configuration, the project expects:

- Ruby `3.4.8`
- Bundler
- PostgreSQL
- Git
- build tools required for native gems such as `pg`

Optional but useful:

- Docker, if you want to experiment with the production-oriented `api/Dockerfile`
- an editor with Ruby support such as JetBrains RubyMine or VS Code

## Quick start

From a terminal:

```bash
git clone https://github.com/UA-5381-Ruby/EventifyMTEP.git
cd EventifyMTEP/api
bundle install
cp .env.example .env
bin/rails secret
bin/rails db:prepare
bin/rails server -p 3000
```

After running `bin/rails secret`, copy the generated value into `JWT_SECRET_KEY` inside `api/.env`.

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

See [`ENV_USAGE.md`](ENV_USAGE.md) for details.

## Database commands

Use these commands from `api/`:

```bash
bin/rails db:prepare
bin/rails db:seed
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

## Optional Docker usage

The repository includes `api/Dockerfile`, but it is explicitly designed for production-style builds rather than day-to-day local development.

If you want to build it manually from `api/`:

```bash
docker build -t eventify-api .
```

The image expects production configuration, including a Rails master key, so local Rails commands remain the recommended development workflow.

## Editor support

Any Ruby-aware editor should work. Helpful features include:

- Ruby LSP support
- RuboCop integration
- YAML and Markdown support

If you add editor-specific setup notes later, keep them aligned with the actual toolchain in this repository.
