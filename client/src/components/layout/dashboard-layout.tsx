import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  LayoutDashboard,
  Users,
  Shield,
  KeyRound,
  Settings,
  LogOut,
  Menu,
  FileText,
  TestTube,
  CreditCard,
  UserPlus,
  ClipboardList,
  CheckCircle2,
  Bell
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationPopover } from "@/components/notifications/notification-popover";
import { BrandLogo } from "@/components/brand/logo";
import { Footer } from "./footer";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Generate navigation based on user role
  const getNavigation = () => {
    // Common navigation items for all roles
    const commonNavigation = [
      { name: "Dashboard", href: `/${user?.role}/dashboard`, icon: LayoutDashboard },
      { name: "Verify Payment", href: "/verify-payment", icon: CheckCircle2 },
    ];
    
    // Admin-specific navigation
    if (user?.role === "admin") {
      return [
        ...commonNavigation,
        { name: "User Management", href: "/admin/users", icon: Users },
        { name: "Role & Permissions", href: "/admin/roles", icon: Shield },
        { name: "Patient Management", href: "/admin/patients", icon: UserPlus },
        { name: "Payment Settings", href: "/admin/payment-settings", icon: CreditCard },
        { name: "Test Requests", href: "/admin/test-requests", icon: ClipboardList },
        { name: "Result Templates", href: "/admin/templates", icon: FileText },
        { name: "Test Types", href: "/admin/test-types", icon: TestTube },
        { name: "Audit Logs", href: "/admin/logs", icon: FileText },
        { name: "Logo Settings", href: "/admin/logo", icon: Settings },
        { name: "Profile", href: "/admin/profile", icon: Settings },
      ];
    }
    
    // EDEC-specific navigation
    if (user?.role === "edec") {
      return [
        ...commonNavigation,
        { name: "Register Patient", href: "/edec/register-patient", icon: UserPlus },
        { name: "Patients", href: "/edec/patients", icon: Users },
        { name: "Test Requests", href: "/edec/test-requests", icon: ClipboardList },
        { name: "Profile", href: "/edec/profile", icon: Settings },
        { name: "Settings", href: "/edec/settings", icon: Settings },
      ];
    }
    
    // Psychologist-specific navigation
    if (user?.role === "psychologist") {
      return [
        ...commonNavigation,
        { name: "Assessments", href: "/psychologist/assessments", icon: ClipboardList },
        { name: "Patients", href: "/psychologist/patients", icon: Users },
        { name: "Reports", href: "/psychologist/reports", icon: FileText },
        { name: "Profile", href: "/psychologist/profile", icon: Settings },
        { name: "Settings", href: "/psychologist/settings", icon: Settings },
      ];
    }
    
    // Default navigation if role is not recognized
    return commonNavigation;
  };
  
  const navigation = getNavigation();

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b h-16 flex-shrink-0 z-20">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href={`/${user?.role}/dashboard`} className="flex items-center">
              <BrandLogo showText={true} variant="default" />
              <span className="ml-2 font-semibold text-primary capitalize">{user?.role}</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <NotificationPopover />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {user?.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/${user?.role}/profile`}>Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content with Resizable Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={25}
            className={cn(
              "bg-white border-r",
              !isSidebarOpen && "hidden lg:block"
            )}
          >
            <nav className="h-full py-4">
              <div className="space-y-1 px-2">
                {navigation.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-gray-200 hover:bg-gray-300 transition-colors" />

          {/* Main Content */}
          <ResizablePanel defaultSize={80}>
            <main className="h-[calc(100vh-4rem)] overflow-auto p-6 bg-gray-50">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Bottom Navigation */}
      <footer className="bg-white border-t h-12 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="text-sm text-gray-600">
              Copyright © 2025 T-TECH SOLUTION®. ALL RIGHTS RESERVED.
            </div>
            <div className="text-sm text-gray-600">
              {user?.username} • <span className="capitalize">{user?.role}</span> Dashboard
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}