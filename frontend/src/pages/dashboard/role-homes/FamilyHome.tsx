import React, { useState } from "react";
import {
  CalendarCheck,
  Activity,
  HandHeart,
  TrendingUp,
  MessageSquare,
  Folder,
  Receipt,
  Heart,
} from "lucide-react";
import RoleGreeting from "./RoleGreeting";
import KpiGrid from "@/components/dashboard/widgets/KpiGrid";
import AlertsWidget from "@/components/dashboard/widgets/AlertsWidget";
import QuickActions from "@/components/dashboard/widgets/QuickActions";
import ActivityFeed from "@/components/dashboard/widgets/ActivityFeed";
import WorkQueue from "@/components/dashboard/widgets/WorkQueue";
import Card from "@/components/dashboard/Card";

const FamilyHome: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  };

  return (
  <div className="space-y-8">
    <RoleGreeting
      actions={[
        { label: "Documents", variant: "secondary", icon: <Folder className="h-4 w-4" /> },
        { label: "Message care team", icon: <MessageSquare className="h-4 w-4" /> },
      ]}
    />

    {message && (
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-800">
        {message}
      </div>
    )}

    <KpiGrid
      items={[
        { label: "Visits this week", value: "14", tone: "indigo", icon: <CalendarCheck className="h-5 w-5" /> },
        { label: "Care notes", value: "12", tone: "emerald", icon: <Activity className="h-5 w-5" /> },
        { label: "New messages", value: "3", tone: "sky", icon: <HandHeart className="h-5 w-5" /> },
        { label: "Wellbeing trend", value: "Improving", tone: "emerald", icon: <TrendingUp className="h-5 w-5" />, delta: { value: "+8%", direction: "up" } },
      ]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="Eleanor's care this week"
        description="Past and upcoming visits"
        items={[
          { id: "f1", primary: "Morning visit · with Priya", secondary: "Today · 09:00 · Personal care", meta: "today", badge: { label: "Completed", tone: "emerald", dot: true } },
          { id: "f2", primary: "Physiotherapy · with Dr. Raj", secondary: "Today · 14:00 · 60 min", meta: "today", badge: { label: "Upcoming", tone: "indigo", dot: true } },
          { id: "f3", primary: "Evening medication · with James", secondary: "Today · 19:00 · 15 min", meta: "today", badge: { label: "Upcoming", tone: "indigo", dot: true } },
          { id: "f4", primary: "Morning visit · with Daniel", secondary: "Yesterday · 09:00 · Personal care", meta: "yesterday", badge: { label: "Completed", tone: "emerald", dot: true } },
        ]}
      />

      <Card title="Latest update from the team" icon={<HandHeart className="h-4 w-4" />}>
        <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-800">
            <span className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-[10px] font-bold">PR</span>
            Priya R. · 12 min ago
          </div>
          <p className="mt-3 text-sm text-slate-700 leading-relaxed">
            &ldquo;Eleanor was in great spirits today. We finished the
            physiotherapy exercises and enjoyed a walk in the garden. She ate
            well at lunch and seemed delighted with the flowers you sent.&rdquo;
          </p>
          <button
            onClick={() => notify("Reply composer opened in demo mode.")}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600"
          >
            Reply
          </button>
        </div>
      </Card>
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <QuickActions
        actions={[
          { label: "Message team", icon: <MessageSquare className="h-4 w-4" />, tone: "indigo" },
          { label: "Care plan", icon: <Heart className="h-4 w-4" />, tone: "rose" },
          { label: "Schedule", icon: <CalendarCheck className="h-4 w-4" />, tone: "sky" },
          { label: "Documents", icon: <Folder className="h-4 w-4" />, tone: "amber" },
          { label: "Billing", icon: <Receipt className="h-4 w-4" />, tone: "emerald" },
          { label: "Send thanks", icon: <HandHeart className="h-4 w-4" />, tone: "violet" },
        ]}
        columns={3}
      />

      <AlertsWidget
        className="lg:col-span-2"
        title="Notes from this week"
        alerts={[
          { id: "fa1", severity: "success", title: "Wellbeing score up to 8.4", description: "From 7.6 last month. Mobility, sleep & nutrition all improving.", meta: "this wk" },
          { id: "fa2", severity: "info", title: "Annual physio review on Friday", description: "Dr. Raj will share the updated plan with you afterwards.", cta: "View", meta: "Fri" },
          { id: "fa3", severity: "info", title: "Nov invoice has been issued", description: "$1,240 · due Dec 16.", cta: "Open invoice", meta: "Dec 16" },
        ]}
      />
    </div>

    <ActivityFeed
      title="Care log"
      description="Recent updates about Eleanor"
      items={[
        { id: "fa-a1", who: "Priya R.", what: "logged a care note · 'great spirits today'", when: "12m ago", tag: { label: "Care", tone: "indigo" } },
        { id: "fa-a2", who: "Dr. Raj", what: "scheduled physiotherapy review", when: "Yesterday", tag: { label: "Clinical", tone: "violet" } },
        { id: "fa-a3", who: "Daniel W.", what: "completed morning visit", when: "Yesterday", tag: { label: "Visit", tone: "emerald" } },
        { id: "fa-a4", who: "GRATEHCARE", what: "wellbeing score updated to 8.4", when: "2d ago", tag: { label: "Insight", tone: "sky" } },
      ]}
    />
  </div>
  );
};

export default FamilyHome;
