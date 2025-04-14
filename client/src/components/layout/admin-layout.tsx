import { useState, useEffect } from "react";
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
  FileEdit
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

const navigation = [
  { name: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Role & Permissions", href: "/admin/roles", icon: Shield },
  { name: "Code Generator", href: "/admin/codes", icon: KeyRound },
  { name: "Patient Management", href: "/admin/patients", icon: UserPlus },
  { name: "Payment Settings", href: "/admin/payment-settings", icon: CreditCard },
  { name: "Payment Audit", href: "/admin/payment-audit", icon: CreditCard },
  { name: "Verify Payment", href: "/verify-payment", icon: CheckCircle2 },
  { name: "Test Requests", href: "/admin/test-requests", icon: ClipboardList },
  { name: "Result Templates", href: "/admin/templates", icon: FileText },
  { name: "Test Types", href: "/admin/test-types", icon: TestTube },
  { name: "Page Content", href: "/admin/page-content", icon: FileEdit },
  { name: "Audit Logs", href: "/admin/logs", icon: FileText },
  { name: "Logo Settings", href: "/admin/logo", icon: Settings },
  { name: "Profile", href: "/admin/profile", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if screen is mobile sized on mount and when window is resized
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint in Tailwind is 1024px
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
            <Link href="/admin" className="flex items-center">
              <BrandLogo showText={true} variant="default" />
              <span className="ml-2 font-semibold text-primary">Admin</span>
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
                  <Link href="/admin/profile">Profile Settings</Link>
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
            maxSize={35}
            className={cn(
              "bg-white border-r flex flex-col",
              !isSidebarOpen && "hidden lg:block",
              isSidebarOpen && isMobile && "fixed inset-y-0 left-0 z-40 w-64"
            )}
          >
            <nav className="flex-1 flex flex-col h-full">
              <div className="py-4 px-2 font-medium text-sm text-gray-500">
                MAIN NAVIGATION
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
                        <span className="whitespace-normal break-words">{item.name}</span>
                      </Link>
                    );
                  })}
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

      {/* Bottom Navigation */}
      <footer className="bg-white border-t h-12 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="text-sm text-gray-600">
              Copyright © 2025 T-TECH SOLUTION®. ALL RIGHTS RESERVED.
            </div>
            <div className="text-sm text-gray-600">
              {user?.username} • Admin Dashboard
            </div>
          </div>
        </div>
      </footer>
      
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}