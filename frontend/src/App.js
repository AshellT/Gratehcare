import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppShell from "@/components/dashboard/AppShell";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import SchedulePage from "@/pages/dashboard/SchedulePage";
import ClientsPage from "@/pages/dashboard/ClientsPage";
import CarePage from "@/pages/dashboard/CarePage";
import MessagesPage from "@/pages/dashboard/MessagesPage";
import BillingPage from "@/pages/dashboard/BillingPage";
import ClaimsPage from "@/pages/dashboard/ClaimsPage";
import ReportsPage from "@/pages/dashboard/ReportsPage";
import CompliancePage from "@/pages/dashboard/CompliancePage";
import IncidentsPage from "@/pages/dashboard/IncidentsPage";
import AuditsPage from "@/pages/dashboard/AuditsPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import TenantsPage from "@/pages/dashboard/TenantsPage";
import UsersPage from "@/pages/dashboard/UsersPage";
import TicketsPage from "@/pages/dashboard/TicketsPage";
import ActivityPage from "@/pages/dashboard/ActivityPage";
import NetworkPage from "@/pages/dashboard/NetworkPage";
import RevenuePage from "@/pages/dashboard/RevenuePage";
import PlaceholderPage from "@/pages/dashboard/PlaceholderPage";

function App() {
  return (
    <div className="App bg-white text-slate-900">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected app */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="care" element={<CarePage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="claims" element={<ClaimsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="compliance" element={<CompliancePage />} />
              <Route path="incidents" element={<IncidentsPage />} />
              <Route path="audits" element={<AuditsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="tenants" element={<TenantsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="network" element={<NetworkPage />} />
              <Route path="revenue" element={<RevenuePage />} />

              {/* Placeholder routes for new sidebar items */}
              <Route path="plans" element={<PlaceholderPage eyebrow="Platform" title="Plans & pricing" description="Manage Lumina subscription tiers and feature gating." />} />
              <Route path="integrations" element={<PlaceholderPage eyebrow="Platform" title="Integrations" description="Stripe, NDIS, single sign-on and more." />} />
              <Route path="permissions" element={<PlaceholderPage eyebrow="System" title="Roles & permissions" description="Configure granular access for every role and tenant." />} />
              <Route path="system" element={<PlaceholderPage eyebrow="System" title="System health" description="Live status across infrastructure and services." />} />
              <Route path="knowledge" element={<PlaceholderPage eyebrow="Support" title="Knowledge base" description="Macros, articles and runbooks for support agents." />} />
              <Route path="team" element={<PlaceholderPage eyebrow="Workspace" title="Team" description="Staff directory, roles, availability and onboarding." />} />
              <Route path="timesheets" element={<PlaceholderPage eyebrow="Today" title="Timesheets" description="Submit hours, kilometres and expenses for payroll." />} />
              <Route path="payouts" element={<PlaceholderPage eyebrow="Finance" title="Payouts" description="Insurer & client payouts, reconciliation and remittance." />} />
              <Route path="policies" element={<PlaceholderPage eyebrow="Compliance" title="Policies" description="Living policy library with version history and acknowledgements." />} />
              <Route path="training" element={<PlaceholderPage eyebrow="Compliance" title="Training" description="Assign, track and verify mandatory staff training." />} />
              <Route path="documents" element={<PlaceholderPage eyebrow="Family portal" title="Documents" description="Service agreements, invoices and care reports." />} />
              <Route path="family-billing" element={<PlaceholderPage eyebrow="Family portal" title="Billing" description="Your invoices, payments and statements." />} />
              <Route path="outcomes" element={<PlaceholderPage eyebrow="Clinical" title="Outcomes" description="Track goals, outcome measures and evidence." />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
