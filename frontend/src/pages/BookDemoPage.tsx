import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { publicApi } from "@/lib/api/public";
import { usePlanCatalog } from "@/hooks/usePlanCatalog";
import { parseSignupPlan } from "@/lib/signupPlan";

const BookDemoPage: React.FC = () => {
  const [params] = useSearchParams();
  const { plans } = usePlanCatalog();
  const leadType = params.get("type") === "enterprise" ? "enterprise" : "demo";
  const planId = parseSignupPlan(params.get("plan"));
  const source = params.get("source") || undefined;

  const selectedPlan = useMemo(
    () => (planId ? plans.find((plan) => plan.id === planId) : null),
    [planId, plans],
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and work email.");
      return;
    }

    setLoading(true);
    try {
      await publicApi.createLead({
        type: leadType,
        name: name.trim(),
        email: email.trim(),
        organization: organization.trim() || undefined,
        phone: phone.trim() || undefined,
        message: message.trim() || undefined,
        planId: planId || undefined,
        source,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Could not submit your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        title="Request received"
        subtitle="Our team will reach out within one business day."
        side="right"
      >
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
            Thanks, {name.split(" ")[0] || "there"}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            We&apos;ve saved your {leadType === "enterprise" ? "enterprise enquiry" : "demo request"}
            {selectedPlan ? ` for ${selectedPlan.name}` : ""}. A GRATEHCARE specialist will contact you
            at <strong>{email}</strong>.
          </p>
        </div>
        <p className="mt-8 text-sm text-slate-500 text-center">
          Prefer to explore on your own?{" "}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Start a free trial
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={leadType === "enterprise" ? "Talk to sales" : "Book a personal demo"}
      subtitle="See how GRATEHCARE fits your care team — rostering, billing, compliance and family portals in one place."
      side="right"
    >
      {selectedPlan && (
        <div className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          Interested in <strong>{selectedPlan.name}</strong> — we&apos;ll tailor the walkthrough to that plan.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5" data-testid="book-demo-form">
        <Field label="Full name" id="demo-name" value={name} onChange={setName} placeholder="Maria Lopez" />
        <Field
          label="Work email"
          id="demo-email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@careprovider.com"
        />
        <Field
          label="Organization"
          id="demo-org"
          value={organization}
          onChange={setOrganization}
          placeholder="Meridian Home Care"
        />
        <Field
          label="Phone (optional)"
          id="demo-phone"
          value={phone}
          onChange={setPhone}
          placeholder="+61 400 000 000"
        />
        <div>
          <label htmlFor="demo-message" className="text-sm font-medium text-slate-700">
            Anything we should know?
          </label>
          <textarea
            id="demo-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Team size, NDIS billing needs, current tools…"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {leadType === "enterprise" ? "Contact sales" : "Book my demo"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-sm text-slate-500 text-center">
        Ready to start now?{" "}
        <Link
          to={planId ? `/register?plan=${planId}` : "/register"}
          className="font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Start your free trial
        </Link>
      </p>
    </AuthLayout>
  );
};

const Field: React.FC<{
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ label, id, type = "text", value, onChange, placeholder }) => (
  <div>
    <label htmlFor={id} className="text-sm font-medium text-slate-700">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

export default BookDemoPage;
