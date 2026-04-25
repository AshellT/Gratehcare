import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Eye, EyeOff, Check, AlertCircle, MailCheck } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { ROLE_GROUPS, ROLE_LABELS, type Role } from "@/lib/roles";

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState<Role>("org_owner");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const passwordRules = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "1 uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "1 number", ok: /\d/.test(password) },
  ];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password || !organization) {
      setError("Please complete all fields.");
      return;
    }
    if (!passwordRules.every((r) => r.ok)) {
      setError("Your password doesn't meet the requirements.");
      return;
    }
    setLoading(true);
    try {
      const u = await register({ name, email, password, role, organization });
      if (u) {
        navigate("/app");
      } else {
        // Email confirmation required
        setEmailSent(true);
      }
    } catch (err: any) {
      setError(err?.message || "Sign up failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="We've sent a confirmation link to verify your email."
        side="right"
      >
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <MailCheck className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
            Verify your email
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            We've emailed <strong>{email}</strong> a confirmation link. Click it
            to activate your account, then sign in.
          </p>
        </div>
        <p className="mt-8 text-sm text-slate-500 text-center">
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Back to sign in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Start your free trial"
      subtitle="14 days. No credit card. Cancel any time."
      side="right"
    >
      <form
        onSubmit={onSubmit}
        className="space-y-5"
        data-testid="register-form"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Full name"
            id="name"
            value={name}
            onChange={setName}
            placeholder="Maria Lopez"
            testId="register-name-input"
          />
          <Field
            label="Organization"
            id="organization"
            value={organization}
            onChange={setOrganization}
            placeholder="Meridian Home Care"
            testId="register-org-input"
          />
        </div>

        <Field
          label="Work email"
          id="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@careprovider.com"
          testId="register-email-input"
        />

        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="mt-1.5 relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password"
              data-testid="register-password-input"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <ul className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
            {passwordRules.map((r) => (
              <li
                key={r.label}
                className={`flex items-center gap-1.5 ${
                  r.ok ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
                {r.label}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label htmlFor="role" className="text-sm font-medium text-slate-700">
            Your role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            data-testid="register-role-select"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ROLE_GROUPS.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.roles.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {error && (
          <div
            data-testid="register-error"
            className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          data-testid="register-submit-button"
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        <p className="text-[11px] text-slate-500 text-center leading-relaxed">
          By creating an account you agree to Lumina&apos;s{" "}
          <a className="underline hover:text-slate-700" href="#">
            Terms
          </a>{" "}
          and{" "}
          <a className="underline hover:text-slate-700" href="#">
            Privacy Policy
          </a>
          .
        </p>
      </form>

      <p className="mt-8 text-sm text-slate-500 text-center">
        Already on Lumina?{" "}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
          data-testid="register-login-link"
        >
          Sign in
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
  testId?: string;
}> = ({ label, id, type = "text", value, onChange, placeholder, testId }) => (
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
      data-testid={testId}
      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

export default RegisterPage;
