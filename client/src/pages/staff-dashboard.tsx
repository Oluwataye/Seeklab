import { useAuth } from "@/hooks/use-auth";
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
import { Loader2, LogOut } from "lucide-react";

export default function StaffDashboard() {
  const { logoutMutation, user } = useAuth();
  const { toast } = useToast();

  const { data: results, isLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    onError: (error: Error) => {
      toast({
        title: "Error loading results",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Patient Test Results</h2>
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center">
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
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results?.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.patientId}</TableCell>
                    <TableCell>{result.testType}</TableCell>
                    <TableCell>{result.accessCode}</TableCell>
                    <TableCell>
                      {new Date(result.testDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(result.expiresAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
