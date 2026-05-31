import type { Role } from "@/lib/roles";

/** Default post-auth route for each role. */
export function getAppHomePath(role: Role): string {
  switch (role) {
    case "family":
      return "/app/family-overview";
    case "practitioner":
      return "/app/practitioner-overview";
    default:
      return "/app";
  }
}
