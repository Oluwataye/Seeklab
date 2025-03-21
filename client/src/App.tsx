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

      {/* Protected Routes */}
      <ProtectedRoute path="/dashboard" component={StaffDashboard} />

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