import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AppSplash from "@/components/AppSplash";

const BOOT_MESSAGE_MAX_MS = 12_000;

/**
 * Shows a splash until auth hydration finishes (or times out) so refresh never
 * leaves users on a blank screen while Supabase / the API warms up.
 */
const AppBootGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useAuth();
  const [bootTimedOut, setBootTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      setBootTimedOut(false);
      return;
    }
    const id = window.setTimeout(() => setBootTimedOut(true), BOOT_MESSAGE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      document.getElementById("app-initial-splash")?.remove();
    }
  }, [loading]);

  const showSplash = loading && !bootTimedOut;

  if (showSplash) {
    return (
      <AppSplash
        message="Loading GRATEHCARE"
        submessage="Checking your session…"
      />
    );
  }

  return <>{children}</>;
};

export default AppBootGate;
