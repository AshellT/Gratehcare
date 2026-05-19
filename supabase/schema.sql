-- =====================================================================
-- GRATEHCARE · Supabase schema (run this in your Supabase SQL editor)
-- =====================================================================
-- This script is idempotent and safe to re-run.
-- It creates:
--   * gratehcare_role enum
--   * organizations table
--   * profiles table (1:1 with auth.users)
--   * clients table
--   * shifts table
--   * shift_status enum
--   * Trigger to auto-create profile + organization from auth signup metadata
--   * profiles_with_org view (used by frontend AuthContext)
--   * RLS policies scoped by organization_id
-- =====================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  create type gratehcare_role as enum (
    'platform_owner',
    'super_admin',
    'platform_support',
    'org_owner',
    'operations_admin',
    'care_coordinator',
    'support_worker',
    'billing_officer',
    'compliance_officer',
    'family',
    'practitioner'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type shift_status as enum ('open', 'tentative', 'filled', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type client_status as enum ('active', 'onboarding', 'paused', 'archived');
exception when duplicate_object then null;
end $$;

-- ---------- organizations ----------
create table if not exists public.organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  region        text,
  created_at    timestamptz not null default now()
);

-- ---------- profiles (1:1 with auth.users) ----------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  full_name       text not null default '',
  role            gratehcare_role not null default 'org_owner',
  organization_id uuid references public.organizations(id) on delete set null,
  avatar_color    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists profiles_org_idx on public.profiles(organization_id);

-- ---------- clients ----------
create table if not exists public.clients (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name       text not null,
  status          client_status not null default 'active',
  funding         text,
  coordinator_id  uuid references public.profiles(id) on delete set null,
  hours_per_week  numeric default 0,
  since           date default now(),
  created_at      timestamptz not null default now()
);

create index if not exists clients_org_idx on public.clients(organization_id);

-- ---------- shifts ----------
create table if not exists public.shifts (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id       uuid references public.clients(id) on delete set null,
  staff_id        uuid references public.profiles(id) on delete set null,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  status          shift_status not null default 'open',
  service         text,
  notes           text,
  created_at      timestamptz not null default now()
);

create index if not exists shifts_org_idx on public.shifts(organization_id);
create index if not exists shifts_starts_idx on public.shifts(starts_at);

-- ---------- Auto-create profile + organization on signup ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_org_name text;
  v_role gratehcare_role;
  v_full_name text;
  v_avatar_color text;
begin
  v_org_name := coalesce(new.raw_user_meta_data->>'organization_name', 'My Organization');
  v_role := coalesce((new.raw_user_meta_data->>'role')::gratehcare_role, 'org_owner');
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_avatar_color := coalesce(new.raw_user_meta_data->>'avatar_color', '#4f46e5');

  -- For Org Owner roles (or anyone signing up first), create the organization
  insert into public.organizations(name) values (v_org_name) returning id into v_org_id;

  insert into public.profiles(id, email, full_name, role, organization_id, avatar_color)
  values (new.id, new.email, v_full_name, v_role, v_org_id, v_avatar_color);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- View consumed by frontend ----------
create or replace view public.profiles_with_org as
  select
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.organization_id,
    p.avatar_color,
    o.name as organization_name,
    p.created_at,
    p.updated_at
  from public.profiles p
  left join public.organizations o on o.id = p.organization_id;

grant select on public.profiles_with_org to authenticated, anon;

-- ---------- Demo users/profile backfill ----------
-- Auth users are created through the Supabase Admin API / prisma seed with password:
--   0778007350
-- Re-running this block safely creates/updates the app profiles for them.
with demo_org as (
  insert into public.organizations(name, region)
  select 'GRATEHCARE Demo Organization', 'Demo'
  where not exists (
    select 1 from public.organizations where name = 'GRATEHCARE Demo Organization'
  )
  returning id
),
selected_org as (
  select id from demo_org
  union all
  select id from public.organizations
  where name = 'GRATEHCARE Demo Organization'
  order by id
  limit 1
),
demo_users(email, full_name, role, avatar_color) as (
  values
    ('platform.owner@gratehcare.test', 'Platform Owner', 'platform_owner'::gratehcare_role, '#7c3aed'),
    ('super.admin@gratehcare.test', 'Super Admin', 'super_admin'::gratehcare_role, '#0f172a'),
    ('platform.support@gratehcare.test', 'Platform Support', 'platform_support'::gratehcare_role, '#f97316'),
    ('org.owner@gratehcare.test', 'Organization Owner', 'org_owner'::gratehcare_role, '#4f46e5'),
    ('operations.admin@gratehcare.test', 'Operations Admin', 'operations_admin'::gratehcare_role, '#0ea5e9'),
    ('care.coordinator@gratehcare.test', 'Care Coordinator', 'care_coordinator'::gratehcare_role, '#6366f1'),
    ('support.worker@gratehcare.test', 'Support Worker', 'support_worker'::gratehcare_role, '#e11d48'),
    ('billing.officer@gratehcare.test', 'Billing Officer', 'billing_officer'::gratehcare_role, '#10b981'),
    ('compliance.officer@gratehcare.test', 'Compliance Officer', 'compliance_officer'::gratehcare_role, '#d97706'),
    ('family@gratehcare.test', 'Family Member', 'family'::gratehcare_role, '#d946ef'),
    ('practitioner@gratehcare.test', 'Practitioner', 'practitioner'::gratehcare_role, '#14b8a6')
)
insert into public.profiles(id, email, full_name, role, organization_id, avatar_color)
select
  au.id,
  du.email,
  du.full_name,
  du.role,
  so.id,
  du.avatar_color
from demo_users du
join auth.users au on lower(au.email) = du.email
cross join selected_org so
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  role = excluded.role,
  organization_id = excluded.organization_id,
  avatar_color = excluded.avatar_color,
  updated_at = now();

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.profiles      enable row level security;
alter table public.organizations enable row level security;
alter table public.clients       enable row level security;
alter table public.shifts        enable row level security;

-- Helper: org_id of the current user
create or replace function public.current_org_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

-- ---------- profiles policies ----------
drop policy if exists "profiles read own org"   on public.profiles;
drop policy if exists "profiles update self"    on public.profiles;
drop policy if exists "profiles insert self"    on public.profiles;

create policy "profiles read own org" on public.profiles for select
  to authenticated
  using (
    id = auth.uid() or organization_id = public.current_org_id()
  );

create policy "profiles update self" on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles insert self" on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- ---------- organizations policies ----------
drop policy if exists "orgs read own" on public.organizations;
create policy "orgs read own" on public.organizations for select
  to authenticated
  using (id = public.current_org_id());

-- ---------- clients policies ----------
drop policy if exists "clients select org" on public.clients;
drop policy if exists "clients write org"  on public.clients;

create policy "clients select org" on public.clients for select
  to authenticated
  using (organization_id = public.current_org_id());

create policy "clients write org" on public.clients for all
  to authenticated
  using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

-- ---------- shifts policies ----------
drop policy if exists "shifts select org" on public.shifts;
drop policy if exists "shifts write org"  on public.shifts;

create policy "shifts select org" on public.shifts for select
  to authenticated
  using (organization_id = public.current_org_id());

create policy "shifts write org" on public.shifts for all
  to authenticated
  using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());
