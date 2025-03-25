import React from "react";
import { Link, useLocation } from "wouter";
import { BrandLogo } from "@/components/brand/logo";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NotificationPopover } from "@/components/notifications/notification-popover";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { 
  UserPlus, 
  CreditCard, 
  FileCheck, 
  Users, 
  ClipboardList, 
  Settings, 
  User, 
  LogOut,
  Menu,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function EdecLayout({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  const navigation = [
    {
      title: "Patient Management",
      links: [
        { title: "Register Patient", href: "/edec/register-patient", icon: UserPlus },
        { title: "Verify Payment", href: "/edec/verify-payment", icon: CreditCard },
        { title: "Manage Patients", href: "/edec/patients", icon: Users },
      ],
    },
    {
      title: "Test Management",
      links: [
        { title: "Test Requests", href: "/edec/test-requests", icon: ClipboardList },
        { title: "Test Results", href: "/edec/test-results", icon: FileCheck },
      ],
    },
    {
      title: "Account",
      links: [
        { title: "Profile", href: "/edec/profile", icon: User },
        { title: "Settings", href: "/edec/settings", icon: Settings },
      ],
    },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          {isMobile && (
            <Button 
              variant="outline" 
              size="icon" 
              className="mr-2"
              onClick={() => {
                const sidebarElement = document.querySelector('[data-sidebar="sidebar"]');
                if (sidebarElement) {
                  sidebarElement.classList.toggle('hidden');
                }
              }}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Link href="/">
              <BrandLogo />
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <NotificationPopover />
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-4">
              <div className="hidden md:flex md:flex-col md:items-end md:gap-0.5">
                <div className="text-sm font-medium">
                  {user?.username}
                </div>
                <div className="text-xs text-muted-foreground">
                  EDEC Staff
                </div>
              </div>
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
          </div>
        </header>
        <div className="flex flex-1">
          <Sidebar side="left" collapsible="offcanvas">
            <div className="py-4">
              <div className="mb-4 px-4">
                <BrandLogo variant="small" />
              </div>
              <nav className="grid gap-2 px-2">
                {navigation.map((group, index) => (
                  <div key={index} className="grid gap-2 py-2">
                    <h3 className="px-4 text-xs font-medium text-muted-foreground">
                      {group.title}
                    </h3>
                    {group.links.map((link) => (
                      <Link key={link.href} href={link.href}>
                        {({ isActive }) => (
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className="w-full justify-start gap-2"
                          >
                            <link.icon className="h-4 w-4" />
                            {link.title}
                          </Button>
                        )}
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
            </div>
          </Sidebar>
          <main className="flex flex-1 flex-col">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}