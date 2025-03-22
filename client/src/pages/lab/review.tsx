import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ScientistLayout } from "@/components/layout/scientist-layout";
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
import { Clipboard, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReviewResultsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  const { data: results = [], isLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60, // 1 minute
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: { resultId: number; approved: boolean; comments: string }) => {
      const response = await fetch(`/api/results/${data.resultId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved: data.approved,
          comments: data.comments,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit review");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      setSelectedResult(null);
      toast({
        title: "Success",
        description: "Result review has been submitted.",
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

  const pendingReviews = results.filter(r => 
    r.resultData && !r.scientistReview
  ).length;

  const completedReviews = results.filter(r => r.scientistReview).length;

  const filteredResults = results.filter(result => 
    result.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.accessCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ScientistLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Review Test Results</h1>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clipboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReviews}</div>
              <p className="text-xs text-muted-foreground">
                Results awaiting scientific review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
              <Clipboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedReviews}</div>
              <p className="text-xs text-muted-foreground">
                Results with completed scientific review
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
                  <TableHead>Review Status</TableHead>
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
                      {result.scientistReview 
                        ? (
                          <span className={cn(
                            "px-2 py-1 text-xs rounded-full",
                            result.scientistReview.approved 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          )}>
                            {result.scientistReview.approved ? "Approved" : "Rejected"}
                          </span>
                        ) 
                        : <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                      }
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline"
                            onClick={() => setSelectedResult(result)}
                          >
                            {result.scientistReview ? "View Review" : "Review Result"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Scientific Review</DialogTitle>
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
                              <h3 className="font-medium">Review Comments</h3>
                              <Textarea
                                defaultValue={result.scientistReview?.comments || ""}
                                className="min-h-[150px]"
                                placeholder="Enter your scientific review comments..."
                                disabled={!!result.scientistReview}
                              />
                            </div>

                            {!result.scientistReview && (
                              <div className="flex gap-2">
                                <Button
                                  className="flex-1"
                                  variant="destructive"
                                  disabled={reviewMutation.isPending}
                                  onClick={() => {
                                    const textareaElem = document.querySelector('textarea');
                                    const comments = textareaElem ? textareaElem.value : '';
                                    reviewMutation.mutate({
                                      resultId: result.id,
                                      approved: false,
                                      comments,
                                    });
                                  }}
                                >
                                  {reviewMutation.isPending && (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  )}
                                  Reject Result
                                </Button>
                                <Button
                                  className="flex-1"
                                  variant="default"
                                  disabled={reviewMutation.isPending}
                                  onClick={() => {
                                    const textareaElem = document.querySelector('textarea');
                                    const comments = textareaElem ? textareaElem.value : '';
                                    reviewMutation.mutate({
                                      resultId: result.id,
                                      approved: true,
                                      comments,
                                    });
                                  }}
                                >
                                  {reviewMutation.isPending && (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  )}
                                  Approve Result
                                </Button>
                              </div>
                            )}
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
    </ScientistLayout>
  );
}