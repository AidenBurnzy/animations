# Auctus Ventures - Contact Form Setup

## Database Setup

### 1. Create Neon Database Table

Run this SQL in your Neon database console:

```sql
CREATE TABLE contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    service VARCHAR(255) NOT NULL,
    timeline VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Create index for faster queries
CREATE INDEX idx_submitted_at ON contact_submissions(submitted_at DESC);
CREATE INDEX idx_email ON contact_submissions(email);
```

## Email Service Setup

### Option 1: Resend (Recommended)

1. Sign up at https://resend.com
2. Verify your domain (auctusventures.com)
3. Get API key from https://resend.com/api-keys
4. Add to environment variables

### Option 2: SendGrid

If you prefer SendGrid:
- Install: `npm install @sendgrid/mail`
- Get API key from SendGrid
- Update `api/submit-contact.js` to use SendGrid instead of Resend

## Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
RESEND_API_KEY=re_your_api_key_here
NODE_ENV=production
```

## Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Install dependencies:
```bash
npm install
```

3. Login to Vercel:
```bash
vercel login
```

4. Deploy:
```bash
vercel --prod
```

5. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Add `DATABASE_URL` and `RESEND_API_KEY`

### Deploy to Netlify

1. Create `netlify.toml`:
```toml
[build]
  functions = "api"

[functions]
  node_bundler = "esbuild"
```

2. Deploy via Netlify CLI or connect GitHub repo

## Testing Locally

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your credentials

3. Run development server:
```bash
vercel dev
```

4. Test form at http://localhost:3000/contact.html

## Features

✅ Saves all form submissions to Neon database
✅ Sends email notification to founder.auctusventures@gmail.com
✅ Shows loading state during submission
✅ Error handling with user feedback
✅ Secure serverless API endpoint
✅ CORS enabled for frontend requests

## Troubleshooting

- **Email not sending**: Verify domain in Resend and check API key
- **Database error**: Check DATABASE_URL format and table exists
- **API not found**: Ensure vercel.json is configured correctly
- **CORS error**: Check API CORS headers are set properly
