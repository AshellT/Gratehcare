/** Shared pagination wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  _isMock?: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

/** Generic entity with tenant and timestamps */
export interface BaseEntity {
  id: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ─── Tenants ──────────────────────────────────────────────────────────────────
export interface Tenant extends BaseEntity {
  name: string;
  plan: "starter" | "growth" | "enterprise";
  status: "active" | "suspended" | "trial";
  ownerEmail: string;
  clientCount: number;
  staffCount: number;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export interface User extends BaseEntity {
  email: string;
  fullName: string;
  role: string;
  status: "active" | "inactive" | "pending";
  avatarColor?: string;
  organizationId?: string;
}

// ─── Staff ────────────────────────────────────────────────────────────────────
export interface StaffMember extends BaseEntity {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  status: "active" | "inactive" | "on_leave";
  hoursPerWeek: number;
  skills: string[];
  credentialsExpiry?: string;
  satisfactionScore?: number;
}

// ─── Clients ──────────────────────────────────────────────────────────────────
export interface Client extends BaseEntity {
  fullName: string;
  initial: string;
  status: "active" | "onboarding" | "paused" | "discharged";
  funding: string;
  coordinator?: string;
  since: string;
  hoursPerWeek?: number;
  color?: string;
  riskLevel?: "low" | "medium" | "high";
}

// ─── Rostering ────────────────────────────────────────────────────────────────
export interface Shift extends BaseEntity {
  clientName: string;
  workerName?: string;
  startTime: string;
  endTime: string;
  type: string;
  status: "open" | "filled" | "completed" | "cancelled" | "missed";
  location?: string;
  notes?: string;
}

// ─── Timesheets ───────────────────────────────────────────────────────────────
export interface Timesheet extends BaseEntity {
  staffName: string;
  weekStarting: string;
  hoursWorked: number;
  mileage?: number;
  status: "draft" | "submitted" | "approved" | "rejected";
  notes?: string;
}

// ─── Care ─────────────────────────────────────────────────────────────────────
export interface CarePlan extends BaseEntity {
  clientName: string;
  coordinator: string;
  status: "active" | "review_due" | "expired";
  lastReviewedAt?: string;
  nextReviewAt?: string;
  goals: string[];
}

export interface CareNote extends BaseEntity {
  clientName: string;
  workerName: string;
  visitDate: string;
  content: string;
  mood?: "positive" | "neutral" | "concerning";
  flagged?: boolean;
}

// ─── Incidents ────────────────────────────────────────────────────────────────
export interface Incident extends BaseEntity {
  reference: string;
  clientName: string;
  reportedBy: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "closed";
  occurredAt: string;
  summary: string;
}

// ─── Billing ─────────────────────────────────────────────────────────────────
export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  issuedAt: string;
  dueAt: string;
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled";
  lineItems?: LineItem[];
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ─── Compliance ───────────────────────────────────────────────────────────────
export interface ComplianceEvent extends BaseEntity {
  title: string;
  category: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  assignee?: string;
  severity: "low" | "medium" | "high" | "critical";
}

// ─── Documents ───────────────────────────────────────────────────────────────
export interface Document extends BaseEntity {
  name: string;
  mimeType: string;
  sizeBytes: number;
  status: "uploading" | "ready" | "error";
  uploadedBy: string;
  previewUrl?: string;
  tags?: string[];
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export interface Conversation extends BaseEntity {
  participantNames: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface Message extends BaseEntity {
  conversationId: string;
  senderName: string;
  content: string;
  sentAt: string;
  readAt?: string;
  isOwn: boolean;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface Notification extends BaseEntity {
  type: string;
  title: string;
  body?: string;
  severity: "critical" | "warning" | "info" | "success";
  read: boolean;
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export interface ReportSummary {
  period: string;
  totalRevenue: number;
  totalShifts: number;
  totalClients: number;
  activeStaff: number;
  complianceScore: number;
  rosterFillRate: number;
  _isMock?: boolean;
}
