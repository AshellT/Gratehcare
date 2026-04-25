import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { ROLE_GROUPS, ROLE_LABELS, type Role } from "@/lib/roles";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("maria@meridian.care");
  const [password, setPassword] = useState("demo1234");
  const [role, setRole] = useState<Role>("org_owner");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login({ email, password, role });
      navigate("/app");
    } catch {
      setError("Could not sign you in. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Lumina workspace to continue."
    >
      <form
        onSubmit={onSubmit}
        className="space-y-5"
        data-testid="login-form"
      >
        <Field
          label="Work email"
          id="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@careprovider.com"
          testId="login-email-input"
        />

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              data-testid="login-forgot-link"
            >
              Forgot password?
            </Link>
          </div>
          <div className="mt-1.5 relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              data-testid="login-password-input"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Demo role selector */}
        <div>
          <label
            htmlFor="role"
            className="text-sm font-medium text-slate-700"
          >
            Sign in as{" "}
            <span className="text-xs font-normal text-slate-400">
              (demo workspace)
            </span>
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            data-testid="login-role-select"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            data-testid="login-error"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          data-testid="login-submit-button"
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-sm text-slate-500 text-center">
        New to Lumina?{" "}
        <Link
          to="/register"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
          data-testid="login-register-link"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
};

const Field: React.FC<{
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  testId?: string;
}> = ({ label, id, type, value, onChange, placeholder, testId }) => (
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
      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
    />
  </div>
);

export default LoginPage;
