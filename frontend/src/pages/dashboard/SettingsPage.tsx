import React, { useState } from "react";
import { Save, User, Building2, Bell, Shield, CreditCard } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";
import { useAuth } from "@/context/AuthContext";

const tabs = [
  { key: "profile", label: "Profile", icon: User },
  { key: "organization", label: "Organization", icon: Building2 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Shield },
  { key: "billing", label: "Plan & billing", icon: CreditCard },
];

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [active, setActive] = useState("profile");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Your profile, organisation, notifications, security and plan."
        actions={[{ label: "Save changes", icon: <Save className="h-4 w-4" /> }]}
      />

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <nav className="rounded-2xl border border-slate-200 bg-white p-2 h-fit">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                data-testid={`settings-tab-${t.key}`}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active === t.key
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="space-y-6">
          {active === "profile" && (
            <Card title="Profile" description="Your account details and avatar.">
              <div className="flex items-center gap-4">
                <div
                  className="h-16 w-16 rounded-full text-white text-xl font-bold flex items-center justify-center"
                  style={{ background: user?.avatarColor }}
                >
                  {user?.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                    Upload new photo
                  </button>
                  <div className="text-xs text-slate-500 mt-1">PNG or JPG · max 2 MB</div>
                </div>
              </div>
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <Field label="Full name" defaultValue={user?.name} />
                <Field label="Email" defaultValue={user?.email} type="email" />
                <Field label="Phone" defaultValue="+61 400 000 000" />
                <Field label="Timezone" defaultValue="Australia / Sydney" />
              </div>
            </Card>
          )}

          {active === "organization" && (
            <Card title="Organization" description="Branding, contact and business details.">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Organization name" defaultValue={user?.organization} />
                <Field label="ABN / EIN" defaultValue="12 345 678 901" />
                <Field label="Contact email" defaultValue="hello@meridian.care" />
                <Field label="Contact phone" defaultValue="+61 2 9000 0000" />
                <Field label="Address" defaultValue="Level 4, 100 Care St, Sydney" />
                <Field label="Locale" defaultValue="English (AU)" />
              </div>
            </Card>
          )}

          {active === "notifications" && (
            <Card title="Notifications" description="Choose how you want to hear from Lumina.">
              <ul className="divide-y divide-slate-100">
                {[
                  { label: "Daily roster summary", desc: "Every weekday morning", on: true },
                  { label: "Claim approval & rejection", desc: "Real-time updates", on: true },
                  { label: "Compliance expiry alerts", desc: "30 / 14 / 7 day reminders", on: true },
                  { label: "Incident reports", desc: "When new incidents are logged", on: true },
                  { label: "Marketing & product updates", desc: "Occasional, never spammy", on: false },
                ].map((n) => (
                  <li key={n.label} className="flex items-center justify-between py-3 first:pt-0">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{n.label}</div>
                      <div className="text-xs text-slate-500">{n.desc}</div>
                    </div>
                    <Toggle defaultOn={n.on} />
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {active === "security" && (
            <Card title="Security" description="Password, two-factor and active sessions.">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Current password" type="password" defaultValue="••••••••" />
                <Field label="New password" type="password" />
              </div>
              <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Two-factor authentication</div>
                  <div className="text-xs text-slate-500">Protect your account with an authenticator app.</div>
                </div>
                <Toggle defaultOn={false} />
              </div>
            </Card>
          )}

          {active === "billing" && (
            <Card title="Plan & billing" description="Manage your subscription and invoices.">
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 p-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-indigo-700">
                    Current plan
                  </div>
                  <div className="font-display text-2xl font-bold text-slate-900 mt-1">
                    Growth · $129/mo
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Up to 50 staff · Lumina AI · Priority support
                  </div>
                </div>
                <button className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800">
                  Upgrade
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  defaultValue?: string;
  type?: string;
}> = ({ label, defaultValue, type = "text" }) => (
  <div>
    <label className="text-xs font-semibold text-slate-700">{label}</label>
    <input
      type={type}
      defaultValue={defaultValue}
      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

const Toggle: React.FC<{ defaultOn?: boolean }> = ({ defaultOn }) => {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        on ? "bg-indigo-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
};

export default SettingsPage;
