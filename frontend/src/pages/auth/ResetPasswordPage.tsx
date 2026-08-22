import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, AlertCircle, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { authApi } from "@/lib/api/auth";

const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => params.get("token") || "", [params]);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRules = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "1 uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "1 number", ok: /\d/.test(password) },
  ];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("This reset link is missing a token. Request a new one.");
      return;
    }
    if (!passwordRules.every((r) => r.ok)) {
      setError("Your password doesn't meet the requirements.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(token, password);
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Could not reset your password. Request a new link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Use at least 8 characters, with one uppercase letter and one number."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            New password
          </label>
          <div className="mt-1.5 relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                className={`flex items-center gap-1.5 ${r.ok ? "text-emerald-600" : "text-slate-400"}`}
              >
                <Check className="h-3 w-3" strokeWidth={3} />
                {r.label}
              </li>
            ))}
          </ul>
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
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Save password <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
      <p className="mt-8 text-sm text-slate-500 text-center">
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
