import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PsychologistLayout } from "../../components/layout/psychologist-layout";
import { Result } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ClipboardList, Search, Loader2, FileText } from "lucide-react";

export default function AssessmentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");

  const { data: results = [], isLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60, // 1 minute
  });

  const addAssessmentMutation = useMutation({
    mutationFn: async ({ id, assessment }: { id: number, assessment: string }) => {
      return apiRequest(
        "POST",
        `/api/results/${id}/assessment`,
        { assessment }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      toast({
        title: "Assessment saved",
        description: "The assessment has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save assessment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fix for the search function - explicitly convert undefined or null values to empty strings
  const filteredResults = results.filter((result) => {
    // Safely convert potential undefined/null values to empty strings
    const patientId = result.patientId?.toLowerCase() || '';
    const testType = result.testType?.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();
    
    // Check if the search term is found in either patientId or testType
    const matchesSearch = 
      patientId.includes(searchTermLower) || 
      testType.includes(searchTermLower);

    // Apply status filtering
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "pending") return matchesSearch && !result.psychologistAssessment;
    if (filterStatus === "completed") return matchesSearch && !!result.psychologistAssessment;
    
    return matchesSearch;
  });

  const handleAssessmentSubmit = (assessment: string) => {
    if (!selectedResult) return;
    
    addAssessmentMutation.mutate({
      id: selectedResult.id,
      assessment,
    });
  };

  return (
    <PsychologistLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Patient Assessments</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients or tests..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={(value: "all" | "pending" | "completed") => setFilterStatus(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assessments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
              <p className="text-xs text-muted-foreground">
                Total patient assessments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.filter(r => !r.psychologistAssessment).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Assessments awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.filter(r => !!r.psychologistAssessment).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed assessments
              </p>
            </CardContent>
          </Card>
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
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Result Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No assessment records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.patientId}</TableCell>
                      <TableCell>{result.testType}</TableCell>
                      <TableCell>
                        {result.resultData?.timestamp 
                          ? new Date(result.resultData.timestamp).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {result.psychologistAssessment ? (
                          <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              onClick={() => setSelectedResult(result)}
                            >
                              {result.psychologistAssessment ? "View/Edit" : "Add Assessment"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <DialogHeader>
                              <DialogTitle>Psychological Assessment</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-medium">Patient Information</h3>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                  <span className="font-medium">Patient ID:</span>
                                  <span>{result?.patientId}</span>
                                  <span className="font-medium">Test Type:</span>
                                  <span>{result?.testType}</span>
                                  <span className="font-medium">Date:</span>
                                  <span>
                                    {result?.resultData?.timestamp 
                                      ? new Date(result.resultData.timestamp).toLocaleDateString()
                                      : '-'}
                                  </span>
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="font-medium">Test Results</h3>
                                <div className="mt-2 space-y-2">
                                  {result?.resultData?.values && Object.entries(result.resultData.values).map(([key, value]) => (
                                    <div key={key} className="grid grid-cols-2 gap-2">
                                      <span className="font-medium">{key}:</span>
                                      <span>{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h3 className="font-medium">Psychological Assessment</h3>
                                <Textarea
                                  defaultValue={result?.psychologistAssessment || ""}
                                  className="min-h-[200px]"
                                  placeholder="Enter your psychological assessment based on the test results..."
                                  onChange={(e) => handleAssessmentSubmit(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                              <Button
                                onClick={() => handleAssessmentSubmit(result?.psychologistAssessment || "")}
                                disabled={addAssessmentMutation.isPending}
                              >
                                {addAssessmentMutation.isPending && (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                Save Assessment
                              </Button>
                            </div>
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
    </PsychologistLayout>
  );
}