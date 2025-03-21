import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  requireAdmin?: boolean;
  requireLabStaff?: boolean;
  requireSpecificRole?: 'admin' | 'lab_scientist' | 'technician' | 'psychologist';
}

export function ProtectedRoute({
  path,
  component: Component,
  requireAdmin = false,
  requireLabStaff = false,
  requireSpecificRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check for admin routes
  if (requireAdmin && !user.isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // Check for lab staff routes
  if (requireLabStaff && !user.isLabStaff) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // Check for specific role routes
  if (requireSpecificRole && user.role !== requireSpecificRole) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}