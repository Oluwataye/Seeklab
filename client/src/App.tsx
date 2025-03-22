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
import StaffDashboard from "@/pages/staff-dashboard";
import AdminDashboard from "@/pages/admin/dashboard";
import UserManagement from "@/pages/admin/user-management";
import RolePermissions from "@/pages/admin/role-permissions";
import CodeGenerator from "@/pages/admin/code-generator";
import AuditLogs from "@/pages/admin/audit-logs";
import ProfileSettings from "@/pages/admin/profile-settings";
import ResultTemplates from "@/pages/admin/result-templates";
import TechnicianDashboard from "@/pages/lab/dashboard";
import TestResults from "@/pages/lab/results";
import QualityControl from "@/pages/lab/quality";
import LabReports from "@/pages/lab/reports";
import LabSettings from "@/pages/lab/settings";
import TechnicianProfilePage from "@/pages/lab/profile";
import MockGenerator from "@/pages/lab/mock-generator";
import ScientistDashboard from "@/pages/lab/scientist-dashboard";
import ReviewResultsPage from "@/pages/lab/review";
import PsychologistDashboard from "@/pages/psychologist/dashboard";
import AssessmentsPage from "@/pages/psychologist/assessments";
import PatientsPage from "@/pages/psychologist/patients";
import ReportsPage from "@/pages/psychologist/reports";
import PsychologistSettingsPage from "@/pages/psychologist/settings";
import PsychologistProfilePage from "@/pages/psychologist/profile";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={CodeEntry} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/results" component={Results} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard" component={StaffDashboard} />

      {/* Lab Technician Routes */}
      <ProtectedRoute 
        path="/lab/dashboard" 
        component={TechnicianDashboard}
        requireLabStaff={true}
      />
      <ProtectedRoute 
        path="/lab/results" 
        component={TestResults}
        requireLabStaff={true}
      />
      <ProtectedRoute 
        path="/lab/quality" 
        component={QualityControl}
        requireLabStaff={true}
      />
      <ProtectedRoute 
        path="/lab/reports" 
        component={LabReports}
        requireLabStaff={true}
      />
      <ProtectedRoute 
        path="/lab/settings" 
        component={LabSettings}
        requireLabStaff={true}
      />
      <ProtectedRoute 
        path="/lab/profile" 
        component={TechnicianProfilePage}
        requireLabStaff={true}
      />
      <ProtectedRoute 
        path="/lab/mock-generator" 
        component={MockGenerator}
        requireLabStaff={true}
      />
      
      {/* Lab Scientist Routes */}
      <ProtectedRoute 
        path="/lab/scientist-dashboard" 
        component={ScientistDashboard}
        requireSpecificRole="lab_scientist"
      />
      <ProtectedRoute 
        path="/lab/review" 
        component={ReviewResultsPage}
        requireSpecificRole="lab_scientist"
      />
      <ProtectedRoute 
        path="/lab/scientist-profile" 
        component={TechnicianProfilePage}
        requireSpecificRole="lab_scientist"
      />

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