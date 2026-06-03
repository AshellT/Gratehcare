/**
 * Resolves the API base URL for fetch calls.
 *
 * - REACT_APP_API_URL set → use it (e.g. http://localhost:4000/api/v1)
 * - development, no env → same-origin /api/v1 (CRA proxy → backend :4000)
 * - production fallback → same-origin /api/v1
 */
function normalizeApiOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function resolveApiBase(): string {
  const raw = process.env.REACT_APP_API_URL?.trim();
  if (raw) {
    const origin = normalizeApiOrigin(raw);
    if (origin.endsWith("/api/v1")) return origin;
    return `${origin}/api/v1`;
  }

  if (process.env.NODE_ENV === "development") {
    return "/api/v1";
  }

  return "/api/v1";
}

export const API_BASE = resolveApiBase();
