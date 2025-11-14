# animations

## Connecting the contact form to Neon

1. **Create a Neon project** – Log into [console.neon.tech](https://console.neon.tech), create a project, and note the auto-generated branch, database, and password.
2. **Copy the connection string** – From the "Connection Details" panel, copy the `psql` connection string (it already includes `sslmode=require`). Paste it into `.env.local` or your dashboard secrets as `DATABASE_URL`.
3. **Provision the table** – Run the SQL in `sql/contact_submissions.sql` from the Neon SQL editor or the CLI. You can also let the helper script handle this automatically (next step) if you prefer.

	```sql
	CREATE TABLE IF NOT EXISTS contact_submissions (
		 id SERIAL PRIMARY KEY,
		 name VARCHAR(255) NOT NULL,
		 email VARCHAR(255) NOT NULL,
		 company VARCHAR(255) NOT NULL,
		 phone VARCHAR(50) NOT NULL,
		 service VARCHAR(255) NOT NULL,
		 timeline VARCHAR(100) NOT NULL,
		 message TEXT NOT NULL,
		 submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);
	```

4. **Configure environment variables** – Copy `.env.example` to `.env.local` (for local dev) or set the same values inside Vercel/Netlify:

	```bash
	cp .env.example .env.local
	```

	Fill in:

	- `DATABASE_URL` – Neon connection string
	- `RESEND_API_KEY` – Resend API key (or any SMTP provider you wire in)
	- `RESEND_FROM_EMAIL` – Verified sender (Resend provides `onboarding@resend.dev` for testing)
	- `RESEND_TO_EMAIL` – Inbox that should receive notifications

5. **Verify the Neon connection** – After filling in `DATABASE_URL`, run the helper:

	```bash
	npm install
	npm run verify:neon
	```

	Pass `-- --skip-insert` if you only want to ensure the table exists without performing a test insert/delete cycle.

6. **Run locally** – Start the dev server. The API route will write to Neon automatically when `DATABASE_URL` is present.

	```bash
	npm run dev
	```

7. **Deploy** – Ensure the same environment variables exist in your hosting provider before deploying (`npm run deploy`).

The serverless function in `api/submit-contact.js` will log a warning if `DATABASE_URL` is missing so you can verify that Neon is wired up correctly.