import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Result, User } from "@shared/schema";
import { Loader2, Users, Key, FileText } from "lucide-react";

export default function AdminDashboard() {
  const { toast } = useToast();

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: results = [], isLoading: resultsLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const labTechnicians = users.filter(user => !user.isAdmin).length;
  const unusedCodes = results.filter(result => new Date() < result.expiresAt).length;
  const recentResults = results.filter(result => {
    const hours24 = 24 * 60 * 60 * 1000;
    return (Date.now() - new Date(result.createdAt).getTime()) < hours24;
  }).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{labTechnicians}</div>
              <p className="text-xs text-muted-foreground">Lab Staff Members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unusedCodes}</div>
              <p className="text-xs text-muted-foreground">Valid access codes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Results</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentResults}</div>
              <p className="text-xs text-muted-foreground">Tests in last 24h</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading || resultsLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {results.slice(0, 5).map(result => (
                  <div key={result.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">New test result submitted</p>
                      <p className="text-xs text-muted-foreground">
                        Patient #{result.patientId} - {result.testType}
                      </p>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {new Date(result.createdAt).toLocaleString()}
                    </time>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}