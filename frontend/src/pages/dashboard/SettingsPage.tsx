import Badge from "@/components/dashboard/Badge";
import Card from "@/components/dashboard/Card";
import FormField from "@/components/dashboard/FormField";
import PageHeader from "@/components/dashboard/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { usersApi } from "@/lib/api/users";
import { usePlanCatalog } from "@/hooks/usePlanCatalog";
import { useSubscription } from "@/hooks/useSubscription";
import { PLAN_FEATURES } from "@/lib/plans";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  Camera,
  Check,
  CreditCard,
  HardDrive,
  Save,
  Shield,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "organization", label: "Organisation", icon: Building2 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Shield },
  { key: "billing", label: "Plan & billing", icon: CreditCard },
];

const Toggle: React.FC<{
  id?: string;
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}> = ({ id, on, onChange, label }) => (
  <button
    id={id}
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={() => onChange(!on)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
      on ? "bg-indigo-600" : "bg-slate-200"
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
    />
  </button>
);

const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const sub = useSubscription();
  const { plans } = usePlanCatalog();
  const { success, toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [active, setActive] = useState("profile");
  const [notificationPrefs, setNotificationPrefs] = useState({
    roster: true,
    claims: true,
    compliance: true,
    incidents: true,
    ai: true,
    billing: true,
    marketing: false,
  });
  const [profileName, setProfileName] = useState(user?.name ?? "");

  const handleSave = async (section: string) => {
    if (section === "Profile" && user?.id) {
      try {
        await usersApi.update(user.id, { fullName: profileName.trim() || user.name });
        updateProfile({ name: profileName.trim() || user.name });
        success(`${section} saved`, "Your profile has been updated.");
        return;
      } catch {
        toast.error("Save failed", "Could not update profile.");
        return;
      }
    }
    success(`${section} saved`, "Your changes have been applied.");
  };

  const handlePhotoSelect = async (file: File) => {
    if (!user?.id) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large", "Profile photos must be 2 MB or smaller.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Invalid format", "Use PNG, JPG, or WebP.");
      return;
    }
    setUploadingPhoto(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      });
      await usersApi.update(user.id, { avatarUrl: dataUrl });
      updateProfile({ avatarUrl: dataUrl });
      success("Photo updated", "Your profile photo has been saved.");
    } catch {
      toast.error("Upload failed", "Could not save profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Profile, organisation, notifications, security and plan."
      />

      <div className="grid lg:grid-cols-[220px_1fr] gap-6 items-start">
        {/* Sidebar nav */}
        <nav aria-label="Settings sections">
          {/* Mobile: horizontal pill tabs */}
          <div className="flex lg:hidden gap-1 overflow-x-auto pb-1 -mx-4 px-4">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  aria-selected={active === t.key}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                    active === t.key
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
          {/* Desktop: vertical list */}
          <div className="hidden lg:flex flex-col gap-0.5 rounded-2xl border border-slate-200 bg-white p-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  aria-current={active === t.key ? "page" : undefined}
                  data-testid={`settings-tab-${t.key}`}
                  className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                    active === t.key
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Animated tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            {active === "profile" && (
              <>
                <Card title="Profile photo">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handlePhotoSelect(file);
                      e.target.value = "";
                    }}
                  />
                  <div className="flex items-center gap-5">
                    <div className="relative group">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt=""
                          className="h-20 w-20 rounded-full object-cover shadow-md"
                        />
                      ) : (
                        <div
                          className="h-20 w-20 rounded-full text-white text-2xl font-bold flex items-center justify-center shadow-md"
                          style={{ background: user?.avatarColor }}
                        >
                          {user?.name
                            .split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                      )}
                      <button
                        type="button"
                        className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-wait"
                        aria-label="Change photo"
                        disabled={uploadingPhoto}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-5 w-5 text-white" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {user?.email}
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                        disabled={uploadingPhoto}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadingPhoto
                          ? "Uploading…"
                          : "Upload new photo · PNG or JPG, max 2 MB"}
                      </button>
                    </div>
                  </div>
                </Card>
                <Card
                  title="Personal details"
                  description="Your name, contact and role."
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      label="Full name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                    />
                    <FormField
                      label="Email address"
                      type="email"
                      defaultValue={user?.email}
                      required
                    />
                    <FormField
                      label="Phone"
                      type="tel"
                      defaultValue="+61 400 000 000"
                    />
                    <FormField
                      label="Job title"
                      defaultValue="Operations Manager"
                    />
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Timezone
                      </label>
                      <select className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {[
                          "Australia / Sydney",
                          "Australia / Melbourne",
                          "Australia / Perth",
                          "New Zealand / Auckland",
                          "UK / London",
                        ].map((tz) => (
                          <option key={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={() => handleSave("Profile")}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                    >
                      <Save className="h-4 w-4" /> Save profile
                    </button>
                  </div>
                </Card>
              </>
            )}

            {active === "organization" && (
              <Card
                title="Organisation details"
                description="Branding, contact and registration information."
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    label="Organisation name"
                    defaultValue={user?.organization}
                    required
                  />
                  <FormField
                    label="ABN / EIN"
                    defaultValue="12 345 678 901"
                    hint="Australian Business Number or equivalent"
                  />
                  <FormField
                    label="Contact email"
                    type="email"
                    defaultValue="hello@meridian.care"
                  />
                  <FormField
                    label="Contact phone"
                    type="tel"
                    defaultValue="+61 2 9000 0000"
                  />
                  <div className="sm:col-span-2">
                    <FormField
                      label="Address"
                      defaultValue="Level 4, 100 Care St, Sydney NSW 2000"
                    />
                  </div>
                  <FormField
                    label="Locale / language"
                    defaultValue="English (AU)"
                  />
                  <FormField
                    label="NDIS Registration number"
                    defaultValue="4050123456"
                    hint="Provider registration number from NDIS Commission"
                  />
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => handleSave("Organisation")}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                  >
                    <Save className="h-4 w-4" /> Save organisation
                  </button>
                </div>
              </Card>
            )}

            {active === "notifications" && (
              <Card
                title="Notification preferences"
                description="Choose which notifications to receive."
              >
                <ul className="divide-y divide-slate-100">
                  {[
                    {
                      key: "roster",
                      label: "Daily roster summary",
                      desc: "Every weekday morning at 7:00 AM",
                    },
                    {
                      key: "claims",
                      label: "Claim approval & rejection",
                      desc: "Real-time updates from NDIS Portal",
                    },
                    {
                      key: "compliance",
                      label: "Compliance expiry alerts",
                      desc: "30 / 14 / 7 day reminders",
                    },
                    {
                      key: "incidents",
                      label: "Incident reports",
                      desc: "When a new incident is logged",
                    },
                    {
                      key: "ai",
                      label: "AI insight alerts",
                      desc: "When GRATEHCARE AI flags a critical insight",
                    },
                    {
                      key: "billing",
                      label: "Billing & invoice emails",
                      desc: "When invoices are generated or overdue",
                    },
                    {
                      key: "marketing",
                      label: "Product updates & tips",
                      desc: "Occasional, curated product news",
                    },
                  ].map((n) => (
                    <li
                      key={n.key}
                      className="flex items-center justify-between py-3 first:pt-0"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {n.label}
                        </div>
                        <div className="text-xs text-slate-500">{n.desc}</div>
                      </div>
                      <Toggle
                        on={notificationPrefs[n.key as keyof typeof notificationPrefs]}
                        onChange={(value) =>
                          setNotificationPrefs((current) => ({
                            ...current,
                            [n.key]: value,
                          }))
                        }
                        label={n.label}
                      />
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => handleSave("Notification preferences")}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                  >
                    <Save className="h-4 w-4" /> Save preferences
                  </button>
                </div>
              </Card>
            )}

            {active === "security" && (
              <div className="space-y-4">
                <Card
                  title="Change password"
                  description="Use a strong, unique password."
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      label="Current password"
                      type="password"
                      required
                    />
                    <div />
                    <FormField
                      label="New password"
                      type="password"
                      hint="Minimum 8 characters."
                      required
                    />
                    <FormField
                      label="Confirm new password"
                      type="password"
                      required
                    />
                  </div>
                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={() => handleSave("Password")}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                    >
                      <Save className="h-4 w-4" /> Update password
                    </button>
                  </div>
                </Card>
                <Card
                  title="Two-factor authentication"
                  description="Add an extra layer of security to your account."
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Authenticator app
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Not configured — your account is less secure.
                      </p>
                    </div>
                    <Toggle
                      on={false}
                      onChange={() => {}}
                      label="Two-factor authentication"
                    />
                  </div>
                </Card>
              </div>
            )}

            {active === "billing" && (
              <div className="space-y-4">
                {sub.status === "trial" && sub.daysLeftInTrial !== null && (
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <span className="text-sm font-bold text-amber-800">
                      Trial ends in {sub.daysLeftInTrial} days
                    </span>
                    <span className="text-sm text-amber-700">
                      — add a payment method to keep access.
                    </span>
                    <button
                      onClick={() =>
                        toast({
                          tone: "info",
                          title: "Payment method form opened.",
                        })
                      }
                      className="ml-auto rounded-full bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                    >
                      Add payment
                    </button>
                  </div>
                )}
                <Card
                  title="Current plan"
                  description={`${sub.plan.name} · billed ${sub.cycle}`}
                  action={
                    <Badge
                      tone={
                        sub.status === "active"
                          ? "emerald"
                          : sub.status === "trial"
                            ? "amber"
                            : "rose"
                      }
                      dot
                    >
                      {sub.status}
                    </Badge>
                  }
                >
                  <div
                    className={`rounded-xl bg-gradient-to-br ${sub.plan.color} p-5 text-white mb-5`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest opacity-75">
                          {sub.plan.name}
                        </div>
                        <div className="mt-1 font-display text-2xl font-bold">
                          $
                          {sub.cycle === "monthly"
                            ? sub.plan.monthlyPrice
                            : sub.plan.annualPrice}
                          <span className="ml-1 text-sm font-medium opacity-80">
                            / month
                          </span>
                        </div>
                        <div className="mt-1 text-sm opacity-80">
                          Renews {sub.currentPeriodEnd} · {sub.daysLeftInPeriod}{" "}
                          days
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/app/plans")}
                        className="flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 px-4 py-2 text-sm font-bold transition-colors"
                      >
                        <TrendingUp className="h-4 w-4" /> Change plan
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4 mb-5">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Usage
                    </h4>
                    {[
                      {
                        label: "Staff seats",
                        icon: <Users className="h-4 w-4 text-slate-400" />,
                        pct: sub.staffPct,
                        detail: `${sub.seats.used} / ${sub.plan.limits.staff === "unlimited" ? "Unlimited" : sub.plan.limits.staff}`,
                      },
                      {
                        label: "Storage",
                        icon: <HardDrive className="h-4 w-4 text-slate-400" />,
                        pct: sub.storagePct,
                        detail: `${sub.storageGb.used} GB / ${sub.plan.limits.storage}`,
                      },
                    ].map((meter) => (
                      <div key={meter.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                            {meter.icon} {meter.label}
                          </div>
                          <span
                            className={`text-xs font-bold ${meter.pct >= 80 ? "text-amber-600" : "text-slate-500"}`}
                          >
                            {meter.detail}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${meter.pct}%` }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className={`h-full rounded-full ${meter.pct >= 90 ? "bg-rose-500" : meter.pct >= 75 ? "bg-amber-400" : "bg-indigo-500"}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
                      Plan highlights
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
                      {PLAN_FEATURES.filter(
                        (f) => f.highlight && f[sub.planId] !== false,
                      )
                        .slice(0, 6)
                        .map((f) => (
                          <div
                            key={f.key}
                            className="flex items-center gap-2 text-sm text-slate-700"
                          >
                            <Check className="h-4 w-4 flex-shrink-0 text-emerald-500" />{" "}
                            {f.label}
                          </div>
                        ))}
                    </div>
                    <button
                      onClick={() => navigate("/pricing")}
                      className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Compare all plans <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
                <Card
                  title="Looking to upgrade?"
                  description="See what's available on higher tiers."
                >
                  <div className="grid sm:grid-cols-3 gap-3">
                    {plans.map((plan) => {
                      const isCurrent = plan.id === sub.planId;
                      const isHigher =
                        plans.findIndex((p) => p.id === plan.id) >
                        plans.findIndex((p) => p.id === sub.planId);
                      return (
                        <div
                          key={plan.id}
                          className={`rounded-xl border-2 p-4 ${isCurrent ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}
                        >
                          <div
                            className={`text-xs font-bold uppercase tracking-widest ${plan.accentText}`}
                          >
                            {plan.name}
                          </div>
                          <div className="mt-1 font-display text-xl font-bold text-slate-900">
                            ${plan.monthlyPrice}
                            <span className="text-xs font-medium text-slate-500">
                              /mo
                            </span>
                          </div>
                          {isCurrent ? (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
                              <Check className="h-3 w-3" /> Current
                            </span>
                          ) : (
                            <button
                              onClick={() => navigate("/app/plans")}
                              className={`mt-2 flex items-center gap-1 text-xs font-bold ${isHigher ? "text-indigo-600 hover:text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
                            >
                              {isHigher ? "Upgrade" : "Downgrade"}{" "}
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card
                    title="Payment method"
                    action={
                      <button
                        onClick={() =>
                          toast({
                            tone: "info",
                            title: "Payment method editor opened.",
                          })
                        }
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Edit
                      </button>
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-14 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          Visa •••• 4242
                        </div>
                        <div className="text-xs text-slate-500">
                          Expires 09 / 2028
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      Next charge:{" "}
                      <span className="font-bold text-slate-900">
                        ${sub.plan.monthlyPrice}.00 AUD on{" "}
                        {sub.currentPeriodEnd}
                      </span>
                    </div>
                  </Card>
                  <Card title="Manage subscription">
                    <div className="space-y-2.5">
                      <button
                        onClick={() => navigate("/app/plans")}
                        className="w-full rounded-full bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
                      >
                        Manage subscription
                      </button>
                      <button
                        onClick={() =>
                          toast({
                            tone: "warning",
                            title: "Cancellation request submitted.",
                            message:
                              "Your plan remains active until end of billing period.",
                          })
                        }
                        className="w-full rounded-full border border-rose-200 bg-rose-50 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        Cancel subscription
                      </button>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SettingsPage;
