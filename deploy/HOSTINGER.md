# Hostinger KVM VPS — full self-host (no Supabase)

You need a **KVM VPS** (not shared hosting), Ubuntu 22.04/24.04, and a domain pointed at the VPS.

Recommended: Hostinger KVM 2 (8 GB RAM).

## 1. DNS

Create an A record for your domain (and `www` if you use it) to the VPS public IP.

## 2. Server packages

```bash
apt update && apt install -y git docker.io docker-compose-plugin ufw
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

## 3. App

```bash
git clone <your-repo> /opt/gratehcare
cd /opt/gratehcare
cp env/hostinger.env.example .env
nano .env   # set POSTGRES_PASSWORD, JWT_SECRET, FRONTEND_URL, CORS_ORIGIN, SMTP_*
```

`FRONTEND_URL` and `CORS_ORIGIN` must be `https://your-domain.com` with **no trailing slash**.

```bash
docker compose up -d --build
docker compose exec api npx prisma db seed   # optional demo users *@gratehcare.test
```

Health check: `curl http://YOUR_IP/api/v1/public/health`

## 4. HTTPS

Once DNS resolves:

```bash
apt install -y certbot
certbot certonly --webroot -w /opt/gratehcare/frontend-placeholder -d your-domain.com
```

Or terminate TLS with Hostinger's panel / a host nginx in front of `127.0.0.1:80`. After you have certificates, add `listen 443 ssl` to `deploy/nginx.conf` and mount the cert files.

## 5. Stripe

Webhook URL:

`https://your-domain.com/api/v1/subscription-billing/stripe/webhook`

Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`.

Paste the signing secret into `STRIPE_WEBHOOK_SECRET` and recreate the API container.

## 6. Backups

- `docker compose exec postgres pg_dump -U gratehcare gratehcare > backup.sql`
- Snapshot the `uploads` Docker volume (`/var/lib/docker/volumes/...`)
- Enable Hostinger VPS snapshots

## Demo logins (after seed)

Password is `TEST_ACCOUNT_PASSWORD` from `.env` (default `0778007350`).

- `org.owner@gratehcare.test`
- `platform.owner@gratehcare.test`
