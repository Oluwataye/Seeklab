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
  BellRing,
  LogOut,
  Menu,
  FileText,
  Home,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Role & Permissions", href: "/admin/roles", icon: Shield },
  { name: "Code Generator", href: "/admin/codes", icon: KeyRound },
  { name: "Audit Logs", href: "/admin/logs", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/admin" className="text-xl font-bold">
              Seek Labs Admin
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <BellRing className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuItem>New user registration</DropdownMenuItem>
                <DropdownMenuItem>Code batch expiring</DropdownMenuItem>
                <DropdownMenuItem>System update available</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {user?.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>Help & Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
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
            defaultSize={15}
            minSize={10}
            maxSize={20}
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
                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md",
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

          <ResizableHandle withHandle />

          {/* Main Content */}
          <ResizablePanel defaultSize={85}>
            <main className="p-6 h-[calc(100vh-4rem-3rem)] overflow-auto">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Bottom Navigation */}
      <footer className="bg-white border-t h-12 sticky bottom-0">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-sm text-gray-600 hover:text-primary">
                <Home className="h-4 w-4 inline mr-1" />
                Home
              </Link>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
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