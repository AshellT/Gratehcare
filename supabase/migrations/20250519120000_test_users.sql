-- Test accounts for every GRATEHCARE role (password set via Supabase Admin API / prisma seed).
-- Password: 0778007350 (see backend TEST_ACCOUNT_PASSWORD)

-- Ensure demo organization exists for profile linkage
insert into public.organizations(name, region)
select 'GRATEHCARE Demo Organization', 'Demo'
where not exists (
  select 1 from public.organizations where name = 'GRATEHCARE Demo Organization'
);

-- Profiles are synced from auth.users by prisma/seed.ts after auth users are created.
