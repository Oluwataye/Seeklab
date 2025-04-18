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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Result, TestType } from "@shared/schema";
import { Loader2, Upload, Key } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function CodeGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [patientId, setPatientId] = useState("");
  const [testType, setTestType] = useState("");
  const [notes, setNotes] = useState("");

  const { data: results = [], isLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch test types
  const { data: testTypes = [] } = useQuery<TestType[]>({
    queryKey: ["/api/test-types"],
  });

  const generateCodeMutation = useMutation({
    mutationFn: async (data: { patientId: string; testType: string; resultData: string }) => {
      try {
        const response = await fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to generate code");
        }

        return await response.json();
      } catch (error) {
        console.error("Code generation error:", error);
        throw error instanceof Error ? error : new Error("Failed to generate code");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      // Invalidate notifications to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      setPatientId("");
      setTestType("");
      setNotes("");
      toast({
        title: "Success",
        description: "Access code generated successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate access code",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      toast({
        title: "File uploaded",
        description: "Processing CSV file...",
      });
    }
  };

  const handleGenerateCode = () => {
    if (!patientId || !testType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    generateCodeMutation.mutate({
      patientId,
      testType,
      resultData: notes || "No additional notes",
    });
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
                <Button disabled>
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
                <Input 
                  placeholder="Patient ID" 
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="test-type-select">Test Type</Label>
                  <Select value={testType} onValueChange={setTestType}>
                    <SelectTrigger id="test-type-select">
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Input 
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleGenerateCode}
                disabled={generateCodeMutation.isPending}
              >
                {generateCodeMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {!generateCodeMutation.isPending && (
                  <Key className="h-4 w-4 mr-2" />
                )}
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
                    <TableHead>Test Type</TableHead>
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
                      <TableCell>{result.testType}</TableCell>
                      <TableCell>
                        {new Date(result.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(result.expiresAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date() > new Date(result.expiresAt) ? (
                          <span className="text-destructive">Expired</span>
                        ) : (
                          <span className="text-green-600">Active</span>
                        )}
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