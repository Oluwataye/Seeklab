import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TechnicianLayout } from "@/components/layout/technician-layout";
import { Result, ResultTemplate } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, AlertCircle } from "lucide-react";
import { TestResultForm } from "@/components/test-results/test-result-form";
import { useAuth } from "@/hooks/use-auth";

export default function TestResults() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get all results
  const { data: results = [], isLoading: resultsLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Get result templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<ResultTemplate[]>({
    queryKey: ["/api/result-templates"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const filteredResults = results.filter(result =>
    result.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.accessCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.testType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to handle success after form submission
  const handleFormSuccess = () => {
    setDialogOpen(false);
    setSelectedResult(null);
  };

  // Function to get status badge
  const getStatusBadge = (result: Result) => {
    if (result.scientistReview?.approved) {
      return <Badge className="bg-green-600">Approved</Badge>;
    } else if (result.resultData && Object.keys(result.resultData).length > 0) {
      return <Badge variant="default">Completed</Badge>;
    } else {
      return <Badge variant="outline">Pending</Badge>;
    }
  };

  // Check if the scientist has rejected the result
  const isRejected = (result: Result) => {
    return result.scientistReview && 
      result.scientistReview.approved === false && 
      result.scientistReview.comments;
  };

  return (
    <TechnicianLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold lab-header">Test Results</h1>

        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by Patient ID, Access Code, or Test Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {resultsLoading || templatesLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader className="lab-table-header">
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
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-mono">{result.accessCode}</TableCell>
                      <TableCell>{result.patientId}</TableCell>
                      <TableCell>{result.testType}</TableCell>
                      <TableCell>
                        {new Date(result.testDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(result)}
                          {isRejected(result) && (
                            <span className="text-xs flex items-center text-red-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Needs revision
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog open={dialogOpen && selectedResult?.id === result.id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (!open) setSelectedResult(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedResult(result);
                                setDialogOpen(true);
                              }}
                            >
                              {result.resultData && Object.keys(result.resultData).length > 0 
                                ? "Update Result" 
                                : "Enter Result"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="lab-header">
                                {result.resultData && Object.keys(result.resultData).length > 0
                                  ? "Update Test Result" 
                                  : "Enter Test Result"}
                              </DialogTitle>
                            </DialogHeader>
                            
                            {selectedResult && (
                              <TestResultForm
                                result={selectedResult}
                                templates={templates}
                                onSuccess={handleFormSuccess}
                                userRole={user?.role || 'technician'}
                                canDelete={user?.isAdmin || user?.role === 'lab_scientist'}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </TechnicianLayout>
  );
}