import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL as string;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY in .env",
  );
}

/**
 * Defensive global fetch patch.
 * Some dev-time middleware (visual edits, browser extensions) eagerly read or
 * clone Response bodies, which causes "body stream already read" errors inside
 * supabase-js. We intercept *only* requests to Supabase and re-build the
 * Response from a fully-buffered body so downstream consumers can safely read
 * it. All other fetches pass through untouched.
 */
if (typeof window !== "undefined" && supabaseUrl && !(window as any).__luminaSupabaseFetchPatched) {
  const originalFetch = window.fetch.bind(window);
  (window as any).__luminaSupabaseFetchPatched = true;

  window.fetch = (async (input: any, init?: any) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input?.url || "";

    if (!url || !url.startsWith(supabaseUrl)) {
      return originalFetch(input, init);
    }

    const res = await originalFetch(input, init);
    try {
      const buffer = await res.arrayBuffer();
      return new Response(buffer, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
    } catch {
      return res;
    }
  }) as typeof fetch;
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "lumina.supabase.auth",
    },
  },
);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role:
    | "platform_owner"
    | "super_admin"
    | "platform_support"
    | "org_owner"
    | "operations_admin"
    | "care_coordinator"
    | "support_worker"
    | "billing_officer"
    | "compliance_officer"
    | "family"
    | "practitioner";
  organization_id: string | null;
  organization_name: string | null;
  avatar_color: string | null;
};
