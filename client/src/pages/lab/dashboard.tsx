import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TechnicianLayout } from "@/components/layout/technician-layout";
import { Result } from "@shared/schema";
import { FlaskConical, ClipboardCheck, Clock, AlertCircle } from "lucide-react";

export default function TechnicianDashboard() {
  const { data: results = [] } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60, // 1 minute
  });

  const pendingTests = results.filter(r => !r.resultData || r.resultData === "No additional notes").length;
  const completedTests = results.length - pendingTests;
  const urgentTests = results.filter(r => {
    const testDate = new Date(r.testDate);
    const hoursSinceTest = (Date.now() - testDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceTest > 24 && (!r.resultData || r.resultData === "No additional notes");
  }).length;

  return (
    <TechnicianLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Lab Technician Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTests}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTests}</div>
              <p className="text-xs text-muted-foreground">
                Processed and reported
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Tests</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{urgentTests}</div>
              <p className="text-xs text-muted-foreground">
                Over 24 hours pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TechnicianLayout>
  );
}