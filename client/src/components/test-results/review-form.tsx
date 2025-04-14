import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Result } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ResultReviewProps {
  result: Result;
  onSuccess?: () => void;
}

export function ResultReviewForm({ result, onSuccess }: ResultReviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comments, setComments] = useState("");
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  
  // Submit review mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ id, approved, reviewComments }: { id: number; approved: boolean; reviewComments: string }) => {
      const response = await fetch(`/api/results/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved, comments: reviewComments }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit review");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      toast({
        title: "Success",
        description: "Your review has been submitted successfully.",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    reviewMutation.mutate({
      id: result.id,
      approved: true,
      reviewComments: comments,
    });
  };

  const handleReject = () => {
    if (!comments.trim()) {
      toast({
        title: "Error",
        description: "Comments are required when rejecting a result.",
        variant: "destructive",
      });
      return;
    }
    
    reviewMutation.mutate({
      id: result.id,
      approved: false,
      reviewComments: comments,
    });
    setShowRejectConfirm(false);
  };

  // Check if this result has already been reviewed
  const isReviewed = result.scientistReview && 
    (result.scientistReview.approved !== undefined || result.scientistReview.comments);

  if (isReviewed) {
    const status = result.scientistReview?.approved ? "Approved" : "Rejected";
    
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle>Review Status: {status}</CardTitle>
          <CardDescription>
            This result has already been reviewed by {result.scientistReview?.reviewedBy || "a lab scientist"}
            {result.scientistReview?.reviewedAt && ` on ${new Date(result.scientistReview.reviewedAt).toLocaleString()}`}.
          </CardDescription>
        </CardHeader>
        {result.scientistReview?.comments && (
          <CardContent>
            <p className="text-sm">{result.scientistReview.comments}</p>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scientific Review</CardTitle>
        <CardDescription>
          Review the test results and provide your approval or feedback for improvements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="comments" className="block text-sm font-medium mb-1">
              Comments
            </label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide feedback or comments about this test result"
              className="w-full"
              rows={4}
              disabled={reviewMutation.isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Comments are optional for approval, but required when rejecting a result.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <AlertDialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={reviewMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-h-[90vh] overflow-y-auto custom-scrollbar">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject this result? This will notify the lab technician to revise the results.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                Reject Result
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Button
          onClick={handleApprove}
          variant="default"
          disabled={reviewMutation.isPending}
        >
          {reviewMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}