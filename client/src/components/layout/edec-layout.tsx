import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { BrandLogo } from "@/components/brand/logo";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NotificationPopover } from "@/components/notifications/notification-popover";
import { cn } from "@/lib/utils";
import { 
  UserPlus, 
  CreditCard, 
  ClipboardCheck, 
  LayoutDashboard,
  ClipboardList, 
  Users, 
  User, 
  Settings, 
  LogOut,
  Menu,
  FileText,
  FileCheck,
  Shield,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function EdecLayout({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigation = [
    { 
      title: "Dashboard Overview", 
      href: "/edec/dashboard", 
      icon: LayoutDashboard,
    },
    { 
      title: "Patient Management", 
      href: "/edec/patients", 
      icon: Users,
    },
    { 
      title: "Test Requests", 
      href: "/edec/test-requests", 
      icon: ClipboardCheck 
    },
    { 
      title: "Patient Registration", 
      href: "/edec/register-patient", 
      icon: UserPlus 
    },
    { 
      title: "Payment Verification", 
      href: "/edec/verify-payment", 
      icon: CreditCard 
    },
    { 
      title: "Profile", 
      href: "/edec/profile", 
      icon: User 
    },
    { 
      title: "Settings", 
      href: "/edec/settings", 
      icon: Settings 
    },
  ];

  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-64 border-r bg-white transition-all duration-300 ease-in-out lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:w-20 lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {sidebarOpen ? (
            <Link href="/edec/dashboard">
              <div className="flex items-center space-x-2">
                <div className="rounded-md bg-primary p-1.5">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold">Lab Portal</span>
              </div>
            </Link>
          ) : (
            <Link href="/edec/dashboard">
              <div className="flex items-center justify-center">
                <div className="rounded-md bg-primary p-1.5">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    !sidebarOpen && "justify-center p-2"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", sidebarOpen && "mr-3")} />
                  {sidebarOpen && <span>{item.title}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 lg:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="font-medium">
              <span className="hidden md:inline">Welcome, </span>
              {user?.username}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationPopover />
            <Separator orientation="vertical" className="h-8" />
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">
          {children}
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}