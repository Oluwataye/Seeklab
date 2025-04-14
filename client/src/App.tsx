import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import CodeEntry from "@/pages/code-entry";
import Results from "@/pages/results";
import AuthPage from "@/pages/auth-page";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import PrivacyPage from "@/pages/privacy";
import PaymentPage from "@/pages/payment";
import StaffDashboard from "@/pages/staff-dashboard";
import AdminDashboard from "@/pages/admin/dashboard";
import UserManagement from "@/pages/admin/user-management";
import RolePermissions from "@/pages/admin/role-permissions";
import CodeGenerator from "@/pages/admin/code-generator";
import AuditLogs from "@/pages/admin/audit-logs";
import ProfileSettings from "@/pages/admin/profile-settings";
import ResultTemplates from "@/pages/admin/result-templates";
import LogoSettings from "@/pages/admin/logo-settings";
import TestTypes from "@/pages/admin/test-types";
import PaymentSettings from "@/pages/admin/payment-settings";
import AdminTestRequests from "@/pages/admin/test-requests";
import AdminPatients from "@/pages/admin/patients";
import AdminRegisterPatient from "@/pages/admin/register-patient";
import EDECTestRequest from "@/pages/admin/edec-test-request";
// Removed admin verify payment import
import PsychologistDashboard from "@/pages/psychologist/dashboard";
import AssessmentsPage from "@/pages/psychologist/assessments";
import PatientsPage from "@/pages/psychologist/patients";
import ReportsPage from "@/pages/psychologist/reports";
import PsychologistSettingsPage from "@/pages/psychologist/settings";
import PsychologistProfilePage from "@/pages/psychologist/profile";
import RegisterPatient from "@/pages/edec/register-patient";
// Removed EDEC verify payment import
import EdecDashboard from "@/pages/edec/dashboard";
import EdecPatients from "@/pages/edec/patients";
import TestRequests from "@/pages/edec/test-requests";
import EdecProfilePage from "@/pages/edec/profile";
import EdecSettingsPage from "@/pages/edec/settings";
import VerifyPaymentPage from "@/pages/verify-payment";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={CodeEntry} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/payment" component={PaymentPage} />
      <Route path="/results" component={Results} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard" component={StaffDashboard} />

      {/* Admin Routes */}
      <ProtectedRoute 
        path="/admin" 
        component={AdminDashboard}
        requireAdmin={true}
      />
      <ProtectedRoute 
        path="/admin/users" 
        component={UserManagement}
        requireAdmin={true}
      />
      <ProtectedRoute 
        path="/admin/roles" 
        component={RolePermissions}
        requireAdmin={true}
      />
      <ProtectedRoute 
        path="/admin/codes" 
        component={CodeGenerator}
        requireAdmin={true}
      />
      <ProtectedRoute 
        path="/admin/logs" 
        component={AuditLogs}
        requireAdmin={true}
      />
      <ProtectedRoute 
        path="/admin/profile" 
        component={ProfileSettings}
        requireAdmin={true}
      />
      <ProtectedRoute 
        path="/admin/templates" 
        component={ResultTemplates}
        requireAdmin={true}
      />
      <ProtectedRoute 
        path="/admin/logo" 
        component={LogoSettings}
        requireAdmin={true}
      />
      <ProtectedRoute 
        path="/admin/test-types" 
        component={TestTypes}
        requireAdmin={true}
      />
      <ProtectedRoute 
        path="/admin/payment-settings" 
        component={PaymentSettings}
        requireAdmin={true}
      />
      {/* Removed admin-specific verify-payment route */}
      <ProtectedRoute 
        path="/admin/patients" 
        component={AdminPatients}
        requireAdmin={true}
      />
      <ProtectedRoute 
        path="/admin/register-patient" 
        component={AdminRegisterPatient}
        requireAdmin={true}
      />
      <ProtectedRoute 
        path="/admin/test-requests" 
        component={AdminTestRequests}
        requireAdmin={true}
      />

      {/* Centralized Verification Page (accessible by all authenticated users) */}
      <ProtectedRoute 
        path="/verify-payment"
        component={VerifyPaymentPage}
        requireAuth={true}
      />

      {/* Psychologist Routes */}
      <ProtectedRoute 
        path="/psychologist/dashboard" 
        component={PsychologistDashboard}
        requireSpecificRole="psychologist"
      />
      <ProtectedRoute 
        path="/psychologist/assessments" 
        component={AssessmentsPage}
        requireSpecificRole="psychologist"
      />
      <ProtectedRoute 
        path="/psychologist/patients" 
        component={PatientsPage}
        requireSpecificRole="psychologist"
      />
      <ProtectedRoute 
        path="/psychologist/reports" 
        component={ReportsPage}
        requireSpecificRole="psychologist"
      />
      <ProtectedRoute 
        path="/psychologist/settings" 
        component={PsychologistSettingsPage}
        requireSpecificRole="psychologist"
      />
      <ProtectedRoute 
        path="/psychologist/profile" 
        component={PsychologistProfilePage}
        requireSpecificRole="psychologist"
      />
      
      {/* EDEC Routes */}
      <ProtectedRoute 
        path="/edec" 
        component={EdecDashboard}
        requireSpecificRole="edec"
      />
      <ProtectedRoute 
        path="/edec/dashboard" 
        component={EdecDashboard}
        requireSpecificRole="edec"
      />
      <ProtectedRoute 
        path="/edec/register-patient" 
        component={RegisterPatient}
        requireSpecificRole="edec"
      />
      {/* Removed EDEC-specific verify-payment route */}
      <ProtectedRoute 
        path="/edec/patients" 
        component={EdecPatients}
        requireSpecificRole="edec"
      />
      <ProtectedRoute 
        path="/edec/test-requests" 
        component={TestRequests}
        requireSpecificRole="edec"
      />
      <ProtectedRoute 
        path="/edec/substance-abuse-test" 
        component={EDECTestRequest}
        requireSpecificRole="edec"
      />
      <ProtectedRoute 
        path="/edec/profile" 
        component={EdecProfilePage}
        requireSpecificRole="edec"
      />
      <ProtectedRoute 
        path="/edec/settings" 
        component={EdecSettingsPage}
        requireSpecificRole="edec"
      />

      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;