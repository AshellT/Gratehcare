import React from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Receipt,
  Activity,
  Users,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  Building2,
  Sparkles,
  HeartPulse,
  Stethoscope,
  ArrowRight,
  TrendingUp,
  HandHeart,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import Card from "@/components/dashboard/Card";
import Badge from "@/components/dashboard/Badge";
import PageHeader from "@/components/dashboard/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/roles";

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;
  const firstName = user.name.split(" ")[0];

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={ROLE_LABELS[user.role]}
        title={`${greeting}, ${firstName}.`}
        description={ROLE_DESCRIPTIONS[user.role]}
        actions={[
          { label: "View reports", variant: "secondary" },
          { label: "Quick actions", icon: <Sparkles className="h-4 w-4" /> },
        ]}
      />

      <RoleHome role={user.role} />
    </div>
  );
};

const RoleHome: React.FC<{ role: string }> = ({ role }) => {
  switch (role) {
    case "platform_owner":
      return <PlatformOwnerHome />;
    case "super_admin":
      return <SuperAdminHome />;
    case "platform_support":
      return <PlatformSupportHome />;
    case "org_owner":
    case "operations_admin":
      return <OrgOwnerHome />;
    case "care_coordinator":
      return <CoordinatorHome />;
    case "support_worker":
      return <SupportWorkerHome />;
    case "billing_officer":
      return <BillingHome />;
    case "compliance_officer":
      return <ComplianceHome />;
    case "family":
      return <FamilyHome />;
    case "practitioner":
      return <PractitionerHome />;
    default:
      return <OrgOwnerHome />;
  }
};

/* ------------------- Helpers ------------------- */

const StatGrid: React.FC<{
  stats: { label: string; value: string; tone: any; icon: React.ReactNode; delta?: any }[];
}> = ({ stats }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {stats.map((s, i) => (
      <StatCard key={s.label} {...s} index={i} />
    ))}
  </div>
);

const SimpleList: React.FC<{
  items: { primary: string; secondary?: string; right?: React.ReactNode }[];
}> = ({ items }) => (
  <ul className="divide-y divide-slate-100">
    {items.map((it, i) => (
      <li key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-800 truncate">{it.primary}</div>
          {it.secondary && (
            <div className="text-xs text-slate-500 mt-0.5">{it.secondary}</div>
          )}
        </div>
        {it.right}
      </li>
    ))}
  </ul>
);

/* ------------------- Role-specific homes ------------------- */

const OrgOwnerHome: React.FC = () => (
  <>
    <StatGrid
      stats={[
        { label: "Active clients", value: "184", tone: "indigo", icon: <Users className="h-5 w-5" />, delta: { value: "+8 this mo", direction: "up" } },
        { label: "Roster fill rate", value: "98%", tone: "emerald", icon: <CalendarCheck className="h-5 w-5" />, delta: { value: "+4%", direction: "up" } },
        { label: "Outstanding invoices", value: "$28,420", tone: "amber", icon: <Receipt className="h-5 w-5" />, delta: { value: "-12%", direction: "down" } },
        { label: "Compliance score", value: "96%", tone: "sky", icon: <ShieldCheck className="h-5 w-5" />, delta: { value: "Stable", direction: "neutral" } },
      ]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <Card title="Today's overview" description="Live ops status across your organisation" className="lg:col-span-2">
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <MiniStat label="Shifts today" value="86" sub="12 unfilled" tone="indigo" />
          <MiniStat label="Care notes logged" value="316" sub="98% on time" tone="emerald" />
          <MiniStat label="Open incidents" value="3" sub="0 critical" tone="amber" />
        </div>
        <RevenueChart />
      </Card>

      <Card title="AI insights" description="What needs your attention" icon={<Sparkles className="h-4 w-4" />}>
        <div className="space-y-3">
          {[
            { tone: "amber", text: "3 night shifts at risk next week — auto-suggest fill?" },
            { tone: "rose", text: "Claim CL-1182 stuck >10 days. Escalate to insurer?" },
            { tone: "indigo", text: "Client churn risk for Marcus T. — schedule follow-up?" },
          ].map((i) => (
            <button
              key={i.text}
              className="w-full text-left rounded-xl border border-slate-200 p-3 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className={`mt-1 h-1.5 w-1.5 rounded-full bg-${i.tone}-500 flex-shrink-0`} />
                <div className="text-xs text-slate-700 leading-relaxed">{i.text}</div>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Recent activity" description="Across your team">
        <SimpleList
          items={[
            { primary: "Eleanor R. care plan updated", secondary: "by Priya · 12 min ago", right: <Badge tone="indigo">Care</Badge> },
            { primary: "Invoice INV-3421 paid", secondary: "$1,240 · 1h ago", right: <Badge tone="emerald" dot>Paid</Badge> },
            { primary: "New incident logged", secondary: "Slip & fall · Marcus T. · 3h ago", right: <Badge tone="amber" dot>Open</Badge> },
            { primary: "James M. police check renewed", secondary: "Valid until 2027 · Yesterday", right: <Badge tone="emerald" dot>Valid</Badge> },
          ]}
        />
      </Card>

      <Card title="Top performers this month">
        <SimpleList
          items={[
            { primary: "Priya Raman", secondary: "98 visits · 4.9★ avg", right: <span className="text-xs font-bold text-emerald-700">+18%</span> },
            { primary: "Daniel Wu", secondary: "84 visits · 4.8★ avg", right: <span className="text-xs font-bold text-emerald-700">+12%</span> },
            { primary: "Sara Hill", secondary: "76 visits · 4.9★ avg", right: <span className="text-xs font-bold text-emerald-700">+9%</span> },
            { primary: "Tom Reed", secondary: "71 visits · 4.7★ avg", right: <span className="text-xs font-bold text-slate-500">+2%</span> },
          ]}
        />
      </Card>
    </div>
  </>
);

const CoordinatorHome: React.FC = () => (
  <>
    <StatGrid
      stats={[
        { label: "Shifts today", value: "86", tone: "indigo", icon: <CalendarCheck className="h-5 w-5" /> },
        { label: "Unfilled", value: "12", tone: "amber", icon: <AlertTriangle className="h-5 w-5" />, delta: { value: "Action needed", direction: "down" } },
        { label: "Active clients", value: "184", tone: "sky", icon: <Users className="h-5 w-5" /> },
        { label: "Care plans due", value: "7", tone: "rose", icon: <HeartPulse className="h-5 w-5" /> },
      ]}
    />
    <div className="grid lg:grid-cols-3 gap-6">
      <Card title="Today's schedule" className="lg:col-span-2" description="Live shift status">
        <ShiftListMock />
      </Card>
      <Card title="Unfilled shifts" description="Auto-suggest available">
        <SimpleList
          items={[
            { primary: "Night · 22:00–06:00", secondary: "Eleanor R.", right: <Badge tone="amber" dot>Open</Badge> },
            { primary: "Morning · 07:00–11:00", secondary: "Marcus T.", right: <Badge tone="rose" dot>Urgent</Badge> },
            { primary: "Evening · 17:00–21:00", secondary: "Alana W.", right: <Badge tone="amber" dot>Open</Badge> },
            { primary: "Day · 09:00–13:00", secondary: "Henry P.", right: <Badge tone="amber" dot>Open</Badge> },
          ]}
        />
      </Card>
    </div>
  </>
);

const SupportWorkerHome: React.FC = () => (
  <>
    <StatGrid
      stats={[
        { label: "My shifts today", value: "4", tone: "indigo", icon: <CalendarCheck className="h-5 w-5" /> },
        { label: "Care notes due", value: "2", tone: "amber", icon: <Activity className="h-5 w-5" /> },
        { label: "Hours this week", value: "32h", tone: "emerald", icon: <TrendingUp className="h-5 w-5" /> },
        { label: "Messages", value: "5", tone: "sky", icon: <Sparkles className="h-5 w-5" /> },
      ]}
    />
    <div className="grid lg:grid-cols-3 gap-6">
      <Card title="My shifts today" className="lg:col-span-2">
        <ShiftListMock myShifts />
      </Card>
      <Card title="Quick actions">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Clock in", tone: "bg-emerald-50 text-emerald-700" },
            { label: "Care note", tone: "bg-indigo-50 text-indigo-700" },
            { label: "Incident", tone: "bg-rose-50 text-rose-700" },
            { label: "Kilometres", tone: "bg-sky-50 text-sky-700" },
          ].map((a) => (
            <button
              key={a.label}
              className={`rounded-xl ${a.tone} p-4 text-sm font-semibold hover:opacity-90 transition`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  </>
);

const BillingHome: React.FC = () => (
  <>
    <StatGrid
      stats={[
        { label: "Outstanding", value: "$28,420", tone: "amber", icon: <Receipt className="h-5 w-5" /> },
        { label: "Paid this month", value: "$142,180", tone: "emerald", icon: <Wallet className="h-5 w-5" />, delta: { value: "+12%", direction: "up" } },
        { label: "Claims approved", value: "82%", tone: "indigo", icon: <ShieldCheck className="h-5 w-5" /> },
        { label: "Avg. days to pay", value: "11d", tone: "sky", icon: <Activity className="h-5 w-5" />, delta: { value: "-3d", direction: "up" } },
      ]}
    />
    <div className="grid lg:grid-cols-3 gap-6">
      <Card title="Claims pipeline" className="lg:col-span-2" description="Track every claim from submission to deposit">
        <ClaimsPipelineMock />
      </Card>
      <Card title="Recent invoices">
        <SimpleList
          items={[
            { primary: "INV-3421 · Eleanor R.", secondary: "$1,240 · Due in 5d", right: <Badge tone="emerald" dot>Paid</Badge> },
            { primary: "INV-3420 · Marcus T.", secondary: "$2,180 · Due today", right: <Badge tone="amber" dot>Pending</Badge> },
            { primary: "INV-3419 · Alana W.", secondary: "$840 · Overdue 2d", right: <Badge tone="rose" dot>Overdue</Badge> },
            { primary: "INV-3418 · Henry P.", secondary: "$1,560 · Paid", right: <Badge tone="emerald" dot>Paid</Badge> },
          ]}
        />
      </Card>
    </div>
  </>
);

const ComplianceHome: React.FC = () => (
  <>
    <StatGrid
      stats={[
        { label: "Compliance score", value: "96%", tone: "emerald", icon: <ShieldCheck className="h-5 w-5" /> },
        { label: "Expiring < 30d", value: "8", tone: "amber", icon: <AlertTriangle className="h-5 w-5" /> },
        { label: "Open incidents", value: "3", tone: "rose", icon: <AlertTriangle className="h-5 w-5" /> },
        { label: "Audit-ready", value: "Yes", tone: "indigo", icon: <ShieldCheck className="h-5 w-5" /> },
      ]}
    />
    <div className="grid lg:grid-cols-3 gap-6">
      <Card title="Expiring credentials" className="lg:col-span-2" description="Address before they lapse">
        <SimpleList
          items={[
            { primary: "James M. · First aid", secondary: "Expires in 4 days", right: <Badge tone="rose" dot>Critical</Badge> },
            { primary: "Priya R. · Police check", secondary: "Expires in 12 days", right: <Badge tone="amber" dot>Soon</Badge> },
            { primary: "Daniel W. · Vehicle insurance", secondary: "Expires in 21 days", right: <Badge tone="amber" dot>Soon</Badge> },
            { primary: "Sara H. · NDIS clearance", secondary: "Expires in 28 days", right: <Badge tone="amber" dot>Soon</Badge> },
          ]}
        />
      </Card>
      <Card title="Open incidents" description="By severity">
        <SimpleList
          items={[
            { primary: "Slip & fall · Marcus T.", secondary: "Reported 3h ago", right: <Badge tone="rose" dot>High</Badge> },
            { primary: "Medication error · Eleanor R.", secondary: "Reported yesterday", right: <Badge tone="amber" dot>Med</Badge> },
            { primary: "Property damage · Office", secondary: "Reported 2d ago", right: <Badge tone="slate" dot>Low</Badge> },
          ]}
        />
      </Card>
    </div>
  </>
);

const FamilyHome: React.FC = () => (
  <>
    <StatGrid
      stats={[
        { label: "Visits this week", value: "14", tone: "indigo", icon: <CalendarCheck className="h-5 w-5" /> },
        { label: "Care notes", value: "12", tone: "emerald", icon: <Activity className="h-5 w-5" /> },
        { label: "New messages", value: "3", tone: "sky", icon: <HandHeart className="h-5 w-5" /> },
        { label: "Wellbeing trend", value: "Improving", tone: "emerald", icon: <TrendingUp className="h-5 w-5" />, delta: { value: "+8%", direction: "up" } },
      ]}
    />
    <div className="grid lg:grid-cols-3 gap-6">
      <Card title="Eleanor's care this week" className="lg:col-span-2">
        <SimpleList
          items={[
            { primary: "Morning visit", secondary: "Today · 09:00 with Priya", right: <Badge tone="emerald" dot>Completed</Badge> },
            { primary: "Physiotherapy", secondary: "Today · 14:00 with Dr. Raj", right: <Badge tone="indigo" dot>Upcoming</Badge> },
            { primary: "Evening medication", secondary: "Today · 19:00 with James", right: <Badge tone="indigo" dot>Upcoming</Badge> },
            { primary: "Morning visit", secondary: "Yesterday · 09:00 with Daniel", right: <Badge tone="emerald" dot>Completed</Badge> },
          ]}
        />
      </Card>
      <Card title="Latest update" description="From the care team" icon={<HandHeart className="h-4 w-4" />}>
        <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-4">
          <div className="text-xs font-semibold text-indigo-800">
            From Priya R. · 12 min ago
          </div>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            &ldquo;Eleanor was in great spirits today. We finished the
            physiotherapy exercises and enjoyed a walk in the garden. She ate
            well at lunch.&rdquo;
          </p>
        </div>
      </Card>
    </div>
  </>
);

const PractitionerHome: React.FC = () => (
  <>
    <StatGrid
      stats={[
        { label: "Active patients", value: "42", tone: "indigo", icon: <Users className="h-5 w-5" /> },
        { label: "Plans due review", value: "6", tone: "amber", icon: <Stethoscope className="h-5 w-5" /> },
        { label: "Sessions this week", value: "18", tone: "emerald", icon: <CalendarCheck className="h-5 w-5" /> },
        { label: "Outcomes met", value: "87%", tone: "sky", icon: <Activity className="h-5 w-5" />, delta: { value: "+5%", direction: "up" } },
      ]}
    />
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Care plans due review" description="Overdue first">
        <SimpleList
          items={[
            { primary: "Eleanor R.", secondary: "Last review 92 days ago", right: <Badge tone="rose" dot>Overdue</Badge> },
            { primary: "Marcus T.", secondary: "Last review 64 days ago", right: <Badge tone="amber" dot>Soon</Badge> },
            { primary: "Alana W.", secondary: "Last review 41 days ago", right: <Badge tone="indigo" dot>Upcoming</Badge> },
          ]}
        />
      </Card>
      <Card title="This week's sessions">
        <ShiftListMock practitioner />
      </Card>
    </div>
  </>
);

const PlatformOwnerHome: React.FC = () => (
  <>
    <StatGrid
      stats={[
        { label: "Tenants", value: "1,284", tone: "indigo", icon: <Building2 className="h-5 w-5" />, delta: { value: "+42 this mo", direction: "up" } },
        { label: "MRR", value: "$284,910", tone: "emerald", icon: <Wallet className="h-5 w-5" />, delta: { value: "+12%", direction: "up" } },
        { label: "Active users", value: "18,420", tone: "sky", icon: <Users className="h-5 w-5" /> },
        { label: "NRR", value: "118%", tone: "amber", icon: <TrendingUp className="h-5 w-5" />, delta: { value: "+3%", direction: "up" } },
      ]}
    />
    <div className="grid lg:grid-cols-3 gap-6">
      <Card title="Revenue trend" className="lg:col-span-2" description="Last 12 months">
        <RevenueChart tall />
      </Card>
      <Card title="Top tenants" description="By usage this month">
        <SimpleList
          items={[
            { primary: "Meridian Home Care", secondary: "184 staff · $4,820/mo", right: <span className="text-xs font-bold text-emerald-700">+18%</span> },
            { primary: "Aurora Disability", secondary: "142 staff · $3,640/mo", right: <span className="text-xs font-bold text-emerald-700">+12%</span> },
            { primary: "Northwind Care", secondary: "98 staff · $2,420/mo", right: <span className="text-xs font-bold text-emerald-700">+9%</span> },
            { primary: "Brightpath", secondary: "76 staff · $1,920/mo", right: <span className="text-xs font-bold text-emerald-700">+6%</span> },
          ]}
        />
      </Card>
    </div>
  </>
);

const SuperAdminHome: React.FC = () => (
  <>
    <StatGrid
      stats={[
        { label: "Tenants", value: "1,284", tone: "indigo", icon: <Building2 className="h-5 w-5" /> },
        { label: "Users", value: "18,420", tone: "sky", icon: <Users className="h-5 w-5" /> },
        { label: "API uptime", value: "99.99%", tone: "emerald", icon: <Activity className="h-5 w-5" /> },
        { label: "Open issues", value: "4", tone: "amber", icon: <AlertTriangle className="h-5 w-5" /> },
      ]}
    />
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Recent system activity">
        <SimpleList
          items={[
            { primary: "Tenant created · Brightpath", secondary: "By system · 12 min ago", right: <Badge tone="emerald" dot>OK</Badge> },
            { primary: "Role permissions updated", secondary: "Meridian · 1h ago", right: <Badge tone="indigo">Audit</Badge> },
            { primary: "Webhook failed · stripe.charge", secondary: "Aurora · 3h ago", right: <Badge tone="amber" dot>Retry</Badge> },
            { primary: "DB migration completed", secondary: "v2024.12.04 · Yesterday", right: <Badge tone="emerald" dot>Done</Badge> },
          ]}
        />
      </Card>
      <Card title="Service health">
        <div className="space-y-3">
          {[
            { label: "API gateway", status: "Operational", tone: "emerald", uptime: "99.99%" },
            { label: "MongoDB cluster", status: "Operational", tone: "emerald", uptime: "100%" },
            { label: "Background jobs", status: "Degraded", tone: "amber", uptime: "98.6%" },
            { label: "Email delivery", status: "Operational", tone: "emerald", uptime: "99.97%" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    s.tone === "emerald" ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="text-sm font-semibold text-slate-800">
                  {s.label}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {s.status} · {s.uptime}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </>
);

const PlatformSupportHome: React.FC = () => (
  <>
    <StatGrid
      stats={[
        { label: "Open tickets", value: "32", tone: "amber", icon: <AlertTriangle className="h-5 w-5" /> },
        { label: "Resolved today", value: "18", tone: "emerald", icon: <ShieldCheck className="h-5 w-5" /> },
        { label: "Avg. response", value: "12m", tone: "indigo", icon: <Activity className="h-5 w-5" /> },
        { label: "CSAT", value: "4.8/5", tone: "sky", icon: <Sparkles className="h-5 w-5" /> },
      ]}
    />
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="High priority tickets">
        <SimpleList
          items={[
            { primary: "#TK-2841 · Login failing for Aurora staff", secondary: "Reported 5m ago", right: <Badge tone="rose" dot>P0</Badge> },
            { primary: "#TK-2840 · Claim export missing", secondary: "Reported 22m ago", right: <Badge tone="amber" dot>P1</Badge> },
            { primary: "#TK-2839 · Schedule sync delay", secondary: "Reported 1h ago", right: <Badge tone="amber" dot>P1</Badge> },
            { primary: "#TK-2838 · UI glitch on mobile", secondary: "Reported 2h ago", right: <Badge tone="slate" dot>P3</Badge> },
          ]}
        />
      </Card>
      <Card title="Recent tenant activity">
        <SimpleList
          items={[
            { primary: "Meridian → Schedule rebuilt", secondary: "10 min ago", right: <ArrowRight className="h-4 w-4 text-slate-400" /> },
            { primary: "Aurora → Bulk import", secondary: "1h ago", right: <ArrowRight className="h-4 w-4 text-slate-400" /> },
            { primary: "Brightpath → Permissions changed", secondary: "3h ago", right: <ArrowRight className="h-4 w-4 text-slate-400" /> },
          ]}
        />
      </Card>
    </div>
  </>
);

/* ------------------- Mocks ------------------- */

const MiniStat: React.FC<{
  label: string;
  value: string;
  sub: string;
  tone: "indigo" | "emerald" | "amber";
}> = ({ label, value, sub, tone }) => {
  const tones: Record<string, string> = {
    indigo: "from-indigo-50 to-indigo-100/50",
    emerald: "from-emerald-50 to-emerald-100/50",
    amber: "from-amber-50 to-amber-100/50",
  };
  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${tones[tone]} border border-slate-200/60 p-4`}
    >
      <div className="font-display text-2xl font-bold text-slate-900">
        {value}
      </div>
      <div className="text-xs font-semibold text-slate-700">{label}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>
    </div>
  );
};

const RevenueChart: React.FC<{ tall?: boolean }> = ({ tall }) => {
  const data = [42, 48, 55, 51, 62, 68, 72, 70, 78, 82, 88, 94];
  const max = Math.max(...data);
  return (
    <div className={`relative ${tall ? "h-64" : "h-44"} w-full`}>
      <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 50, 100, 150].map((y) => (
          <line key={y} x1="0" x2="600" y1={y + 10} y2={y + 10} stroke="#f1f5f9" />
        ))}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          d={`M ${data
            .map((v, i) => `${(i / (data.length - 1)) * 600} ${190 - (v / max) * 170}`)
            .join(" L ")}`}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d={`M 0 190 L ${data
            .map((v, i) => `${(i / (data.length - 1)) * 600} ${190 - (v / max) * 170}`)
            .join(" L ")} L 600 190 Z`}
          fill="url(#revGrad)"
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] font-semibold text-slate-400 px-1">
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
};

const ShiftListMock: React.FC<{ myShifts?: boolean; practitioner?: boolean }> = ({ myShifts, practitioner }) => {
  const shifts = myShifts
    ? [
        { time: "09:00 – 11:00", client: "Eleanor R.", type: "Morning visit", color: "bg-indigo-500" },
        { time: "12:30 – 14:00", client: "Marcus T.", type: "Lunch & meds", color: "bg-sky-500" },
        { time: "15:00 – 17:00", client: "Alana W.", type: "Therapy", color: "bg-emerald-500" },
        { time: "19:00 – 21:00", client: "Henry P.", type: "Evening care", color: "bg-rose-500" },
      ]
    : practitioner
      ? [
          { time: "Mon · 10:00", client: "Eleanor R.", type: "Physio review", color: "bg-teal-500" },
          { time: "Tue · 14:00", client: "Marcus T.", type: "OT session", color: "bg-indigo-500" },
          { time: "Wed · 11:00", client: "Alana W.", type: "Speech therapy", color: "bg-sky-500" },
          { time: "Fri · 09:00", client: "Henry P.", type: "Annual review", color: "bg-amber-500" },
        ]
      : [
          { time: "09:00", client: "Eleanor R.", type: "Priya · Morning visit", color: "bg-indigo-500" },
          { time: "10:30", client: "Marcus T.", type: "Daniel · Therapy", color: "bg-sky-500" },
          { time: "12:00", client: "Alana W.", type: "James · Lunch", color: "bg-emerald-500" },
          { time: "14:00", client: "Henry P.", type: "Sara · Companionship", color: "bg-rose-500" },
          { time: "16:00", client: "Maya K.", type: "Tom · Evening care", color: "bg-amber-500" },
        ];
  return (
    <ul className="divide-y divide-slate-100">
      {shifts.map((s) => (
        <li key={s.time + s.client} className="flex items-center justify-between py-3 first:pt-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`h-9 w-9 rounded-xl ${s.color} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
              {s.client[0]}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{s.client}</div>
              <div className="text-xs text-slate-500 truncate">{s.type}</div>
            </div>
          </div>
          <span className="text-xs font-semibold bg-slate-100 text-slate-700 rounded-full px-2 py-1 flex-shrink-0">
            {s.time}
          </span>
        </li>
      ))}
    </ul>
  );
};

const ClaimsPipelineMock: React.FC = () => {
  const stages = [
    { label: "Submitted", count: 24, value: "$48,200", tone: "indigo" },
    { label: "In review", count: 12, value: "$22,640", tone: "amber" },
    { label: "Approved", count: 38, value: "$84,180", tone: "emerald" },
    { label: "Paid", count: 142, value: "$312,420", tone: "sky" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stages.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-slate-200 p-4 hover:border-indigo-300 transition-colors"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {s.label}
          </div>
          <div className="font-display text-2xl font-bold text-slate-900 mt-1">
            {s.count}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{s.value}</div>
          <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                s.tone === "indigo"
                  ? "bg-indigo-500"
                  : s.tone === "amber"
                    ? "bg-amber-500"
                    : s.tone === "emerald"
                      ? "bg-emerald-500"
                      : "bg-sky-500"
              }`}
              style={{ width: `${20 + s.count}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardHome;
