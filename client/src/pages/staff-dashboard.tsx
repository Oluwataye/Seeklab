import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Result } from "@shared/schema";
import { Loader2, Plus, Search, LogOut } from "lucide-react";
import { Link } from "wouter";

export default function StaffDashboard() {
  const { logoutMutation, user } = useAuth();
  const { toast } = useToast();

  const { data: results = [], isLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    onSuccess: () => {
      // Handle success if needed
    },
    onError: (error: Error) => {
      toast({
        title: "Error loading results",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pendingResults = results.filter(result => new Date() > result.expiresAt);

  return (
    <DashboardLayout>
      <header className="w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-bold">Lab Staff Dashboard</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <div className="grid gap-6 max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/dashboard/templates">
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Test
                </Link>
              </Button>
              <Button variant="secondary" asChild className="w-full">
                <Link href="/dashboard/patients">
                  <Search className="mr-2 h-4 w-4" />
                  Search Patient Records
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">
                  {pendingResults.length} Tests
                </p>
                <p className="text-sm text-muted-foreground">
                  Awaiting submission
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Access Code</TableHead>
                    <TableHead>Test Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.slice(0, 5).map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.patientId}</TableCell>
                      <TableCell>{result.testType}</TableCell>
                      <TableCell>{result.accessCode}</TableCell>
                      <TableCell>
                        {new Date(result.testDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date() > result.expiresAt ? "Expired" : "Active"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}