import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import CodeEntry from "@/pages/code-entry";
import Results from "@/pages/results";
import AuthPage from "@/pages/auth-page";
import StaffDashboard from "@/pages/staff-dashboard";
import AdminDashboard from "@/pages/admin/dashboard";
import UserManagement from "@/pages/admin/user-management";
import RolePermissions from "@/pages/admin/role-permissions";
import CodeGenerator from "@/pages/admin/code-generator";
import AuditLogs from "@/pages/admin/audit-logs";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CodeEntry} />
      <Route path="/results" component={Results} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={StaffDashboard} />
      {/* Admin Routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/users" component={UserManagement} />
      <ProtectedRoute path="/admin/roles" component={RolePermissions} />
      <ProtectedRoute path="/admin/codes" component={CodeGenerator} />
      <ProtectedRoute path="/admin/logs" component={AuditLogs} />
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