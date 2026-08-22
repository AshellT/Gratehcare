import { apiClient, normalizePage } from "./client";

export interface AuditLog {
  id: string;
  action: string;
  userId?: string;
  tenantId?: string;
  user?: {
    id: string;
    name: string;
  };
  tenant?: {
    id: string;
    name: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogsListParams {
  limit?: number;
  offset?: number;
  userId?: string;
  tenantId?: string;
  action?: string;
}

export const auditLogsApi = {
  async list(params?: AuditLogsListParams) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.offset) queryParams.append("offset", String(params.offset));
    if (params?.userId) queryParams.append("userId", params.userId);
    if (params?.tenantId) queryParams.append("tenantId", params.tenantId);
    if (params?.action) queryParams.append("action", params.action);

    const query = queryParams.toString();
    const url = `/audit-logs${query ? `?${query}` : ""}`;

    return apiClient
      .get<{ items?: AuditLog[]; data?: AuditLog[]; total?: number }>(url)
      .then(normalizePage);
  },
};
