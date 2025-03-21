import { useQuery } from "@tanstack/react-query";
import { TechnicianLayout } from "@/components/layout/technician-layout";
import { Result } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";

export default function TestResults() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  const { data: results = [], isLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60, // 1 minute
  });

  const filteredResults = results.filter(result => 
    result.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.accessCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateResult = async () => {
    if (!selectedResult) return;

    try {
      const response = await fetch(`/api/results/${selectedResult.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultData: selectedResult.resultData,
        }),
      });

      if (!response.ok) throw new Error("Failed to update result");

      toast({
        title: "Success",
        description: "Test result has been updated.",
      });

      // Close dialog and refresh data
      setSelectedResult(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update test result.",
        variant: "destructive",
      });
    }
  };

  return (
    <TechnicianLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Test Results</h1>

        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by Patient ID or Access Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Access Code</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-mono">{result.accessCode}</TableCell>
                    <TableCell>{result.patientId}</TableCell>
                    <TableCell>{result.testType}</TableCell>
                    <TableCell>
                      {new Date(result.testDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={result.resultData === "No additional notes" ? "outline" : "default"}>
                        {result.resultData === "No additional notes" ? "Pending" : "Completed"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedResult(result)}
                          >
                            Update Result
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Test Result</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">
                                Patient ID: {selectedResult?.patientId}
                              </label>
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Test Type: {selectedResult?.testType}
                              </label>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Result Data</label>
                              <Textarea
                                value={selectedResult?.resultData}
                                onChange={(e) => setSelectedResult(prev => 
                                  prev ? { ...prev, resultData: e.target.value } : null
                                )}
                                placeholder="Enter test results..."
                                className="mt-1"
                              />
                            </div>
                            <Button onClick={handleUpdateResult}>
                              Save Results
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </TechnicianLayout>
  );
}
