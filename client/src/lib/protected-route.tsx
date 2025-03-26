import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  requireAdmin?: boolean;
  requireSpecificRole?: 'admin' | 'psychologist' | 'edec';
}

export function ProtectedRoute({
  path,
  component: Component,
  requireAdmin = false,
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

  // Lab staff routes were removed

  // Check for specific role routes
  if (requireSpecificRole && user.role !== requireSpecificRole) {
    // Allow admin to access EDEC routes
    if (requireSpecificRole === 'edec' && user.isAdmin) {
      // Admin can access EDEC routes
    } else {
      return (
        <Route path={path}>
          <Redirect to="/" />
        </Route>
      );
    }
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}