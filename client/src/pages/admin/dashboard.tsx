import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Result, User } from "@shared/schema";
import { Loader2, Users, Key, FileText } from "lucide-react";

export default function AdminDashboard() {
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: results = [], isLoading: resultsLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const labTechnicians = users.filter(user => !user.isAdmin).length;
  const unusedCodes = results.filter(result => new Date() < new Date(result.expiresAt)).length;
  const recentResults = results.filter(result => {
    const hours24 = 24 * 60 * 60 * 1000;
    return (Date.now() - new Date(result.createdAt).getTime()) < hours24;
  }).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 admin-card-header">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{labTechnicians}</div>
              <p className="text-sm text-muted-foreground mt-1">Lab Staff Members</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 admin-card-header">
              <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Key className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{unusedCodes}</div>
              <p className="text-sm text-muted-foreground mt-1">Valid access codes</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 admin-card-header">
              <CardTitle className="text-sm font-medium">Recent Results</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{recentResults}</div>
              <p className="text-sm text-muted-foreground mt-1">Tests in last 24h</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card className="bg-white shadow-md">
          <CardHeader className="admin-card-header">
            <CardTitle className="admin-header">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading || resultsLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-1">
                {results.slice(0, 5).map(result => (
                  <div 
                    key={result.id} 
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">New test result submitted</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Patient #{result.patientId} - {result.testType}
                      </p>
                    </div>
                    <time className="text-sm text-muted-foreground">
                      {new Date(result.createdAt).toLocaleString()}
                    </time>
                  </div>
                ))}
                {results.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}