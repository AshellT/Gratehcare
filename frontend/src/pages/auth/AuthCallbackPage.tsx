import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { getAppHomePath } from "@/lib/appHome";
import { supabase } from "@/lib/supabase";

const AuthCallbackPage: React.FC = () => {
  const { completeOAuthCallback } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    let active = true;

    (async () => {
      if (hasHandledCallback.current) return;
      hasHandledCallback.current = true;

      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const oauthError = params.get("error_description") || params.get("error");

        if (oauthError) {
          throw new Error(oauthError);
        }

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          window.history.replaceState({}, document.title, "/auth/callback");
        } else {
          const { error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
        }

        const user = await Promise.race([
          completeOAuthCallback(),
          new Promise<never>((_, reject) =>
            window.setTimeout(
              () =>
                reject(
                  new Error(
                    "Sign-in is taking too long. Please confirm the backend is running on localhost:4000 and try again.",
                  ),
                ),
              20000,
            ),
          ),
        ]);
        if (!active) return;
        navigate(getAppHomePath(user.role), { replace: true });
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Social sign-in could not be completed.");
      }
    })();

    return () => {
      active = false;
    };
  }, [completeOAuthCallback, navigate]);

  if (error) {
    return (
      <AuthLayout
        title="Sign-in interrupted"
        subtitle="We couldn't finish connecting your account."
      >
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
        <p className="mt-8 text-sm text-slate-500 text-center">
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Back to sign in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Signing you in"
      subtitle="Completing your Google sign-in…"
    >
      <div className="flex flex-col items-center gap-3 py-8 text-sm text-slate-600">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p>One moment while we open your workspace.</p>
      </div>
    </AuthLayout>
  );
};

export default AuthCallbackPage;
