import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScientistLayout } from "@/components/layout/scientist-layout";
import { Result, ResultTemplate } from "@shared/schema";
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
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ClipboardCheck, ClipboardList, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TestResultForm } from "@/components/test-results/test-result-form";
import { ResultReviewForm } from "@/components/test-results/review-form";
import { PatientResultView } from "@/components/test-results/patient-view";

export default function ReviewResultsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("review");
  
  // Get all results
  const resultsQuery = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Get all templates
  const templatesQuery = useQuery<ResultTemplate[]>({
    queryKey: ["/api/result-templates"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const results = resultsQuery.data || [];
  const templates = templatesQuery.data || [];
  const isLoading = resultsQuery.isLoading || templatesQuery.isLoading;
  
  // Display errors if they occur
  React.useEffect(() => {
    if (resultsQuery.error) {
      toast({
        title: "Error fetching results",
        description: resultsQuery.error instanceof Error 
          ? resultsQuery.error.message 
          : "Failed to load results",
        variant: "destructive",
      });
    }
  }, [resultsQuery.error, toast]);

  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedResult(null);
  };

  // Filter results with data but no review (pending review)
  const pendingReviews = results.filter(r => 
    r.resultData && 
    Object.keys(r.resultData).length > 0 && 
    (!r.scientistReview || !r.scientistReview.reviewedAt)
  );

  // Filter results with review (completed review)
  const completedReviews = results.filter(r => 
    r.scientistReview && 
    r.scientistReview.reviewedAt
  );

  // Filter results based on search term
  const filteredResults = results.filter(result => 
    result.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.accessCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.testType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ScientistLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Scientific Review Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReviews.length}</div>
              <p className="text-xs text-muted-foreground">
                Results awaiting scientific review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedReviews.length}</div>
              <p className="text-xs text-muted-foreground">
                Results with completed scientific review
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by Patient ID, Test Type, or Access Code..."
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
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => {
                    const hasResultData = result.resultData && Object.keys(result.resultData).length > 0;
                    const needsReview = hasResultData && (!result.scientistReview || !result.scientistReview.reviewedAt);
                    
                    return (
                      <TableRow key={result.id}>
                        <TableCell>{result.patientId}</TableCell>
                        <TableCell>{result.testType}</TableCell>
                        <TableCell>
                          {hasResultData && result.resultData?.timestamp 
                            ? new Date(result.resultData.timestamp).toLocaleDateString()
                            : result.testDate ? new Date(result.testDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {result.scientistReview && result.scientistReview.reviewedAt ? (
                            <span className={cn(
                              "px-2 py-1 text-xs rounded-full",
                              result.scientistReview.approved 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            )}>
                              {result.scientistReview.approved ? "Approved" : "Rejected"}
                            </span>
                          ) : (
                            hasResultData ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                Ready for Review
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                No Data
                              </span>
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          <Dialog 
                            open={dialogOpen && selectedResult?.id === result.id} 
                            onOpenChange={(open) => {
                              setDialogOpen(open);
                              if (!open) setSelectedResult(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedResult(result);
                                    setDialogOpen(true);
                                    setActiveTab(hasResultData ? "review" : "data");
                                  }}
                                  className={needsReview ? "border-yellow-300 bg-yellow-50 hover:bg-yellow-100" : ""}
                                >
                                  {needsReview ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2 text-yellow-600" />
                                      Review
                                    </>
                                  ) : result.scientistReview ? "View Result" : "Enter Data"}
                                </Button>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Test Result: {result.patientId} - {result.testType}
                                </DialogTitle>
                              </DialogHeader>
                              
                              {selectedResult && (
                                <Tabs defaultValue={activeTab} className="w-full">
                                  <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="data">Test Data</TabsTrigger>
                                    <TabsTrigger value="review" disabled={!hasResultData}>
                                      Scientific Review
                                    </TabsTrigger>
                                    <TabsTrigger value="preview">Preview</TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="data" className="mt-4">
                                    <TestResultForm
                                      result={selectedResult}
                                      templates={templates}
                                      onSuccess={handleCloseDialog}
                                      userRole="lab_scientist"
                                      canDelete={true}
                                    />
                                  </TabsContent>
                                  
                                  <TabsContent value="review" className="mt-4">
                                    <ResultReviewForm
                                      result={selectedResult}
                                      onSuccess={handleCloseDialog}
                                    />
                                  </TabsContent>
                                  
                                  <TabsContent value="preview" className="mt-4">
                                    <PatientResultView 
                                      result={selectedResult}
                                      onPrint={handleCloseDialog}
                                    />
                                  </TabsContent>
                                </Tabs>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </ScientistLayout>
  );
}