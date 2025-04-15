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
  FileText,
  Settings,
  LogOut,
  Menu,
  Brain,
  ClipboardList,
  Users,
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
import { Footer } from "./footer";

const navigation = [
  { name: "Dashboard", href: "/psychologist/dashboard", icon: LayoutDashboard },
  { name: "Assessments", href: "/psychologist/assessments", icon: Brain },
  { name: "Patient History", href: "/psychologist/patients", icon: Users },
  { name: "Reports", href: "/psychologist/reports", icon: ClipboardList },
  { name: "Settings", href: "/psychologist/settings", icon: Settings },
];

export function PsychologistLayout({ children }: { children: React.ReactNode }) {
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
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/psychologist/dashboard" className="text-xl font-bold">
              Psychologist Portal
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
                  <Link href="/psychologist/profile">Profile Settings</Link>
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
            id="psychologist-sidebar"
            defaultSize={20}
            minSize={10}
            maxSize={40}
            collapsible={true}
            onCollapse={() => setIsSidebarOpen(false)}
            onExpand={() => setIsSidebarOpen(true)}
            className={cn(
              "bg-white border-r flex flex-col transition-all",
              isMobile && !isSidebarOpen && "hidden",
              isMobile && isSidebarOpen && "fixed inset-y-0 left-0 z-40 w-64"
            )}
          >
            <nav className="h-full py-4 flex flex-col">
              <div className="px-2 font-medium text-sm text-gray-500 flex justify-between items-center mb-4">
                <span>PSYCHOLOGIST MENU</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar space-y-1 px-2">
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
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="whitespace-normal break-words">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </ResizablePanel>
          
          {/* ResizableHandle with proper visibility */}
          <ResizableHandle withHandle 
            className="bg-gray-200 hover:bg-gray-300 transition-colors cursor-col-resize"
          />

          {/* Main Content */}
          <ResizablePanel defaultSize={80}>
            <main className="h-[calc(100vh-4rem)] overflow-auto p-6 bg-gray-50 custom-scrollbar">
              <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
                {children}
                <Footer />
              </div>
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
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