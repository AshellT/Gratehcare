# GRATEHCARE Backend Foundation

NestJS + TypeScript + PostgreSQL + Prisma foundation for the GRATEHCARE platform.

The old Python prototype files are still present (`server.py`, `requirements.txt`) but the production backend scaffold now lives under `src/` with Prisma in `prisma/schema.prisma`.

## Stack

- Node.js
- TypeScript
- NestJS
- PostgreSQL
- Prisma ORM
- Redis-ready service wrapper via `RedisService`

## First Run

```bash
npm install
cp .env.example .env
```

Edit `backend/.env`:

- `DATABASE_URL` — Supabase **transaction pooler** (port 6543, `?pgbouncer=true`) for app runtime
- `DIRECT_URL` — Supabase **session pooler** (port 5432, same host) for `prisma migrate deploy`
- `SUPABASE_URL` — `https://<project-ref>.supabase.co`
- `SUPABASE_ANON_KEY` — Project API anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Required for seeding test auth users
- `SUPABASE_JWT_SECRET` — Optional; token validation uses Supabase `auth.getUser`

Then:

```bash
npm run prisma:generate
npx prisma migrate deploy
npm run db:seed
npm run start:dev
```

### Supabase CLI (optional)

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Run `supabase/schema.sql` once in the SQL editor if `profiles` / `organizations` tables are missing.

### Test accounts

After `npm run db:seed`, sign in with any `*@gratehcare.test` user (one per role). Password: `0778007350` (`TEST_ACCOUNT_PASSWORD`).

Real users register through Supabase Auth (frontend signup); the API accepts Supabase access tokens on protected routes.

API prefix: `/api/v1`

## Modules

- `auth`
- `users`
- `roles`
- `organizations`
- `staff`
- `clients`
- `rostering`
- `timesheets`
- `care-plans`
- `care-notes`
- `medication`
- `incidents`
- `billing`
- `subscription-billing` (Stripe Checkout, webhooks, billing emails)
- `subscriptions` (trial resolution, read-only guard)
- `compliance`
- `documents`
- `messages`
- `notifications`
- `reports`
- `audit-logs`

## Architecture Notes

- Tenant-scoped models use `tenant_id` / `tenantId`.
- IDs are UUIDs across core models.
- Guards are included for JWT auth, roles, and permissions.
- `RequestContextMiddleware` captures `x-request-id` and `x-tenant-id`.
- Prisma service includes an audit hook extension point.
- Resource services write audit log records on create/update/archive.
- Redis is optional and lazy-connected for queues/cache/session work later.
