import { apiClient, normalizePage } from "./client";
import type {
  CareNote,
  CarePlan,
  PaginatedResponse,
  PaginationQuery,
} from "./types";

type RawCarePlan = Partial<CarePlan> & {
  reviewDue?: string;
  client?: { fullName?: string };
};

type RawCareNote = Partial<CareNote> & {
  body?: string;
  createdAt?: string;
  sharedWithFamily?: boolean;
  client?: { fullName?: string };
  staff?: { title?: string; user?: { fullName?: string } };
};

const recordStatus = (status?: string) => String(status ?? "ACTIVE").toUpperCase();

const normalizePlanStatus = (status?: string): CarePlan["status"] => {
  switch (recordStatus(status)) {
    case "REVIEW":
      return "review_due";
    case "ARCHIVED":
      return "expired";
    default:
      return "active";
  }
};

const normalizeCarePlan = (plan: RawCarePlan): CarePlan => ({
  ...(plan as CarePlan),
  clientName: plan.clientName ?? plan.client?.fullName ?? "Client",
  coordinator: plan.coordinator ?? "—",
  status: normalizePlanStatus(plan.status),
  goals: Array.isArray(plan.goals) ? plan.goals : [],
  nextReviewAt: plan.nextReviewAt ?? plan.reviewDue,
});

const normalizeCareNote = (note: RawCareNote): CareNote => ({
  ...(note as CareNote),
  clientName: note.clientName ?? note.client?.fullName ?? "Client",
  workerName: note.workerName ?? note.staff?.user?.fullName ?? note.staff?.title ?? "—",
  visitDate: note.visitDate ?? note.createdAt ?? new Date().toISOString(),
  content: note.content ?? note.body ?? "",
  flagged: note.flagged ?? recordStatus(note.status) === "REVIEW",
});

const normalizePlanPage = (page: PaginatedResponse<RawCarePlan> | { items?: RawCarePlan[] }) => {
  const normalized = normalizePage(page);
  return { ...normalized, data: normalized.data.map(normalizeCarePlan) };
};

const normalizeNotePage = (page: PaginatedResponse<RawCareNote> | { items?: RawCareNote[] }) => {
  const normalized = normalizePage(page);
  return { ...normalized, data: normalized.data.map(normalizeCareNote) };
};

export const careApi = {
  listPlans: (query?: PaginationQuery) =>
    apiClient
      .get<
        PaginatedResponse<RawCarePlan> | {
          items?: RawCarePlan[];
          total?: number;
          page?: number;
          limit?: number;
        }
      >("/care-plans", { params: query as any })
      .then(normalizePlanPage),

  getPlan: (id: string) => apiClient.get<RawCarePlan>(`/care-plans/${id}`).then(normalizeCarePlan),

  createPlan: (data: Partial<CarePlan>) =>
    apiClient.post<RawCarePlan>("/care-plans", data as any).then(normalizeCarePlan),

  updatePlan: (id: string, data: Partial<CarePlan>) =>
    apiClient.patch<RawCarePlan>(`/care-plans/${id}`, data as any).then(normalizeCarePlan),

  listNotes: (
    query?: PaginationQuery & { clientId?: string; flaggedOnly?: boolean },
  ) =>
    apiClient
      .get<
        PaginatedResponse<RawCareNote> | {
          items?: RawCareNote[];
          total?: number;
          page?: number;
          limit?: number;
        }
      >("/care-notes", { params: query as any })
      .then(normalizeNotePage),

  createNote: (data: Partial<CareNote>) =>
    apiClient.post<RawCareNote>("/care-notes", data as any).then(normalizeCareNote),

  updateNote: (id: string, data: Partial<CareNote>) =>
    apiClient.patch<RawCareNote>(`/care-notes/${id}`, data as any).then(normalizeCareNote),
};
