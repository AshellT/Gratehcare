import { ClaimStatus, PrismaClient, Role, TicketPriority, TicketStatus } from "@prisma/client";
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

async function seedDemoData(tenantId: string) {
  const clientSpecs = [
    { id: "00000000-0000-4000-8000-000000000001", fullName: "Eleanor Rivers", funding: "Home Care Package" },
    { id: "00000000-0000-4000-8000-000000000002", fullName: "Marcus Thompson", funding: "NDIS" },
    { id: "00000000-0000-4000-8000-000000000003", fullName: "Alana Williams", funding: "Private" },
  ];

  const clients = await Promise.all(
    clientSpecs.map((client) =>
      prisma.client.upsert({
        where: { id: client.id },
        create: {
          id: client.id,
          tenantId,
          fullName: client.fullName,
          funding: client.funding,
          status: "ACTIVE",
        },
        update: { fullName: client.fullName, funding: client.funding, status: "ACTIVE" },
      }),
    ),
  );

  const eleanor = clients[0];
  const marcus = clients[1];

  await prisma.carePlan.upsert({
    where: { id: "00000000-0000-4000-8000-000000000101" },
    create: {
      id: "00000000-0000-4000-8000-000000000101",
      tenantId,
      clientId: eleanor.id,
      title: "Eleanor Rivers · Active care plan",
      status: "ACTIVE",
      goals: [
        { title: "Maintain mobility with daily walks", progress: 72, status: "on-track" },
        { title: "Improve hand strength via OT exercises", progress: 48, status: "on-track" },
        { title: "Achieve restful sleep 6/7 nights", progress: 86, status: "on-track" },
        { title: "Stable nutrition with weekly meal plan", progress: 92, status: "exceeded" },
      ],
      reviewDue: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    },
    update: {
      title: "Eleanor Rivers · Active care plan",
      status: "ACTIVE",
    },
  });

  const coordinator = await prisma.user.findUnique({ where: { email: "care.coordinator@gratehcare.test" } });
  const worker = await prisma.user.findUnique({ where: { email: "support.worker@gratehcare.test" } });

  let staffWorker = await prisma.staff.findFirst({ where: { tenantId, userId: worker?.id } });
  if (!staffWorker && worker) {
    staffWorker = await prisma.staff.create({
      data: { tenantId, userId: worker.id, title: "Support Worker", status: "ACTIVE" },
    });
  }

  await prisma.careNote.deleteMany({ where: { tenantId, clientId: eleanor.id } });
  await prisma.careNote.createMany({
    data: [
      {
        tenantId,
        clientId: eleanor.id,
        staffId: staffWorker?.id,
        title: "Daily visit note",
        body:
          "Eleanor was in great spirits today. Walk in the garden completed. Lunch eaten in full.",
        status: "ACTIVE",
      },
      {
        tenantId,
        clientId: eleanor.id,
        staffId: staffWorker?.id,
        title: "Morning visit",
        body: "Morning visit. Medications administered. No concerns.",
        status: "ACTIVE",
      },
    ],
  });

  await prisma.incident.deleteMany({ where: { tenantId } });
  await prisma.incident.createMany({
    data: [
      {
        tenantId,
        clientId: marcus.id,
        title: "Slip & fall",
        severity: "HIGH",
        status: "ACTIVE",
        details: "Reported by support worker during morning visit.",
        occurredAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        tenantId,
        clientId: eleanor.id,
        title: "Medication error",
        severity: "MEDIUM",
        status: "REVIEW",
        details: "Dosage discrepancy noted and escalated.",
        occurredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        tenantId,
        title: "Property damage",
        severity: "LOW",
        status: "PENDING",
        details: "Minor office equipment damage.",
        occurredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  await prisma.shift.deleteMany({ where: { tenantId } });
  const shiftSlots = [
    { day: 0, hour: 8, duration: 2, clientId: eleanor.id, status: "FILLED" as const },
    { day: 0, hour: 11, duration: 1.5, clientId: marcus.id, status: "FILLED" as const },
    { day: 1, hour: 9, duration: 3, clientId: marcus.id, status: "FILLED" as const },
    { day: 1, hour: 16, duration: 1.5, clientId: clients[2].id, status: "OPEN" as const },
    { day: 2, hour: 8, duration: 2, clientId: eleanor.id, status: "FILLED" as const },
  ];

  for (const slot of shiftSlots) {
    const startsAt = new Date(weekStart);
    startsAt.setDate(startsAt.getDate() + slot.day);
    startsAt.setHours(slot.hour, 0, 0, 0);
    const endsAt = new Date(startsAt.getTime() + slot.duration * 60 * 60 * 1000);
    await prisma.shift.create({
      data: {
        tenantId,
        clientId: slot.clientId,
        staffId: slot.status === "FILLED" ? staffWorker?.id : undefined,
        startsAt,
        endsAt,
        status: slot.status,
        service: "Personal care",
      },
    });
  }

  await prisma.invoice.deleteMany({ where: { tenantId } });
  await prisma.invoice.createMany({
    data: [
      {
        tenantId,
        clientId: eleanor.id,
        number: "INV-2401",
        amount: 4200,
        status: "SENT",
        issuedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        tenantId,
        clientId: marcus.id,
        number: "INV-2402",
        amount: 2850,
        status: "PAID",
        issuedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        dueAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  const submittedAt = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);
  const paidAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

  await prisma.claim.deleteMany({ where: { tenantId } });
  await prisma.claim.createMany({
    data: [
      {
        tenantId,
        clientId: eleanor.id,
        number: "CLM-2401",
        payer: "NDIS",
        service: "Community nursing",
        amount: 3200,
        status: ClaimStatus.PAID,
        submittedAt,
        paidAt,
      },
      {
        tenantId,
        clientId: marcus.id,
        number: "CLM-2402",
        payer: "Insurer",
        service: "Therapy block",
        amount: 1800,
        status: ClaimStatus.REVIEW,
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        tenantId,
        clientId: clients[2].id,
        number: "CLM-2403",
        payer: "Package",
        service: "Domestic assistance",
        amount: 950,
        status: ClaimStatus.SUBMITTED,
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  await prisma.supportTicket.deleteMany({ where: { tenantId } });
  await prisma.supportTicket.createMany({
    data: [
      {
        tenantId,
        number: "TKT-1042",
        subject: "Roster sync delay",
        description: "Shifts not appearing in mobile app for 2 coordinators.",
        priority: TicketPriority.HIGH,
        status: TicketStatus.OPEN,
        requesterId: coordinator?.id,
      },
      {
        tenantId,
        number: "TKT-1041",
        subject: "Claim export format",
        description: "Need CSV export aligned to insurer remittance layout.",
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.IN_PROGRESS,
        requesterId: coordinator?.id,
      },
      {
        tenantId,
        number: "TKT-1038",
        subject: "Billing dashboard access",
        description: "Billing officer cannot see reconciliation tab.",
        priority: TicketPriority.LOW,
        status: TicketStatus.RESOLVED,
        resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        csatScore: 5,
      },
    ],
  });

  await prisma.marketingTestimonial.deleteMany({});
  await prisma.marketingTestimonial.createMany({
    data: [
      {
        quote:
          "We replaced four tools with GRATEHCARE in a week. Our coordinators got their evenings back, and our claims are paid 11 days faster on average.",
        name: "Sarah Mitchell",
        role: "CEO, Meridian Home Care",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
        org: "Meridian",
        sortOrder: 1,
      },
      {
        quote:
          "The compliance dashboard alone saved us during our last audit. Auditors actually smiled. I didn't know that was possible.",
        name: "James Okafor",
        role: "Compliance Lead, Aurora Disability",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
        org: "Aurora",
        sortOrder: 2,
      },
      {
        quote:
          "GRATEHCARE AI predicted three shift gaps before they happened. Our families noticed the difference within a month.",
        name: "Priya Raman",
        role: "Operations Director, Northwind",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
        org: "Northwind",
        sortOrder: 3,
      },
    ],
  });

  await prisma.knowledgeArticle.deleteMany({});
  await prisma.knowledgeArticle.createMany({
    data: [
      {
        title: "Reset tenant admin password",
        category: "Account",
        body: "Verify tenant identity, open Users, send invite or reset via Supabase admin.",
        tags: ["password", "tenant"],
      },
      {
        title: "Roster sync troubleshooting",
        category: "Operations",
        body: "Check integration status, confirm mobile app version, re-sync shifts from Rostering.",
        tags: ["roster", "mobile"],
      },
      {
        title: "Claim export CSV layout",
        category: "Finance",
        body: "Use Finance → Claims → Export. Columns match insurer remittance: number, payer, service, amount, status.",
        tags: ["claims", "export"],
      },
    ],
  });

  const orgOwner = await prisma.user.findUnique({ where: { email: "org.owner@gratehcare.test" } });
  const familyUser = await prisma.user.findUnique({ where: { email: "family@gratehcare.test" } });
  if (coordinator && orgOwner) {
    const threadId = "00000000-0000-4000-8000-000000000901";
    await prisma.message.deleteMany({ where: { threadId } });
    await prisma.message.createMany({
      data: [
        {
          tenantId,
          threadId,
          senderId: coordinator.id,
          subject: "Care update",
          body: "Eleanor's visit went well this morning. Medications administered on schedule.",
          status: "SENT",
        },
        {
          tenantId,
          threadId,
          senderId: orgOwner.id,
          body: "Thanks — please note this in the care plan review.",
          status: "READ",
        },
        {
          tenantId,
          threadId,
          senderId: familyUser?.id ?? coordinator.id,
          body: "Could we schedule an extra visit on Thursday?",
          status: "SENT",
        },
      ],
    });
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
      planId: "pro",
      subscriptionStatus: "active",
    },
    update: {
      name: "GRATEHCARE Demo Organization",
      region: "Demo",
      subscriptionStatus: "active",
      trialEndsAt: null,
    },
  });

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);
  console.log("[seed] Creating Prisma API users for all roles …");
  await seedPrismaUsers(tenant.id, passwordHash);

  console.log("[seed] Seeding demo care, finance and support data …");
  await seedDemoData(tenant.id);

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
