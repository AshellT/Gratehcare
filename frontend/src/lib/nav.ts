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
        { label: "Schedule", to: "/app/schedule", icon: CalendarRange },
        { label: "Clients", to: "/app/clients", icon: Users },
        { label: "Care plans", to: "/app/care", icon: HeartPulse },
        { label: "Team", to: "/app/team", icon: UserCog },
        { label: "Messages", to: "/app/messages", icon: MessageSquare },
      ],
    },
    {
      label: "Finance",
      items: [
        { label: "Billing", to: "/app/billing", icon: Receipt },
        { label: "Claims", to: "/app/claims", icon: Wallet },
        { label: "Reports", to: "/app/reports", icon: BarChart3 },
      ],
    },
    {
      label: "Compliance",
      items: [
        { label: "Compliance", to: "/app/compliance", icon: ShieldCheck },
        { label: "Incidents", to: "/app/incidents", icon: AlertTriangle },
        { label: "Audits", to: "/app/audits", icon: FileBadge },
      ],
    },
    settingsSection,
  ],

  operations_admin: [
    {
      label: "Operations",
      items: [
        home,
        { label: "Schedule", to: "/app/schedule", icon: CalendarRange },
        { label: "Clients", to: "/app/clients", icon: Users },
        { label: "Care plans", to: "/app/care", icon: HeartPulse },
        { label: "Team", to: "/app/team", icon: UserCog },
        { label: "Messages", to: "/app/messages", icon: MessageSquare },
      ],
    },
    {
      label: "Insights",
      items: [
        { label: "Reports", to: "/app/reports", icon: BarChart3 },
        { label: "Compliance", to: "/app/compliance", icon: ShieldCheck },
      ],
    },
    settingsSection,
  ],

  care_coordinator: [
    {
      label: "Care",
      items: [
        home,
        { label: "Schedule", to: "/app/schedule", icon: CalendarRange },
        { label: "Clients", to: "/app/clients", icon: Users },
        { label: "Care plans", to: "/app/care", icon: HeartPulse },
        { label: "Team", to: "/app/team", icon: UserCog },
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
        { label: "My shifts", to: "/app/schedule", icon: CalendarRange },
        { label: "Care notes", to: "/app/care", icon: ClipboardList },
        { label: "Timesheets", to: "/app/timesheets", icon: Clock },
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
        { label: "Billing", to: "/app/billing", icon: Receipt },
        { label: "Claims", to: "/app/claims", icon: Wallet },
        { label: "Payouts", to: "/app/payouts", icon: Banknote },
        { label: "Reports", to: "/app/reports", icon: BarChart3 },
      ],
    },
    settingsSection,
  ],

  compliance_officer: [
    {
      label: "Compliance",
      items: [
        home,
        { label: "Credentials", to: "/app/compliance", icon: ShieldCheck },
        { label: "Incidents", to: "/app/incidents", icon: AlertTriangle },
        { label: "Audits", to: "/app/audits", icon: FileBadge },
        { label: "Policies", to: "/app/policies", icon: BookOpen },
        { label: "Training", to: "/app/training", icon: GraduationCap },
      ],
    },
    settingsSection,
  ],

  /* ---------------- External ---------------- */
  family: [
    {
      label: "Family portal",
      items: [
        home,
        { label: "Schedule", to: "/app/schedule", icon: CalendarRange },
        { label: "Updates", to: "/app/messages", icon: MessageSquare },
        { label: "Care plan", to: "/app/care", icon: HandHeart },
        { label: "Documents", to: "/app/documents", icon: Folder },
        { label: "Billing", to: "/app/family-billing", icon: Receipt },
      ],
    },
    settingsSection,
  ],

  practitioner: [
    {
      label: "Clinical",
      items: [
        home,
        { label: "Patients", to: "/app/clients", icon: Users },
        { label: "Care plans", to: "/app/care", icon: Stethoscope },
        { label: "Outcomes", to: "/app/outcomes", icon: Target },
        { label: "Schedule", to: "/app/schedule", icon: CalendarRange },
        { label: "Messages", to: "/app/messages", icon: MessageSquare },
      ],
    },
    settingsSection,
  ],
};
