import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { BrandLogo } from "@/components/brand/logo";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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
  FileSpreadsheet,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function EdecLayout({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/auth");
      },
    });
  };

  const navigation = [
    { 
      name: "Dashboard Overview", 
      href: "/edec/dashboard", 
      icon: LayoutDashboard,
    },
    { 
      name: "Patient Management", 
      href: "/edec/patients", 
      icon: Users,
    },
    { 
      name: "Test Requests", 
      href: "/edec/test-requests", 
      icon: ClipboardCheck 
    },
    { 
      name: "Substance Abuse Test", 
      href: "/edec/substance-abuse-test", 
      icon: FileSpreadsheet 
    },
    { 
      name: "Payment Verification", 
      href: "/verify-payment", 
      icon: CreditCard 
    },
    { 
      name: "Settings", 
      href: "/edec/settings", 
      icon: Settings 
    },
  ];

  const [location] = useLocation();

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
            <Link href="/edec/dashboard" className="flex items-center">
              <BrandLogo showText={true} variant="default" />
              <span className="ml-2 font-semibold text-primary">EDEC Portal</span>
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
              <DropdownMenuContent align="end" className="w-56 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/edec/settings">Account Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
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
              "bg-white border-r flex flex-col",
              !isSidebarOpen && "hidden lg:block"
            )}
          >
            <nav className="flex-1 flex flex-col h-full">
              <div className="py-4 px-2 font-medium text-sm text-gray-500">
                EDEC NAVIGATION
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar px-2">
                <div className="space-y-1 min-h-min pb-4">
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
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
              
              {/* Horizontal Scrollable Bottom Navigation */}
              <div className="mt-auto border-t pt-2 pb-3 px-2">
                <div className="overflow-x-auto custom-scrollbar">
                  <div className="flex space-x-2 min-w-max px-1">
                    {navigation.map((item) => {
                      const isActive = location === item.href;
                      return (
                        <Link
                          key={`bottom-${item.name}`}
                          href={item.href}
                          className={cn(
                            "flex flex-col items-center px-3 py-2 text-xs font-medium rounded-md transition-colors min-w-[72px]",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <item.icon className="h-4 w-4 mb-1" />
                          <span className="text-center truncate w-full">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </nav>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-gray-200 hover:bg-gray-300 transition-colors" />

          {/* Main Content */}
          <ResizablePanel defaultSize={80}>
            <main className="h-[calc(100vh-4rem)] overflow-auto p-6 bg-gray-50 custom-scrollbar">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t h-12 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="text-sm text-gray-600">
              Copyright © 2025 T-TECH SOLUTION®. ALL RIGHTS RESERVED.
            </div>
            <div className="text-sm text-gray-600">
              {user?.username} • EDEC Portal
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}