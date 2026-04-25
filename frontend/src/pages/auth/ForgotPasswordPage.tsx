import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MailCheck } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email associated with your account and we'll send a reset link."
    >
      {!sent ? (
        <form
          onSubmit={onSubmit}
          className="space-y-5"
          data-testid="forgot-form"
        >
          <div>
            <label className="text-sm font-medium text-slate-700">Work email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@careprovider.com"
              data-testid="forgot-email-input"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            data-testid="forgot-submit-button"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-all"
          >
            Send reset link
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <div
          data-testid="forgot-success"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
        >
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <MailCheck className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
            Check your inbox
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            If an account exists for <strong>{email}</strong>, you&apos;ll
            receive an email with a link to reset your password.
          </p>
        </div>
      )}

      <p className="mt-8 text-sm text-slate-500 text-center">
        Remembered it?{" "}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
          data-testid="forgot-login-link"
        >
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
