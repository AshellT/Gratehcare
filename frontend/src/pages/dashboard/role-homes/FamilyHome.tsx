import React, { useState } from "react";
import { formatCurrency, useRoleHomeData } from "@/hooks/useRoleHomeData";
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
      items={[]}
    />

    <div className="grid lg:grid-cols-3 gap-6">
      <WorkQueue
        className="lg:col-span-2"
        title="Eleanor's care this week"
        description="Past and upcoming visits"
        items={[]}
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
        alerts={[]}
      />
    </div>

    <ActivityFeed
      title="Care log"
      description="Recent updates about Eleanor"
      items={[]}
    />
  </div>
  );
};

export default FamilyHome;
