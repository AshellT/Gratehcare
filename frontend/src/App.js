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
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
