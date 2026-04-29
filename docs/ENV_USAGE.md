# 🔐 Environment Variables & Local Setup

We use the `dotenv-rails` gem to manage environment variables for local development. This ensures our secrets (like JWT keys) remain secure and out of version control, while allowing every developer to configure their own local database credentials.

## Getting Started

**1. Create your local `.env` file**

  Create the `.env` file inside `api/` (this is `Rails.root`), not in the repository root. From the project root, run:
  
  ```bash
  cd api && cp .env.example .env
  ```

**2. Generate a local JWT Secret**

  You need a unique, cryptographically secure string to sign your local JSON Web Tokens. Run this command in your terminal to generate one:

  ```bash
  cd api && bin/rails secret
  ```
  
  *Copy the long string it outputs.*

**3. Populate your `.env` file**
  
  Open your newly created `.env` file and fill in your specific values:
  * `DB_USERNAME`: Your local Postgres username (often `postgres`).
  * `DB_PASSWORD`: Your local Postgres password (leave blank if you don't use one).
  * `JWT_SECRET_KEY`: Paste the secret string generated in Step 2.
  * `SWAGGER_SERVER_URL`: Set this explicitly to the local URL of our Swagger UI application (for local development, this is usually `http://localhost:3000`)

---

## ⚠️ CRITICAL RULES FOR THE TEAM

* **NEVER commit your real `api/.env` file**.
* **Always update `api/.env.example`** when adding new required variables.
