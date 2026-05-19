import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import AIInsightsWidget from "@/components/dashboard/widgets/AIInsightsWidget";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import { TrendCard } from "@/components/dashboard/widgets/TrendCard";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import {
  Activity,
  Banknote,
  Download,
  Plus,
  Receipt,
  RefreshCcw,
  Send,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import React from "react";
import RoleGreeting from "./RoleGreeting";

const BillingOfficerHome: React.FC = () => (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        {
          label: "Export",
          variant: "secondary",
          icon: <Download className="h-4 w-4" />,
        },
        { label: "New invoice", icon: <Plus className="h-4 w-4" /> },
      ]}
    />

    <KpiGrid
      items={[
        {
          label: "Outstanding A/R",
          value: "$28,420",
          tone: "amber",
          icon: <Receipt className="h-5 w-5" />,
        },
        {
          label: "Paid this month",
          value: "$142,180",
          tone: "emerald",
          icon: <Wallet className="h-5 w-5" />,
          delta: { value: "+12%", direction: "up" },
        },
        {
          label: "Claims approved",
          value: "82%",
          tone: "indigo",
          icon: <ShieldCheck className="h-5 w-5" />,
        },
        {
          label: "Avg. days to pay",
          value: "11d",
          tone: "sky",
          icon: <Activity className="h-5 w-5" />,
          delta: { value: "-3d", direction: "up" },
        },
      ]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <TrendCard
        className="lg:col-span-2"
        title="Cash collected · last 12 weeks"
        description="$142k this month · accelerating"
        data={[28, 32, 31, 36, 41, 44, 48, 52, 56, 58, 64, 71]}
        color="#10b981"
      />

      <AlertsWidget
        title="Money on the line"
        alerts={[
          {
            id: "bo1",
            severity: "critical",
            title: "Claim CL-1182 stuck > 10 days",
            description: "Allianz · $1,420.",
            cta: "Escalate to insurer",
            meta: "10d",
          },
          {
            id: "bo2",
            severity: "warning",
            title: "3 invoices overdue > 14 days",
            description: "Total $4,820. Send reminders?",
            cta: "Send reminders",
            meta: "14d+",
          },
          {
            id: "bo3",
            severity: "info",
            title: "$84k approved & ready to receipt",
            description: "Payouts arriving Friday.",
            meta: "this wk",
          },
        ]}
      />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="Claims requiring action"
        items={[
          {
            id: "c1",
            primary: "CL-2188 · Marcus Thompson",
            secondary: "Allianz · $840 · in review 4d",
            meta: "4d",
            badge: { label: "Review", tone: "amber", dot: true },
          },
          {
            id: "c2",
            primary: "CL-2186 · Henry Park",
            secondary: "Bupa · $1,180 · awaiting submission",
            meta: "1d",
            badge: { label: "Draft", tone: "indigo", dot: true },
          },
          {
            id: "c3",
            primary: "CL-2184 · Maya Krishnan",
            secondary: "NDIS · $580 · rejected (resubmit)",
            meta: "Rejected",
            badge: { label: "Rejected", tone: "rose", dot: true },
          },
          {
            id: "c4",
            primary: "CL-1182 · Eleanor Rivers",
            secondary: "Allianz · $1,420 · stuck 10d",
            meta: "10d",
            badge: { label: "Escalate", tone: "rose", dot: true },
          },
        ]}
      />

      <QuickActions
        actions={[
          {
            label: "Generate invoices",
            icon: <Plus className="h-4 w-4" />,
            tone: "indigo",
          },
          {
            label: "Send reminders",
            icon: <Send className="h-4 w-4" />,
            tone: "amber",
          },
          {
            label: "Submit claims",
            icon: <ShieldCheck className="h-4 w-4" />,
            tone: "emerald",
          },
          {
            label: "Reconcile",
            icon: <RefreshCcw className="h-4 w-4" />,
            tone: "sky",
          },
          {
            label: "Payouts",
            icon: <Banknote className="h-4 w-4" />,
            tone: "violet",
          },
          {
            label: "Export ledger",
            icon: <Download className="h-4 w-4" />,
            tone: "slate",
          },
        ]}
        columns={2}
      />
    </div>

    <ActivityFeed
      title="Money movement today"
      items={[
        {
          id: "bo-a1",
          who: "Insurer · Allianz",
          what: "approved claim CL-2189 ($1,420)",
          when: "12m ago",
          tag: { label: "Approved", tone: "emerald" },
        },
        {
          id: "bo-a2",
          who: "Family · Marcus T.",
          what: "paid invoice INV-3420 ($2,180)",
          when: "1h ago",
          tag: { label: "Paid", tone: "emerald" },
        },
        {
          id: "bo-a3",
          who: "You",
          what: "submitted 8 claims to NDIS portal",
          when: "3h ago",
          tag: { label: "Submitted", tone: "indigo" },
        },
        {
          id: "bo-a4",
          who: "Insurer · Bupa",
          what: "rejected claim CL-2184 (missing docs)",
          when: "Yesterday",
          tag: { label: "Rejected", tone: "rose" },
        },
      ]}
    />

    <AIInsightsWidget categories={["billing_anomaly", "compliance_risk"]} />
  </div>
);

export default BillingOfficerHome;
