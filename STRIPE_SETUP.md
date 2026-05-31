# Stripe subscription billing setup

GRATEHCARE uses a **single Stripe account** (the platform owner's). Every organization that subscribes pays into that account. There is no Stripe Connect split — you receive 100% of subscription revenue minus Stripe fees.

## What you need from Stripe

Create or sign in at [stripe.com](https://dashboard.stripe.com).

### 1. API keys

**Developers → API keys**

| Variable | Where to get it | Notes |
|----------|-----------------|-------|
| `STRIPE_SECRET_KEY` | Secret key (`sk_test_…` or `sk_live_…`) | **Required.** Server-only. Never put in the frontend. |
| `STRIPE_PUBLISHABLE_KEY` | Publishable key (`pk_test_…` or `pk_live_…`) | Optional today; exposed via `/subscription-billing/config` for future use. |

Use **test** keys while developing; switch to **live** keys when you go to production.

### 2. Products and prices

**Product catalog → Add product** — create three recurring monthly products matching your plans:

| Plan | Suggested price | Env variable |
|------|-----------------|--------------|
| Start | $89/mo | `STRIPE_PRICE_START` |
| Pro | $199/mo | `STRIPE_PRICE_PRO` |
| Elite | $499/mo | `STRIPE_PRICE_ELITE` |

For each product, add a **recurring monthly** price. Copy the **Price ID** (`price_…`) into the matching env var on Railway.

Prices on the landing page are for display; Stripe charges whatever amount is on the Price object.

### 3. Webhook

**Developers → Webhooks → Add endpoint**

- **URL:** `https://YOUR_RAILWAY_API/api/v1/subscription-billing/stripe/webhook`
- **Events to listen for:**
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

Copy the **Signing secret** (`whsec_…`) → `STRIPE_WEBHOOK_SECRET`.

For local testing, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:4000/api/v1/subscription-billing/stripe/webhook
```

Use the CLI signing secret as `STRIPE_WEBHOOK_SECRET` locally.

### 4. Payouts (getting the money)

**Settings → Payouts** — connect your bank account. Stripe deposits collected subscription payments on your payout schedule (daily/weekly depending on region).

No extra keys are needed for payouts beyond the standard secret key on your account.

## Railway environment variables

Add to your backend service (see `env/gratehcare-production.railway.txt`):

```
FRONTEND_URL=https://gratehcare.vercel.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_START=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ELITE=price_...
```

Optional:

```
STRIPE_PUBLISHABLE_KEY=pk_live_...
RESEND_API_KEY=re_...
BILLING_FROM_EMAIL=GRATEHCARE Billing <billing@yourdomain.com>
```

Then run migrations:

```bash
npx prisma migrate deploy
```

## Billing emails (Resend)

1. Sign up at [resend.com](https://resend.com).
2. **Domains** → verify your sending domain (e.g. `gratehcare.care`).
3. Create an API key → `RESEND_API_KEY`.
4. Set `BILLING_FROM_EMAIL` to an address on that domain.

If `RESEND_API_KEY` is missing, checkout and webhooks still work; emails are skipped with a server log warning.

## Optional: Integrations UI

Platform Owner → **Integrations → Stripe** can store an `apiKey` in the database as a **fallback** if `STRIPE_SECRET_KEY` is not set on the server.

Price IDs and the webhook secret **must** still be set as environment variables — the Integrations UI does not replace those.

## How the flow works

1. User signs up → 14-day trial (`subscriptionStatus: trial`, `trialEndsAt` set).
2. On **Subscription** page, if Stripe is configured, **Subscribe with card** → Stripe Checkout.
3. Checkout creates a Stripe Customer + Subscription (trial end aligned with app trial if still active).
4. Stripe webhook `checkout.session.completed` → sets `subscriptionStatus: active` (or keeps `trial` if Stripe status is `trialing`), stores `stripeCustomerId`, `stripeSubscriptionId`, `currentPeriodEnd`.
5. `invoice.payment_succeeded` → sends payment receipt email via Resend.
6. After trial expiry without payment → read-only mode (GET allowed, writes blocked).
7. If Stripe is not configured → **Request upgrade** creates a marketing lead for manual follow-up.

## Test cards

In test mode:

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 9995` | Declined |

Use any future expiry, any CVC, any billing ZIP.

## Verify end-to-end

1. Set test Stripe keys + price IDs on Railway (or locally).
2. Register a new org or use a trial account.
3. Go to **App → Subscription → Subscribe with card**.
4. Complete Checkout with `4242…`.
5. Confirm in Stripe Dashboard → Customers / Subscriptions.
6. Confirm in DB: tenant `subscriptionStatus` = `active`, `stripeSubscriptionId` set.
7. Confirm webhook deliveries in Stripe → Webhooks (200 responses).
