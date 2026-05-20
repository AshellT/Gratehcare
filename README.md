# GratehCare Deployment Guide

This repository has two deployable apps:

- `frontend` - React app (deploy this to Vercel)
- `backend` - NestJS + Prisma API (deploy this to Render/Railway/Fly.io or any Node host)

## 1) Push code to GitHub

From repo root:

```bash
git add .
git commit -m "Prepare GratehCare for Vercel deployment"
git push origin main
```

## 2) Deploy frontend to Vercel

1. In Vercel, click **Add New Project** and import this GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Add environment variables in Vercel Project Settings:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_API_URL` (your deployed backend URL, e.g. `https://api-yourapp.onrender.com`)
5. Deploy.

After this, every push to `main` triggers an automatic Vercel redeploy (live updates).

## 3) Deploy backend (required)

Vercel is not a good fit for this NestJS + Prisma + long-lived API setup. Deploy `backend` on a Node server platform.

Required backend env vars:

- `DATABASE_URL`
- `DIRECT_URL` (optional but recommended for Prisma)
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TEST_ACCOUNT_PASSWORD`
- `CORS_ORIGIN` (set to your Vercel frontend URL)

Backend start command:

```bash
npm run start:dev
```

Production command:

```bash
npm run build && npm run start
```
