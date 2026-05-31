import { apiClient, withFallback } from "./client";

export interface MarketingTestimonial {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
  org?: string;
}

export interface MarketingStat {
  value: string;
  label: string;
}

export interface MarketingContent {
  testimonials: MarketingTestimonial[];
  stats: MarketingStat[];
}

export interface CreateLeadPayload {
  type: "demo" | "enterprise";
  name: string;
  email: string;
  organization?: string;
  phone?: string;
  message?: string;
  planId?: string;
  source?: string;
}

export interface CreateLeadResponse {
  id: string;
  message: string;
}

const defaultContent: MarketingContent = {
  testimonials: [],
  stats: [
    { value: "2,400+", label: "Care teams" },
    { value: "4.9/5", label: "Customer rating" },
    { value: "11 days", label: "Faster claim payouts" },
    { value: "98%", label: "Roster fill rate" },
  ],
};

export const publicApi = {
  getMarketing: () =>
    withFallback(
      () => apiClient.get<MarketingContent>("/public/marketing", { public: true }),
      defaultContent,
    ),

  createLead: (payload: CreateLeadPayload) =>
    apiClient.post<CreateLeadResponse>("/public/leads", payload as any, { public: true }),
};
