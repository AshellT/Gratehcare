const fs = require("fs");
const { Client } = require("pg");

const PASSWORD = "Password1";
const DEMO_ORG = "GRATEHCARE Demo Organization";

const users = [
  ["platform.owner@gratehcare.test", "Platform Owner", "platform_owner", "#7c3aed"],
  ["super.admin@gratehcare.test", "Super Admin", "super_admin", "#0f172a"],
  ["platform.support@gratehcare.test", "Platform Support", "platform_support", "#f97316"],
  ["org.owner@gratehcare.test", "Organization Owner", "org_owner", "#4f46e5"],
  ["operations.admin@gratehcare.test", "Operations Admin", "operations_admin", "#0ea5e9"],
  ["care.coordinator@gratehcare.test", "Care Coordinator", "care_coordinator", "#6366f1"],
  ["support.worker@gratehcare.test", "Support Worker", "support_worker", "#e11d48"],
  ["billing.officer@gratehcare.test", "Billing Officer", "billing_officer", "#10b981"],
  ["compliance.officer@gratehcare.test", "Compliance Officer", "compliance_officer", "#d97706"],
  ["family@gratehcare.test", "Family Member", "family", "#d946ef"],
  ["practitioner@gratehcare.test", "Practitioner", "practitioner", "#14b8a6"],
];

const ident = (name) => `"${String(name).replaceAll('"', '""')}"`;

async function columns(client, schema, table) {
  const { rows } = await client.query(
    "select column_name from information_schema.columns where table_schema = $1 and table_name = $2",
    [schema, table],
  );
  return new Set(rows.map((row) => row.column_name));
}

async function upsertAuthUser(client, email, fullName, role, color) {
  const found = await client.query(
    "select id from auth.users where lower(email) = lower($1) limit 1",
    [email],
  );
  const id = found.rows[0]?.id || crypto.randomUUID();
  const userColumns = await columns(client, "auth", "users");
  const appMeta = { provider: "email", providers: ["email"] };
  const userMeta = {
    full_name: fullName,
    role,
    organization_name: DEMO_ORG,
    avatar_color: color,
  };

  if (found.rows[0]) {
    await client.query(
      `update auth.users
       set encrypted_password = crypt($2, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           raw_app_meta_data = $3::jsonb,
           raw_user_meta_data = $4::jsonb,
           updated_at = now()
       where id = $1`,
      [id, PASSWORD, JSON.stringify(appMeta), JSON.stringify(userMeta)],
    );
  } else {
    const values = {
      instance_id: "00000000-0000-0000-0000-000000000000",
      id,
      aud: "authenticated",
      role: "authenticated",
      email,
      email_confirmed_at: new Date(),
      confirmed_at: new Date(),
      confirmation_sent_at: new Date(),
      raw_app_meta_data: JSON.stringify(appMeta),
      raw_user_meta_data: JSON.stringify(userMeta),
      is_super_admin: false,
      created_at: new Date(),
      updated_at: new Date(),
      phone: null,
      phone_confirmed_at: null,
      email_change_confirm_status: 0,
      is_sso_user: false,
      is_anonymous: false,
    };
    const insertColumns = Object.keys(values).filter((column) => userColumns.has(column));
    await client.query(
      `insert into auth.users (${insertColumns.map(ident).join(", ")})
       values (${insertColumns.map((_, index) => `$${index + 1}`).join(", ")})`,
      insertColumns.map((column) => values[column]),
    );
    await client.query(
      "update auth.users set encrypted_password = crypt($2, gen_salt('bf')) where id = $1",
      [id, PASSWORD],
    );
  }

  const identityColumns = await columns(client, "auth", "identities");
  if (identityColumns.size) {
    const identityValues = {
      id,
      user_id: id,
      identity_data: JSON.stringify({
        sub: id,
        email,
        email_verified: true,
        phone_verified: false,
      }),
      provider: "email",
      provider_id: email,
      last_sign_in_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      email,
    };
    const insertColumns = Object.keys(identityValues).filter((column) =>
      identityColumns.has(column),
    );
    const conflictTarget =
      identityColumns.has("provider") && identityColumns.has("provider_id")
        ? "(provider, provider_id)"
        : "(id)";

    await client.query(
      `insert into auth.identities (${insertColumns.map(ident).join(", ")})
       values (${insertColumns.map((_, index) => `$${index + 1}`).join(", ")})
       on conflict ${conflictTarget} do update set
         identity_data = excluded.identity_data,
         user_id = excluded.user_id,
         updated_at = now()`,
      insertColumns.map((column) => identityValues[column]),
    );
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(fs.readFileSync("supabase/schema.sql", "utf8"));
    console.log("schema applied");

    for (const user of users) {
      await upsertAuthUser(client, ...user);
      console.log(`auth user ready ${user[0]} ${user[2]}`);
    }

    await client.query(`
      with selected_org as (
        select id from public.organizations
        where name = '${DEMO_ORG}'
        order by created_at
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
      select au.id, du.email, du.full_name, du.role, so.id, du.avatar_color
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
    console.log("profiles backfilled");

    const { rows } = await client.query(
      "select email, role, organization_name from public.profiles_with_org where email like '%@gratehcare.test' order by role",
    );
    console.log(JSON.stringify(rows, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
