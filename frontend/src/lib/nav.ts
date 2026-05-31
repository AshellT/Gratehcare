import {
  LayoutDashboard,
  CalendarRange,
  Users,
  HeartPulse,
  Receipt,
  ShieldCheck,
  BarChart3,
  Settings,
  MessageSquare,
  Building2,
  HandHeart,
  ClipboardList,
  AlertTriangle,
  Wallet,
  FileBadge,
  Stethoscope,
  Network,
  Headphones,
  Activity,
  Plug,
  Tag,
  KeyRound,
  Library,
  ServerCog,
  UserCog,
  Clock,
  Banknote,
  BookOpen,
  GraduationCap,
  Folder,
  Target,
  FileText,
  Briefcase,
  CreditCard,
  FileCheck2,
} from "lucide-react";
import type { Role } from "./roles";
import type { ComponentType } from "react";

export type NavItem = {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

const home: NavItem = { label: "Dashboard", to: "/app", icon: LayoutDashboard };
const settingsSection: NavSection = {
  label: "Account",
  items: [{ label: "Settings", to: "/app/settings", icon: Settings }],
};

export const NAV_BY_ROLE: Record<Role, NavSection[]> = {
  /* ---------------- Platform ---------------- */
  platform_owner: [
    {
      label: "Platform",
      items: [
        home,
        { label: "Tenants", to: "/app/tenants", icon: Building2 },
        { label: "Network", to: "/app/network", icon: Network },
        { label: "Revenue", to: "/app/revenue", icon: Wallet },
        { label: "Plans", to: "/app/plans", icon: Tag },
      ],
    },
    {
      label: "Operations",
      items: [
        { label: "Reports", to: "/app/reports", icon: BarChart3 },
        { label: "Activity", to: "/app/activity", icon: Activity },
        { label: "Integrations", to: "/app/integrations", icon: Plug },
      ],
    },
    settingsSection,
  ],

  super_admin: [
    {
      label: "System",
      items: [
        home,
        { label: "Tenants", to: "/app/tenants", icon: Building2 },
        { label: "Users", to: "/app/users", icon: Users },
        { label: "Permissions", to: "/app/permissions", icon: KeyRound },
        { label: "System health", to: "/app/system", icon: ServerCog },
        { label: "Activity", to: "/app/activity", icon: Activity },
        { label: "Audit logs", to: "/app/audit-logs", icon: FileBadge },
      ],
    },
    settingsSection,
  ],

  platform_support: [
    {
      label: "Support",
      items: [
        home,
        { label: "Tickets", to: "/app/tickets", icon: Headphones },
        { label: "Tenants", to: "/app/tenants", icon: Building2 },
        { label: "Knowledge base", to: "/app/knowledge", icon: Library },
        { label: "Activity", to: "/app/activity", icon: Activity },
      ],
    },
    settingsSection,
  ],

  /* ---------------- Organization ---------------- */
  org_owner: [
    {
      label: "Workspace",
      items: [
        home,
        { label: "Rostering", to: "/app/rostering", icon: CalendarRange },
        { label: "Open shifts", to: "/app/open-shifts", icon: Clock },
        { label: "Conflicts", to: "/app/shift-conflicts", icon: AlertTriangle },
        { label: "Staff", to: "/app/staff", icon: UserCog },
        { label: "Clients", to: "/app/clients", icon: Users },
        { label: "Care plans", to: "/app/care-plans", icon: HeartPulse },
        { label: "Live activity", to: "/app/live-activity", icon: Activity },
        { label: "Messages", to: "/app/messages", icon: MessageSquare },
      ],
    },
    {
      label: "Finance",
      items: [
        { label: "Financial overview", to: "/app/financial-overview", icon: Wallet },
        { label: "Billing dashboard", to: "/app/billing-dashboard", icon: Receipt },
        { label: "Invoices", to: "/app/invoices", icon: FileText },
        { label: "Claims", to: "/app/finance-claims", icon: FileCheck2 },
        { label: "Payments", to: "/app/payments", icon: CreditCard },
        { label: "Revenue reports", to: "/app/revenue-reports", icon: BarChart3 },
      ],
    },
    {
      label: "Compliance",
      items: [
        { label: "Overview", to: "/app/compliance", icon: ShieldCheck },
        { label: "Risk alerts", to: "/app/risk-alerts", icon: AlertTriangle },
        { label: "Credentials", to: "/app/staff-credentials", icon: UserCog },
        { label: "Incidents", to: "/app/incident-register", icon: AlertTriangle },
        { label: "Investigations", to: "/app/investigations", icon: ClipboardList },
        { label: "Audit logs", to: "/app/audit-logs", icon: FileBadge },
        { label: "Corrective actions", to: "/app/corrective-actions", icon: FileCheck2 },
      ],
    },
    settingsSection,
  ],

  operations_admin: [
    {
      label: "Operations",
      items: [
        home,
        { label: "Rostering", to: "/app/rostering", icon: CalendarRange },
        { label: "Open shifts", to: "/app/open-shifts", icon: Clock },
        { label: "Conflicts", to: "/app/shift-conflicts", icon: AlertTriangle },
        { label: "Staff", to: "/app/staff", icon: UserCog },
        { label: "Clients", to: "/app/clients", icon: Users },
        { label: "Timesheets", to: "/app/timesheets", icon: Clock },
        { label: "Attendance", to: "/app/attendance", icon: ClipboardList },
        { label: "Care plans", to: "/app/care-plans", icon: HeartPulse },
        { label: "Messages", to: "/app/messages", icon: MessageSquare },
      ],
    },
    {
      label: "Insights",
      items: [
        { label: "Reports", to: "/app/reports", icon: BarChart3 },
        { label: "Compliance", to: "/app/compliance", icon: ShieldCheck },
        { label: "Risk alerts", to: "/app/risk-alerts", icon: AlertTriangle },
        { label: "Live activity", to: "/app/live-activity", icon: Activity },
        { label: "Alerts", to: "/app/alerts", icon: AlertTriangle },
      ],
    },
    settingsSection,
  ],

  care_coordinator: [
    {
      label: "Care",
      items: [
        home,
        { label: "Rostering", to: "/app/rostering", icon: CalendarRange },
        { label: "Open shifts", to: "/app/open-shifts", icon: Clock },
        { label: "Clients", to: "/app/clients", icon: Users },
        { label: "Care plans", to: "/app/care-plans", icon: HeartPulse },
        { label: "Care notes", to: "/app/care-notes", icon: ClipboardList },
        { label: "Medication", to: "/app/medication", icon: Stethoscope },
        { label: "Messages", to: "/app/messages", icon: MessageSquare },
      ],
    },
    settingsSection,
  ],

  support_worker: [
    {
      label: "Today",
      items: [
        home,
        { label: "My shifts", to: "/app/rostering", icon: CalendarRange },
        { label: "Care notes", to: "/app/care-notes", icon: ClipboardList },
        { label: "Timesheets", to: "/app/timesheets", icon: Clock },
        { label: "Attendance", to: "/app/attendance", icon: ClipboardList },
        { label: "Messages", to: "/app/messages", icon: MessageSquare },
      ],
    },
    settingsSection,
  ],

  billing_officer: [
    {
      label: "Finance",
      items: [
        home,
        { label: "Financial overview", to: "/app/financial-overview", icon: Wallet },
        { label: "Billing dashboard", to: "/app/billing-dashboard", icon: Receipt },
        { label: "Invoices", to: "/app/invoices", icon: FileText },
        { label: "Invoice builder", to: "/app/invoice-builder", icon: ClipboardList },
        { label: "Claims", to: "/app/finance-claims", icon: FileCheck2 },
        { label: "Claim tracking", to: "/app/claim-tracking", icon: Activity },
        { label: "Payments", to: "/app/payments", icon: CreditCard },
        { label: "Reconciliation", to: "/app/reconciliation", icon: Banknote },
        { label: "Client funding", to: "/app/client-funding", icon: Briefcase },
        { label: "Revenue reports", to: "/app/revenue-reports", icon: BarChart3 },
        { label: "Outstanding balances", to: "/app/outstanding-balances", icon: AlertTriangle },
      ],
    },
    settingsSection,
  ],

  compliance_officer: [
    {
      label: "Compliance",
      items: [
        home,
        { label: "Overview", to: "/app/compliance", icon: ShieldCheck },
        { label: "Events", to: "/app/compliance-events", icon: Activity },
        { label: "Risk alerts", to: "/app/risk-alerts", icon: AlertTriangle },
        { label: "Credentials", to: "/app/staff-credentials", icon: UserCog },
        { label: "Training", to: "/app/training-records", icon: GraduationCap },
        { label: "Expiry tracking", to: "/app/expiry-tracking", icon: Clock },
        { label: "Incidents", to: "/app/incident-register", icon: AlertTriangle },
        { label: "Investigations", to: "/app/investigations", icon: ClipboardList },
        { label: "Audit logs", to: "/app/audit-logs", icon: FileBadge },
        { label: "Policies", to: "/app/policy-tracking", icon: BookOpen },
        { label: "Corrective actions", to: "/app/corrective-actions", icon: FileCheck2 },
      ],
    },
    settingsSection,
  ],

  /* ---------------- External ---------------- */
  family: [
    {
      label: "Family portal",
      items: [
        { label: "Overview", to: "/app/family-overview", icon: LayoutDashboard },
        { label: "Visit history", to: "/app/family-visit-history", icon: CalendarRange },
        { label: "Care notes", to: "/app/family-care-notes", icon: HandHeart },
        { label: "Upcoming visits", to: "/app/family-upcoming-visits", icon: Clock },
        { label: "Documents", to: "/app/family-documents", icon: Folder },
        { label: "Invoices", to: "/app/family-invoices", icon: Receipt },
        { label: "Payments", to: "/app/family-payments", icon: CreditCard },
        { label: "Messages", to: "/app/family-messages", icon: MessageSquare },
      ],
    },
    settingsSection,
  ],

  practitioner: [
    {
      label: "Clinical",
      items: [
        { label: "Overview", to: "/app/practitioner-overview", icon: LayoutDashboard },
        { label: "Assigned clients", to: "/app/practitioner-clients", icon: Users },
        { label: "Care plans", to: "/app/practitioner-care-plans", icon: Stethoscope },
        { label: "Clinical notes", to: "/app/practitioner-clinical-notes", icon: ClipboardList },
        { label: "Reports", to: "/app/practitioner-reports", icon: BarChart3 },
        { label: "Evaluations", to: "/app/practitioner-evaluations", icon: Target },
        { label: "Messages", to: "/app/practitioner-messages", icon: MessageSquare },
      ],
    },
    settingsSection,
  ],
};
