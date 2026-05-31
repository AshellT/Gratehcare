# Deploy: Supabase + Railway + Vercel

Supabase is the **backend platform** (Postgres + Auth). Railway runs the **NestJS API** that reads/writes Supabase. Vercel hosts the **React app**.

**Your production URLs**

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://gratehcare.vercel.app |
| Backend (Railway vars) | [Railway variables](https://railway.com/project/0353c539-e71f-441a-8e6b-86fd14d04a56/service/b873f3cb-3453-4a27-9aa6-aad1111941e1/variables) |
| Supabase project | `qijhaslgckubaieigmbv` → https://qijhaslgckubaieigmbv.supabase.co |

**Copy-paste env files:** [`env/gratehcare-production.railway.txt`](./env/gratehcare-production.railway.txt) · [`env/gratehcare-production.vercel.txt`](./env/gratehcare-production.vercel.txt) · [`env/supabase-auth-urls.txt`](./env/supabase-auth-urls.txt)

```
┌─────────────┐     REACT_APP_API_URL      ┌──────────────┐     DATABASE_URL     ┌──────────────┐
│   Vercel    │ ─────────────────────────► │   Railway    │ ───────────────────► │   Supabase   │
│  (React)    │     REACT_APP_SUPABASE_*   │  (NestJS)    │     SUPABASE_*       │ DB + Auth    │
└─────────────┘ ─────────────────────────► └──────────────┘                      └──────────────┘
       │                                              │
       └──────── SSE real-time: /api/v1/notifications/stream ─────────────────────► Railway
```

## 1. Supabase (one project for everything)

In [Supabase Dashboard](https://supabase.com/dashboard) → your project:

| Where | What |
|-------|------|
| **Settings → Database** | Copy **Transaction** pooler → `DATABASE_URL` (Railway) |
| **Settings → Database** | Copy **Session** pooler → `DIRECT_URL` (Railway, migrations) |
| **Settings → API** | `SUPABASE_URL`, **anon** key, **service_role** key → Railway |
| **Settings → API** | **anon** key + URL → Vercel (`REACT_APP_*`) |
| **Authentication → URL configuration** | Site URL: `https://gratehcare.vercel.app` — see [`env/supabase-auth-urls.txt`](./env/supabase-auth-urls.txt) |

## 2. Railway (API)

- **Root directory:** leave as repo root (default) — `railway.json` + `railpack.json` at repo root build `backend/`. Alternatively set root directory to `backend` and use `backend/railpack.json`.
- **Env template:** [`env/gratehcare-production.railway.txt`](./env/gratehcare-production.railway.txt)
- After first deploy:

```bash
npx prisma migrate deploy
```

This applies tenant subscription fields, marketing leads, and trial backfill for existing organizations.

```bash
railway run npx prisma migrate deploy
railway run npm run db:seed   # optional demo users *@gratehcare.test
```

- Set `CORS_ORIGIN=https://gratehcare.vercel.app`
- **Networking → Public domain:** copy this URL into Vercel `REACT_APP_API_URL`
- **Health check:** `GET https://<railway-domain>/api/v1/system/health`

## 3. Vercel (frontend)

- **Live app:** https://gratehcare.vercel.app
- **Env template:** [`env/gratehcare-production.vercel.txt`](./env/gratehcare-production.vercel.txt)
- Set `REACT_APP_API_URL` to your Railway **public domain** (Networking tab)
- **Redeploy** after any `REACT_APP_*` change

## 4. Local development

```bash
# backend/.env   — copy from backend/.env.example, fill Supabase values
# frontend/.env  — copy from frontend/.env.example, same SUPABASE_URL/anon key
```

## 5. Verify end-to-end

1. Railway health endpoint returns OK  
2. Vercel app login works (demo: `org.owner@gratehcare.test` + seed password)  
3. Network tab shows API calls to Railway, not `vercel.app/api/v1`  
4. Real-time: after login, SSE connects to `{API}/notifications/stream?access_token=...`

## Secrets — never on Vercel

Keep on **Railway only:** `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`

See also: [`backend/RAILWAY_DEPLOYMENT.md`](./backend/RAILWAY_DEPLOYMENT.md)
