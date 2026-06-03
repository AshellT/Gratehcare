import React from "react";

type AppSplashProps = {
  message?: string;
  submessage?: string;
};

/** Full-screen branded loader shown while the app bundle or auth session hydrates. */
const AppSplash: React.FC<AppSplashProps> = ({
  message = "Loading GRATEHCARE",
  submessage = "Preparing your workspace…",
}) => (
  <div
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white text-slate-900"
    role="status"
    aria-live="polite"
    aria-busy="true"
    data-testid="app-splash"
  >
    <div className="flex flex-col items-center gap-6 px-6 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div
          className="absolute inset-0 rounded-2xl bg-indigo-600/10 animate-pulse"
          aria-hidden
        />
        <div
          className="h-12 w-12 rounded-2xl border-[3px] border-indigo-600 border-t-transparent animate-spin"
          aria-hidden
        />
        <span className="absolute font-display text-sm font-bold text-indigo-700">
          GC
        </span>
      </div>
      <div className="space-y-2">
        <p className="font-display text-lg font-bold tracking-tight text-slate-900">
          {message}
        </p>
        <p className="text-sm text-slate-500">{submessage}</p>
      </div>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-100">
        <div className="app-splash-bar h-full rounded-full bg-indigo-600" />
      </div>
    </div>
  </div>
);

export default AppSplash;
