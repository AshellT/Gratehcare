import { PrismaClient, Role } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const TEST_PASSWORD = process.env.TEST_ACCOUNT_PASSWORD || "0778007350";

const TEST_USERS: Array<{
  email: string;
  fullName: string;
  role: Role;
  supabaseRole: string;
  avatarColor: string;
}> = [
  { email: "platform.owner@gratehcare.test", fullName: "Platform Owner", role: Role.PLATFORM_OWNER, supabaseRole: "platform_owner", avatarColor: "#7c3aed" },
  { email: "super.admin@gratehcare.test", fullName: "Super Admin", role: Role.SUPER_ADMIN, supabaseRole: "super_admin", avatarColor: "#0f172a" },
  { email: "platform.support@gratehcare.test", fullName: "Platform Support", role: Role.PLATFORM_SUPPORT, supabaseRole: "platform_support", avatarColor: "#f97316" },
  { email: "org.owner@gratehcare.test", fullName: "Organization Owner", role: Role.ORGANIZATION_OWNER, supabaseRole: "org_owner", avatarColor: "#4f46e5" },
  { email: "operations.admin@gratehcare.test", fullName: "Operations Admin", role: Role.OPERATIONS_ADMIN, supabaseRole: "operations_admin", avatarColor: "#0ea5e9" },
  { email: "care.coordinator@gratehcare.test", fullName: "Care Coordinator", role: Role.CARE_COORDINATOR, supabaseRole: "care_coordinator", avatarColor: "#6366f1" },
  { email: "support.worker@gratehcare.test", fullName: "Support Worker", role: Role.SUPPORT_WORKER, supabaseRole: "support_worker", avatarColor: "#e11d48" },
  { email: "billing.officer@gratehcare.test", fullName: "Billing Officer", role: Role.BILLING_OFFICER, supabaseRole: "billing_officer", avatarColor: "#10b981" },
  { email: "compliance.officer@gratehcare.test", fullName: "Compliance Officer", role: Role.COMPLIANCE_OFFICER, supabaseRole: "compliance_officer", avatarColor: "#d97706" },
  { email: "family@gratehcare.test", fullName: "Family Member", role: Role.FAMILY_USER, supabaseRole: "family", avatarColor: "#d946ef" },
  { email: "practitioner@gratehcare.test", fullName: "Practitioner", role: Role.PRACTITIONER, supabaseRole: "practitioner", avatarColor: "#14b8a6" },
];

async function seedSupabaseAuthUsers() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.warn("[seed] Skipping Supabase Auth user creation — set SUPABASE_SERVICE_ROLE_KEY in backend/.env");
    return;
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: existingList } = await admin.auth.admin.listUsers({ perPage: 200 });

  for (const account of TEST_USERS) {
    const found = existingList.users.find((user) => user.email?.toLowerCase() === account.email);

    if (found) {
      await admin.auth.admin.updateUserById(found.id, {
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: account.fullName,
          role: account.supabaseRole,
          organization_name: "GRATEHCARE Demo Organization",
          avatar_color: account.avatarColor,
        },
      });
      continue;
    }

    const { error } = await admin.auth.admin.createUser({
      email: account.email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: account.fullName,
        role: account.supabaseRole,
        organization_name: "GRATEHCARE Demo Organization",
        avatar_color: account.avatarColor,
      },
    });

    if (error) {
      console.warn(`[seed] Supabase auth user ${account.email}: ${error.message}`);
    }
  }
}

async function syncSupabaseProfiles() {
  await prisma.$executeRawUnsafe(`
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
  `);
}

async function seedPrismaUsers(tenantId: string, passwordHash: string) {
  const authUsers = await prisma.$queryRaw<Array<{ id: string; email: string }>>`
    select id::text as id, lower(email) as email
    from auth.users
    where lower(email) like '%@gratehcare.test'
  `;

  const authByEmail = new Map(authUsers.map((row) => [row.email, row.id]));

  for (const account of TEST_USERS) {
    const supabaseId = authByEmail.get(account.email) ?? null;

    const user = await prisma.user.upsert({
      where: { email: account.email },
      create: {
        email: account.email,
        fullName: account.fullName,
        avatarColor: account.avatarColor,
        supabaseId,
        tenantId,
        passwordHash,
        isTestAccount: true,
        roles: {
          create: { role: account.role, tenantId },
        },
      },
      update: {
        fullName: account.fullName,
        avatarColor: account.avatarColor,
        supabaseId,
        tenantId,
        passwordHash,
        isTestAccount: true,
      },
      include: { roles: true },
    });

    if (!user.roles.some((assignment) => assignment.role === account.role)) {
      await prisma.roleAssignment.create({
        data: {
          userId: user.id,
          role: account.role,
          tenantId,
        },
      });
    }
  }
}

async function main() {
  console.log("[seed] Creating Supabase Auth test users …");
  await seedSupabaseAuthUsers();

  console.log("[seed] Syncing Supabase profiles …");
  try {
    await syncSupabaseProfiles();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[seed] Profile sync skipped:", message.split("\n")[0]);
  }

  const tenant = await prisma.tenant.upsert({
    where: { slug: "gratehcare-demo" },
    create: {
      name: "GRATEHCARE Demo Organization",
      slug: "gratehcare-demo",
      region: "Demo",
    },
    update: {
      name: "GRATEHCARE Demo Organization",
      region: "Demo",
    },
  });

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);
  console.log("[seed] Creating Prisma API users for all roles …");
  await seedPrismaUsers(tenant.id, passwordHash);

  console.log("[seed] Done. Test password:", TEST_PASSWORD);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
