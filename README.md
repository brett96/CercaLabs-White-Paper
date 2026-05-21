# CercaLabs White Paper Site

Production Next.js 15 site for the AI vs. Automation RCM white paper landing page, privacy policy, do-not-sell form, lead capture, custom analytics, and admin dashboard.

## Routes

| URL | Page |
|-----|------|
| `/ai-vs-automation` | White paper landing + download form |
| `/privacy-policy` | Privacy policy |
| `/do-not-sell` | CCPA privacy requests |
| `/admin` | Analytics & leads (password protected) |
| `/login` | Admin sign-in |

`/` redirects to `/ai-vs-automation`.

## Local development

1. Copy `.env.example` to `.env.local` and fill in values (at minimum `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL=http://localhost:3000`, and `ADMIN_SEED_*`).
2. Apply schema and seed admin:

```bash
npm install
npm run db:push
npm run seed:admin
```

3. Run the dev server:

```bash
npm run dev
```

4. Open http://localhost:3000/ai-vs-automation, http://localhost:3000/admin after signing in at `/login`.

## Deploy on Vercel

1. Push this project to GitHub and import in Vercel.
2. **Settings → Environment Variables** (Production at minimum):
   - **Database**: Vercel Postgres / Neon → `DATABASE_URL` or `POSTGRES_URL`
   - **Auth**: `AUTH_SECRET` (`openssl rand -base64 32`), `AUTH_URL` = `https://cercalabs.com` (or your deployment URL)
   - **Email**: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `LEAD_NOTIFICATION_EMAIL`
   - **Admin seed**: `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`
   - **GA4 (optional)**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
3. Redeploy. `postbuild` runs `drizzle-kit push` and seeds admin when a database URL is set.

### Custom domain paths

Point `cercalabs.com` (or a subdomain) to this Vercel project so these paths resolve:

- `cercalabs.com/ai-vs-automation`
- `cercalabs.com/privacy-policy`
- `cercalabs.com/do-not-sell`

## Analytics

Three layers (use what you need):

1. **Custom events** (`/api/track`) — pageviews, scroll depth, `form_start`, `form_submit`; stored in Postgres; visible in `/admin`.
2. **Vercel Analytics** — enabled via `@vercel/analytics` on all pages.
3. **Google Analytics 4** — set `NEXT_PUBLIC_GA_MEASUREMENT_ID`; loads on all pages. Track form conversions in GA4 using the `form_submit` event or a GA4 conversion on thank-you / success.

Vercel Analytics does not replace GA4 for UTM/referrer campaign reporting at the same granularity; custom DB analytics + GA4 together cover form submissions and traffic sources well.

## White paper form

Captures: first name, last name, work email, organization, role, email opt-in, do-not-sell checkbox. Stored in `whitepaper_leads`; team notification via Gmail when configured. PDF delivery and nurture sequences are out of scope for this repo.

## Stack

Next.js 15, React 19, Drizzle + Neon serverless, Auth.js v5, Nodemailer (Gmail), custom `events` table, Tailwind (admin UI only). Marketing pages use extracted mockup HTML/CSS.
