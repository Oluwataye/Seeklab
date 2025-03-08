import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, Upload, Key } from "lucide-react";

export default function CodeGenerator() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  const { data: results = [], isLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      // TODO: Implement CSV processing
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Bulk Generation */}
        <Card>
          <CardHeader>
            <CardTitle>Bulk Code Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="max-w-sm"
                />
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file containing patient IDs to generate access codes in
                bulk.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Single Code Creation */}
        <Card>
          <CardHeader>
            <CardTitle>Single Code Creation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 max-w-sm">
              <div className="space-y-2">
                <Input placeholder="Patient ID" />
                <Input placeholder="Notes (optional)" />
              </div>
              <Button>
                <Key className="h-4 w-4 mr-2" />
                Generate Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Codes */}
        <Card>
          <CardHeader>
            <CardTitle>Active Codes</CardTitle>
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
                    <TableHead>Access Code</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.accessCode}</TableCell>
                      <TableCell>{result.patientId}</TableCell>
                      <TableCell>
                        {new Date(result.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(result.expiresAt).toLocaleDateString()}
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
    </AdminLayout>
  );
}
