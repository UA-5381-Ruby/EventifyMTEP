Here is a clean, formatted block of markdown that you can copy and paste directly into your project's `README.md`. 

It gives your team exactly what they need to know without being overly wordy, and emphasizes the golden rule of never committing the real file.

***

```markdown
## 🔐 Environment Variables & Local Setup

We use the `dotenv-rails` gem to manage environment variables for local development. This ensures our secrets (like JWT keys) remain secure and out of version control, while allowing every developer to configure their own local database credentials.

### Getting Started

**1. Create your local `.env` file**
Run the following command in the root of the project to copy the safe template:
```bash
cp .env.example .env
```

**2. Generate a local JWT Secret**
You need a unique, cryptographically secure string to sign your local JSON Web Tokens. Run this command in your terminal to generate one:
```bash
bin/rails secret
```
*Copy the long string it outputs.*

**3. Populate your `.env` file**
Open your newly created `.env` file and fill in your specific values:
* `DB_USERNAME`: Your local Postgres username (often `postgres`).
* `DB_PASSWORD`: Your local Postgres password (leave blank if you don't use one).
* `JWT_SECRET_KEY`: Paste the secret string you generated in Step 2.
* `FRONTEND_URL`: The local URL of our frontend application (default: `http://localhost:5173`).

---

### ⚠️ CRITICAL RULES FOR THE TEAM
* **NEVER commit your `.env` file.** It is already listed in our `.gitignore`.
* **Always update `.env.example`.** If you add a new environment variable to the codebase (e.g., an AWS Key or a 3rd-party API token), you **must** add a blank/placeholder version of it to `.env.example` and commit that change. This ensures the rest of the team knows they need to add it to their local setups.
```
