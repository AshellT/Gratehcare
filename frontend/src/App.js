import "@/App.css";
import AppBootGate from "@/components/AppBootGate";
import PwaInstallBanner from "@/components/PwaInstallBanner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppShell from "@/components/dashboard/AppShell";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import ForbiddenPage from "@/pages/ForbiddenPage";
import LandingPage from "@/pages/LandingPage";
import NotFoundPage from "@/pages/NotFoundPage";
import PricingPage from "@/pages/PricingPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import BookDemoPage from "@/pages/BookDemoPage";
import BillingPage from "@/pages/dashboard/BillingPage";
import ClaimsPage from "@/pages/dashboard/ClaimsPage";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import ClientsPage from "@/pages/dashboard/ClientsPage";
import DocumentsPage from "@/pages/dashboard/DocumentsPage";
import IntegrationsPage from "@/pages/dashboard/IntegrationsPage";
import MessagesPage from "@/pages/dashboard/MessagesPage";
import NetworkPage from "@/pages/dashboard/NetworkPage";
import PermissionsPage from "@/pages/dashboard/PermissionsPage";
import SystemHealthPage from "@/pages/dashboard/SystemHealthPage";
import KnowledgeBasePage from "@/pages/dashboard/KnowledgeBasePage";
import PayoutsPage from "@/pages/dashboard/PayoutsPage";
import OutcomesPage from "@/pages/dashboard/OutcomesPage";
import ReportsPage from "@/pages/dashboard/ReportsPage";
import RevenuePage from "@/pages/dashboard/RevenuePage";
import SchedulePage from "@/pages/dashboard/SchedulePage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import SubscriptionPage from "@/pages/dashboard/SubscriptionPage";
import TenantsPage from "@/pages/dashboard/TenantsPage";
import TicketsPage from "@/pages/dashboard/TicketsPage";
import UsersPage from "@/pages/dashboard/UsersPage";
import {
  ComplianceEventsPage,
  ComplianceOverviewPage,
  CorrectiveActionsPage,
  ExpiryTrackingPage,
  IncidentRegisterPage,
  InvestigationsPage,
  PolicyTrackingPage,
  RiskAlertsPage,
  StaffCredentialsPage,
  TrainingRecordsPage,
} from "@/pages/dashboard/compliance/ComplianceSystemPages";
import ActivityPage from "@/pages/dashboard/ActivityPage";
import {
  BillingDashboardPage,
  ClaimTrackingPage,
  ClientFundingPage,
  FamilyBillingPage,
  FinanceClaimsPage,
  FinancialOverviewPage,
  InvoiceBuilderPage,
  InvoicesPage,
  OutstandingBalancesPage,
  PaymentsPage,
  ReconciliationPage,
  RevenueReportsPage,
} from "@/pages/dashboard/finance/FinancePages";
import {
  AlertsPage,
  AttendancePage,
  CareNotesPage,
  CarePlansPage,
  LiveActivityPage,
  MedicationPage,
  OpenShiftsPage,
  RosteringPage,
  ShiftConflictsPage,
  StaffPage,
  TimesheetsPage,
} from "@/pages/dashboard/operations/OperationsPages";
import {
  FamilyInvoicesPage,
  FamilyMessagesPage,
  FamilyOverviewPage,
  FamilyPaymentsPage,
  FamilySharedCareNotesPage,
  FamilySharedDocumentsPage,
  FamilyUpcomingVisitsPage,
  FamilyVisitHistoryPage,
  PractitionerAssignedClientsPage,
  PractitionerCarePlansPage,
  PractitionerClinicalNotesPage,
  PractitionerEvaluationsPage,
  PractitionerMessagesPage,
  PractitionerOverviewPage,
  PractitionerReportsPage,
} from "@/pages/dashboard/portals/PortalPages";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App bg-white text-slate-900">
      <ToastProvider>
        <PwaInstallBanner />
        <AuthProvider>
          <AppBootGate>
            <BrowserRouter>
              <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/book-demo" element={<BookDemoPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/403" element={<ForbiddenPage />} />
              <Route path="/404" element={<NotFoundPage />} />

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
                <Route path="staff" element={<StaffPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="rostering" element={<RosteringPage />} />
                <Route path="open-shifts" element={<OpenShiftsPage />} />
                <Route
                  path="shift-conflicts"
                  element={<ShiftConflictsPage />}
                />
                <Route path="timesheets" element={<TimesheetsPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="care" element={<CarePlansPage />} />
                <Route path="care-plans" element={<CarePlansPage />} />
                <Route path="care-notes" element={<CareNotesPage />} />
                <Route path="medication" element={<MedicationPage />} />
                <Route path="live-activity" element={<LiveActivityPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="claims" element={<ClaimsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route
                  path="financial-overview"
                  element={<FinancialOverviewPage />}
                />
                <Route
                  path="billing-dashboard"
                  element={<BillingDashboardPage />}
                />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route
                  path="invoice-builder"
                  element={<InvoiceBuilderPage />}
                />
                <Route path="finance-claims" element={<FinanceClaimsPage />} />
                <Route path="claim-tracking" element={<ClaimTrackingPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="reconciliation" element={<ReconciliationPage />} />
                <Route path="client-funding" element={<ClientFundingPage />} />
                <Route
                  path="revenue-reports"
                  element={<RevenueReportsPage />}
                />
                <Route
                  path="outstanding-balances"
                  element={<OutstandingBalancesPage />}
                />
                <Route path="compliance" element={<ComplianceOverviewPage />} />
                <Route
                  path="compliance-events"
                  element={<ComplianceEventsPage />}
                />
                <Route path="risk-alerts" element={<RiskAlertsPage />} />
                <Route
                  path="staff-credentials"
                  element={<StaffCredentialsPage />}
                />
                <Route
                  path="training-records"
                  element={<TrainingRecordsPage />}
                />
                <Route
                  path="expiry-tracking"
                  element={<ExpiryTrackingPage />}
                />
                <Route path="incidents" element={<IncidentRegisterPage />} />
                <Route
                  path="incident-register"
                  element={<IncidentRegisterPage />}
                />
                <Route path="investigations" element={<InvestigationsPage />} />
                <Route path="audits" element={<ActivityPage />} />
                <Route path="audit-logs" element={<ActivityPage />} />
                <Route
                  path="policy-tracking"
                  element={<PolicyTrackingPage />}
                />
                <Route
                  path="corrective-actions"
                  element={<CorrectiveActionsPage />}
                />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="profile" element={<SettingsPage />} />
                <Route path="tenants" element={<TenantsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="tickets" element={<TicketsPage />} />
                <Route path="activity" element={<ActivityPage />} />
                <Route path="network" element={<NetworkPage />} />
                <Route path="revenue" element={<RevenuePage />} />
                <Route
                  path="family-overview"
                  element={<FamilyOverviewPage />}
                />
                <Route
                  path="family-visit-history"
                  element={<FamilyVisitHistoryPage />}
                />
                <Route
                  path="family-care-notes"
                  element={<FamilySharedCareNotesPage />}
                />
                <Route
                  path="family-upcoming-visits"
                  element={<FamilyUpcomingVisitsPage />}
                />
                <Route
                  path="family-documents"
                  element={<FamilySharedDocumentsPage />}
                />
                <Route
                  path="family-invoices"
                  element={<FamilyInvoicesPage />}
                />
                <Route
                  path="family-payments"
                  element={<FamilyPaymentsPage />}
                />
                <Route
                  path="family-messages"
                  element={<FamilyMessagesPage />}
                />
                <Route
                  path="practitioner-overview"
                  element={<PractitionerOverviewPage />}
                />
                <Route
                  path="practitioner-clients"
                  element={<PractitionerAssignedClientsPage />}
                />
                <Route
                  path="practitioner-care-plans"
                  element={<PractitionerCarePlansPage />}
                />
                <Route
                  path="practitioner-clinical-notes"
                  element={<PractitionerClinicalNotesPage />}
                />
                <Route
                  path="practitioner-reports"
                  element={<PractitionerReportsPage />}
                />
                <Route
                  path="practitioner-evaluations"
                  element={<PractitionerEvaluationsPage />}
                />
                <Route
                  path="practitioner-messages"
                  element={<PractitionerMessagesPage />}
                />

                {/* Subscription management */}
                <Route path="plans" element={<SubscriptionPage />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                <Route path="integrations" element={<IntegrationsPage />} />
                <Route path="permissions" element={<PermissionsPage />} />
                <Route path="system" element={<SystemHealthPage />} />
                <Route path="knowledge" element={<KnowledgeBasePage />} />
                <Route path="team" element={<StaffPage />} />
                <Route path="payouts" element={<PayoutsPage />} />
                <Route path="policies" element={<PolicyTrackingPage />} />
                <Route path="training" element={<TrainingRecordsPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="family-billing" element={<FamilyBillingPage />} />
                <Route path="outcomes" element={<OutcomesPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </AppBootGate>
        </AuthProvider>
      </ToastProvider>
    </div>
  );
}

export default App;
