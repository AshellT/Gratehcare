import AccessDenied from "@/components/auth/AccessDenied";
import OnboardingWizard from "@/components/dashboard/OnboardingWizard";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import TrialBanner from "@/components/dashboard/TrialBanner";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { canAccessPath } from "@/lib/permissions";
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const AppShellInner: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const allowed = canAccessPath(user?.role, location.pathname);

  useEffect(() => {
    const onTrialExpired = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string; upgradeUrl?: string }>).detail;
      toast.error(
        "Trial ended",
        detail?.message || "Upgrade your plan to continue making changes.",
      );
      if (location.pathname !== "/app/subscription") {
        navigate(detail?.upgradeUrl || "/app/subscription");
      }
    };

    window.addEventListener("gratehcare:trial-expired", onTrialExpired);
    return () => window.removeEventListener("gratehcare:trial-expired", onTrialExpired);
  }, [toast, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main
          id="main-content"
          data-testid="app-main"
          className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 animate-page-enter"
        >
          <div className="max-w-[1600px] mx-auto">
            <TrialBanner />
            {allowed ? <Outlet /> : <AccessDenied />}
          </div>
        </main>
      </div>

      <OnboardingWizard />
    </div>
  );
};

const AppShell: React.FC = () => (
  <SubscriptionProvider>
    <AppShellInner />
  </SubscriptionProvider>
);

export default AppShell;
