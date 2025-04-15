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
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex lg:hidden"
              aria-label="Toggle sidebar"
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
        <ResizablePanelGroup direction="horizontal" className="w-full">
          {/* Sidebar - only hidden on mobile when closed */}
          <ResizablePanel 
            defaultSize={20} 
            minSize={15} 
            maxSize={30}
            className={cn(
              "bg-white border-r",
              isMobile && !isSidebarOpen && "hidden"
            )}
          >
            <div className="h-full flex flex-col">
              <div className="py-4 px-3 font-medium text-sm text-gray-500 flex justify-between items-center border-b">
                <span>EDEC NAVIGATION</span>
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto py-2 px-3 custom-scrollbar">
                {navigation.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 my-1 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="whitespace-normal break-words">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </ResizablePanel>

          {/* ResizableHandle - only shown when sidebar is visible */}
          {(!isMobile || isSidebarOpen) && (
            <ResizableHandle withHandle className="w-1.5 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 cursor-col-resize" />
          )}

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
      
      {/* Fixed toggle button when sidebar is closed */}
      {!isSidebarOpen && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-4 top-20 z-50 rounded-full shadow-md h-10 w-10 flex items-center justify-center lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}