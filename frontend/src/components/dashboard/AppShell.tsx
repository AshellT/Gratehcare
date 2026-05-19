import AccessDenied from "@/components/auth/AccessDenied";
import OnboardingWizard from "@/components/dashboard/OnboardingWizard";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { useAuth } from "@/context/AuthContext";
import { canAccessPath } from "@/lib/permissions";
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

const AppShell: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const allowed = canAccessPath(user?.role, location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Accessibility: skip nav */}
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
            {allowed ? <Outlet /> : <AccessDenied />}
          </div>
        </main>
      </div>

      {/* Onboarding wizard — shows once per user */}
      <OnboardingWizard />
    </div>
  );
};

export default AppShell;
