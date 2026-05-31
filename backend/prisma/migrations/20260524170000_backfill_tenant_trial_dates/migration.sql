-- Backfill trial metadata for tenants created before subscription fields existed
UPDATE "Tenant"
SET
  subscription_status = COALESCE(NULLIF(subscription_status, ''), 'trial'),
  plan_id = COALESCE(NULLIF(plan_id, ''), 'pro'),
  trial_ends_at = COALESCE(trial_ends_at, "createdAt" + interval '14 days')
WHERE trial_ends_at IS NULL
  AND subscription_status = 'trial';

-- Demo org stays fully active for test accounts
UPDATE "Tenant"
SET
  subscription_status = 'active',
  trial_ends_at = NULL
WHERE slug = 'gratehcare-demo';
