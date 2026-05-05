# MTU Voting App Runbook

This guide explains how to run, configure, customize, scale, and operate the MTU Voting app securely.

## 1) Current Review Findings (Prioritized)

### High

1. No explicit max-attempt lockout during OTP verification.
   - File: `src/app/api/auth/verify-otp/route.ts`
   - Impact: brute force window exists while OTP remains valid.
   - Action: block OTP after N failed attempts (e.g. 5), force re-request.

2. Health checks can expose internal service details publicly.
   - File: `src/app/api/health/route.ts`
   - Impact: attackers can infer infrastructure state.
   - Action: restrict access (admin secret, IP allowlist, or internal network only) in production.

3. Seed script is now non-destructive, but still updates contestant images/names by key.
   - File: `prisma/seed.ts`
   - Impact: content updates can still affect presentation during active elections.
   - Action: use change control before reseeding in production windows.

### Medium

4. CSRF bootstrapping depends on frontend calling `/api/auth/csrf`.
   - Files: `src/app/login/page.tsx`, `src/lib/security/csrf.ts`
   - Impact: if user blocks JS or request fails, login OTP request fails.
   - Action: keep current flow, but add fallback retry UX if csrf token missing.

5. Admin updates poll every 3 seconds (not true push realtime).
   - File: `src/app/admin/dashboard/page.tsx`
   - Action: move to SSE/WebSockets for lower latency and cleaner scaling.

## 2) Local Setup and Run

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm

## Install and Configure

1. Install dependencies:
   - `npm install`
2. Copy env:
   - Windows PowerShell: `Copy-Item .env.example .env`
3. Edit `.env` values:
   - `DATABASE_URL`
   - `JWT_SECRET` (long random secret)
   - `APP_ORIGIN` (e.g. `http://localhost:3000`)
   - SMTP vars (see SMTP section below)
   - Upstash vars for rate-limiting

## Database Commands

1. Generate Prisma client:
   - `npm run prisma:generate`
2. Run migrations:
   - `npm run prisma:migrate`
3. Seed categories/contestants:
   - `npm run prisma:seed`

## Run App

- Development: `npm run dev`
- Build: `npm run build`
- Start production build: `npm run start`

## 3) Environment Variables (Required)

Add these to `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mtu_voting?schema=public"
JWT_SECRET="replace-with-long-random-secret-at-least-32-bytes"
APP_ORIGIN="http://localhost:3000"

# Rate limiting (Upstash)
UPSTASH_REDIS_REST_URL="https://example.upstash.io"
UPSTASH_REDIS_REST_TOKEN="replace-with-upstash-token"

# SMTP
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="postmaster@mg.yourdomain.com"
SMTP_PASS="replace-with-smtp-password"
SMTP_FROM="MTU Voting <noreply@mtu.edu.ng>"
```

## 4) SMTP and Env Validation Status

- SMTP is already implemented in `src/lib/mail/send-otp.ts` using `nodemailer`.
- Startup env validation is implemented in `src/lib/env.ts` using `zod`.
- App now fails fast if required secrets/config are missing.

If you rotate SMTP credentials, update `.env` and restart the server.

### SMTP Hardening Checklist

- Use provider API key/password, not personal mailbox password.
- Restrict sender domain with SPF, DKIM, DMARC.
- Do not log OTP value in production.
- Keep OTP short TTL (already 10 min).
- Add max OTP verification attempts per code (e.g. 5).

## 5) Health Endpoint

Endpoint:

- `GET /api/health`

Checks:

- app process
- PostgreSQL (`SELECT 1`)
- Upstash Redis (`PING`)
- SMTP connectivity (`transporter.verify`)

Response shape:

```json
{
  "status": "ok | degraded",
  "timestamp": "ISO_DATE",
  "services": {
    "app": { "status": "ok" },
    "database": { "status": "ok | error", "message": "..." },
    "redis": { "status": "ok | error", "message": "..." },
    "smtp": { "status": "ok | error", "message": "..." }
  }
}
```

Status codes:

- `200` when all checks pass.
- `503` when any dependency fails.

Production guidance:

- Protect this endpoint from public access.
- Hook it into uptime monitors for alerting.

## 6) How to Change Categories, Contestants, and Images

### Update seed data

- Edit `prisma/seed.ts` category list.
- Re-run `npm run prisma:seed` (safe non-destructive upsert mode).

### Live updates without reseeding

- Recommended: create an admin CRUD for `Category` and `Contestant` tables.
- Do not run destructive seed in production after votes exist.

## 7) Security Operations Checklist

- Set strong `JWT_SECRET`.
- Require HTTPS in production.
- Configure exact `APP_ORIGIN` to production domain.
- Configure Upstash env vars; verify OTP route returns 429 on abuse.
- Keep cookies `secure` and `sameSite=strict`.
- Monitor OTP request volume and failed verification attempts.
- Add centralized request logging with redaction.
- Restrict `/api/health` to trusted callers.

## 8) Upscaling the App

## App Layer

- Move admin polling to SSE/WebSockets.
- Add caching for categories endpoint (short TTL).
- Use server-side pagination for admin reports.

## Data Layer

- Keep current vote uniqueness constraint: `@@unique([userId, categoryId])`.
- Add read replica for analytics queries at high load.
- Add DB indexes for heavy admin breakdown queries.

## Infrastructure

- Deploy Next.js on Vercel/Node server with horizontal scaling.
- Use managed PostgreSQL (Neon/Supabase/RDS).
- Use managed Redis for rate limits and transient auth controls.

## Reliability

- Add health endpoint and uptime checks.
- Add backups and tested restore process.
- Add alerting for OTP failures and DB connection errors.

## 9) Suggested Next Engineering Tasks

1. Add verification-attempt lockout policy in `verify-otp` route.
2. Add authentication or allowlist protection for `/api/health`.
3. Add tests:
   - OTP domain check
   - OTP expiry and failed attempts
   - vote uniqueness race handling
   - admin route authorization
   - health route behavior under dependency failure
