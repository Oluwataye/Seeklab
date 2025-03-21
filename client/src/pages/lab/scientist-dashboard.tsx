import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScientistLayout } from "../../components/layout/scientist-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Result } from "@shared/schema";
import { FlaskConical, ClipboardCheck, Clock, AlertCircle } from "lucide-react";

export default function ScientistDashboard() {
  const { data: results = [] } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60, // 1 minute
  });

  const pendingReview = results.filter(r => r.resultData && !r.scientistReview).length;
  const reviewedResults = results.filter(r => r.scientistReview).length;
  const urgentReviews = results.filter(r => {
    if (!r.resultData || r.scientistReview) return false;
    const resultDate = new Date(r.resultData.timestamp);
    const hoursSinceResult = (Date.now() - resultDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceResult > 24;
  }).length;

  return (
    <ScientistLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Laboratory Scientist Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReview}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviewed Results</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviewedResults}</div>
              <p className="text-xs text-muted-foreground">
                Verified and approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Reviews</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{urgentReviews}</div>
              <p className="text-xs text-muted-foreground">
                Over 24 hours pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Results</CardTitle>
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
    </ScientistLayout>
  );
}
