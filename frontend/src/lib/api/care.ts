import { apiClient, withFallback } from "./client";
import type {
  CareNote,
  CarePlan,
  PaginatedResponse,
  PaginationQuery,
} from "./types";

const MOCK_CARE_PLANS: CarePlan[] = [
  {
    id: "cp-001",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    clientName: "Eleanor Rivers",
    coordinator: "Priya Raman",
    status: "review_due",
    lastReviewedAt: "2026-01-28",
    nextReviewAt: "2026-04-28",
    goals: ["Maintain mobility", "Medication adherence"],
  },
  {
    id: "cp-002",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    clientName: "Marcus Thompson",
    coordinator: "Daniel Wu",
    status: "active",
    lastReviewedAt: "2026-03-15",
    nextReviewAt: "2026-06-15",
    goals: ["Medication compliance", "Social engagement"],
  },
  {
    id: "cp-003",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    clientName: "Henry Park",
    coordinator: "James Okafor",
    status: "active",
    lastReviewedAt: "2026-02-20",
    nextReviewAt: "2026-05-20",
    goals: ["Personal care independence", "Physiotherapy"],
  },
  {
    id: "cp-004",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    clientName: "Maya Krishnan",
    coordinator: "Sara Hill",
    status: "active",
    lastReviewedAt: "2026-04-01",
    nextReviewAt: "2026-07-01",
    goals: ["Community participation"],
  },
];

const MOCK_CARE_NOTES: CareNote[] = [
  {
    id: "cn-001",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    clientName: "Eleanor Rivers",
    workerName: "Priya Raman",
    visitDate: "2026-04-28",
    content:
      "Eleanor was in good spirits today. Assisted with morning routine and breakfast. Noted some stiffness in left knee — recommend physio review.",
    mood: "positive",
    flagged: false,
  },
  {
    id: "cn-002",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    clientName: "Marcus Thompson",
    workerName: "Daniel Wu",
    visitDate: "2026-04-28",
    content:
      "Marcus refused evening medication again. Third time this week. Flagged for supervisor review.",
    mood: "concerning",
    flagged: true,
  },
  {
    id: "cn-003",
    tenantId: "demo",
    createdAt: "",
    updatedAt: "",
    clientName: "Henry Park",
    workerName: "James Okafor",
    visitDate: "2026-04-27",
    content:
      "Routine personal care completed. Henry mentioned he would like to attend the community garden group.",
    mood: "positive",
    flagged: false,
  },
];

const MOCK_PLANS_PAGE: PaginatedResponse<CarePlan> = {
  data: MOCK_CARE_PLANS,
  total: MOCK_CARE_PLANS.length,
  page: 1,
  limit: 20,
};
const MOCK_NOTES_PAGE: PaginatedResponse<CareNote> = {
  data: MOCK_CARE_NOTES,
  total: MOCK_CARE_NOTES.length,
  page: 1,
  limit: 20,
};

export const careApi = {
  listPlans: (query?: PaginationQuery) =>
    withFallback(
      () =>
        apiClient.get<PaginatedResponse<CarePlan>>("/care-plans", {
          params: query as any,
        }),
      MOCK_PLANS_PAGE,
    ),

  getPlan: (id: string) =>
    withFallback(
      () => apiClient.get<CarePlan>(`/care-plans/${id}`),
      MOCK_CARE_PLANS.find((p) => p.id === id) ?? MOCK_CARE_PLANS[0],
    ),

  createPlan: (data: Partial<CarePlan>) =>
    apiClient.post<CarePlan>("/care-plans", data as any),

  updatePlan: (id: string, data: Partial<CarePlan>) =>
    apiClient.patch<CarePlan>(`/care-plans/${id}`, data as any),

  listNotes: (
    query?: PaginationQuery & { clientId?: string; flaggedOnly?: boolean },
  ) =>
    withFallback(
      () =>
        apiClient.get<PaginatedResponse<CareNote>>("/care-notes", {
          params: query as any,
        }),
      MOCK_NOTES_PAGE,
    ),

  createNote: (data: Partial<CareNote>) =>
    apiClient.post<CareNote>("/care-notes", data as any),

  updateNote: (id: string, data: Partial<CareNote>) =>
    apiClient.patch<CareNote>(`/care-notes/${id}`, data as any),
};
