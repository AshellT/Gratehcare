import { apiClient, normalizePage } from "./client";
import type { PaginatedResponse, Tenant, User } from "./types";

export type ResolvedSubscription = {
  status: string;
  planId: string;
  trialEndsAt: string | null;
  daysLeftInTrial: number | null;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  isReadOnly: boolean;
};

export type OrganizationCurrent = Tenant & {
  planId?: string;
  subscriptionStatus?: string;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscription?: ResolvedSubscription;
};

export const tenantsApi = {
  list: () =>
    apiClient
      .get<PaginatedResponse<Tenant> | { items?: Tenant[]; total?: number; page?: number; limit?: number }>("/organizations")
      .then(normalizePage),

  create: (data: { name: string; slug: string; region?: string }) =>
    apiClient.post<Tenant>("/organizations", data as any),

  getCurrent: () => apiClient.get<OrganizationCurrent>("/organizations/current"),

  platformRevenue: () =>
    apiClient.get<{
      tenantCount: number;
      userCount: number;
      payingTenants: number;
      trialTenants: number;
      pastDueTenants: number;
      cancelledTenants: number;
      mrr: number;
      arr: number;
      trialPipelineMrr: number;
      netRetentionPct: number;
      byPlan: {
        id: string;
        name: string;
        monthlyPrice: number;
        tenants: number;
        paying: number;
        trial: number;
        mrr: number;
      }[];
      recentTenants: {
        id: string;
        name: string;
        planId: string;
        status: string;
        paying: boolean;
        monthlyPrice: number;
      }[];
    }>("/organizations/platform-revenue"),

  requestUpgrade: (message?: string) =>
    apiClient.post<{ id: string; message: string }>(
      "/organizations/current/subscription/upgrade-request",
      { message } as any,
    ),

  update: (data: Partial<Tenant>) =>
    apiClient.patch<Tenant>("/organizations/current", data as any),

  listUsers: () =>
    apiClient
      .get<PaginatedResponse<User> | { items?: User[]; total?: number; page?: number; limit?: number }>("/users")
      .then(normalizePage),

  inviteUser: (email: string, role: string) =>
    apiClient.post("/users/invite", { email, role } as any),
};
