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
  CheckCircle2
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
  { name: "Register Patient", href: "/admin/register-patient", icon: UserPlus },
  { name: "Payment Settings", href: "/admin/payment-settings", icon: CreditCard },
  { name: "Verify Payment", href: "/verify-payment", icon: CheckCircle2 },
  { name: "Test Requests", href: "/admin/test-requests", icon: ClipboardList },
  { name: "Result Templates", href: "/admin/templates", icon: FileText },
  { name: "Test Types", href: "/admin/test-types", icon: TestTube },
  { name: "Audit Logs", href: "/admin/logs", icon: FileText },
  { name: "Logo Settings", href: "/admin/logo", icon: Settings },
  { name: "Profile", href: "/admin/profile", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
              <DropdownMenuContent align="end" className="w-56">
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
              {user?.username} • Admin Dashboard
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}