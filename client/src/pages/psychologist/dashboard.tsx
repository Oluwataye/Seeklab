import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PsychologistLayout } from "@/components/layout/psychologist-layout";
import { Result } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ClipboardList, Search, Loader2 } from "lucide-react";

export default function PsychologistDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  const { data: results = [], isLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60, // 1 minute
  });

  const addAssessmentMutation = useMutation({
    mutationFn: async (data: { resultId: number; assessment: string }) => {
      const response = await fetch(`/api/results/${data.resultId}/assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment: data.assessment }),
      });
      if (!response.ok) throw new Error("Failed to add assessment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      setSelectedResult(null);
      toast({
        title: "Success",
        description: "Assessment has been added to the result.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pendingAssessment = results.filter(r => 
    r.resultData && !r.psychologistAssessment
  ).length;

  const completedAssessments = results.filter(r => 
    r.psychologistAssessment
  ).length;

  const filteredResults = results.filter(result => 
    result.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.accessCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssessmentSubmit = (assessment: string) => {
    if (!selectedResult) return;
    addAssessmentMutation.mutate({
      resultId: selectedResult.id,
      assessment,
    });
  };

  return (
    <PsychologistLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Psychologist Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Assessment</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAssessment}</div>
              <p className="text-xs text-muted-foreground">
                Results awaiting assessment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Assessments</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAssessments}</div>
              <p className="text-xs text-muted-foreground">
                Assessed results
              </p>
            </CardContent>
          </Card>
        </div>

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
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Result Date</TableHead>
                  <TableHead>Assessment Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.patientId}</TableCell>
                    <TableCell>{result.testType}</TableCell>
                    <TableCell>
                      {result.resultData?.timestamp 
                        ? new Date(result.resultData.timestamp).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {result.psychologistAssessment ? "Assessed" : "Pending"}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline"
                            onClick={() => setSelectedResult(result)}
                          >
                            {result.psychologistAssessment ? "View/Update" : "Add Assessment"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Psychological Assessment</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium">Test Results</h3>
                              <div className="mt-2 space-y-2">
                                {result.resultData?.values && Object.entries(result.resultData.values).map(([key, value]) => (
                                  <div key={key} className="grid grid-cols-2 gap-2">
                                    <span className="font-medium">{key}:</span>
                                    <span>{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h3 className="font-medium">Assessment</h3>
                              <Textarea
                                defaultValue={result.psychologistAssessment || ""}
                                className="min-h-[200px]"
                                placeholder="Enter your psychological assessment based on the test results..."
                                onChange={(e) => handleAssessmentSubmit(e.target.value)}
                              />
                            </div>

                            <Button
                              onClick={() => handleAssessmentSubmit(result.psychologistAssessment || "")}
                              disabled={addAssessmentMutation.isPending}
                              className="w-full"
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
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PsychologistLayout>
  );
}
