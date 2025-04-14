import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

const paymentVerificationSchema = z.object({
  paymentReference: z.string().min(1, "Payment reference is required"),
});

type PaymentVerificationFormValues = z.infer<typeof paymentVerificationSchema>;

interface PaymentVerificationDialogProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accessCode: string) => void;
}

export function PaymentVerificationDialog({
  patientId,
  isOpen,
  onClose,
  onSuccess,
}: PaymentVerificationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "verified" | "failed">("idle");
  const [verifiedPayment, setVerifiedPayment] = useState<any>(null);

  const form = useForm<PaymentVerificationFormValues>({
    resolver: zodResolver(paymentVerificationSchema),
    defaultValues: {
      paymentReference: "",
    },
  });

  // Query to verify payment
  const verifyPaymentMutation = useMutation({
    mutationFn: async (data: PaymentVerificationFormValues) => {
      const response = await apiRequest(`/api/payments/verify`, {
        method: "POST",
        data: { referenceNumber: data.paymentReference },
      });
      return response;
    },
    onSuccess: (data) => {
      setVerificationStatus("verified");
      setVerifiedPayment(data);
      toast({
        title: "Payment verified",
        description: "The payment has been verified successfully.",
      });
    },
    onError: (error: any) => {
      setVerificationStatus("failed");
      toast({
        title: "Payment verification failed",
        description: error.message || "Failed to verify payment. Please check the reference number and try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation to generate access code
  const generateAccessCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/patients/${patientId}/access-code`, {
        method: "POST",
        data: { 
          paymentReference: form.getValues().paymentReference,
          isPaid: true
        },
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Access Code Generated",
        description: `The access code ${data.accessCode} has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      onSuccess(data.accessCode);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate access code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onVerifyPayment = (values: PaymentVerificationFormValues) => {
    setVerificationStatus("verifying");
    verifyPaymentMutation.mutate(values);
  };

  const onGenerateAccessCode = () => {
    generateAccessCodeMutation.mutate();
  };

  const isVerifying = verificationStatus === "verifying" || verifyPaymentMutation.isPending;
  const isGenerating = generateAccessCodeMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Payment Verification</DialogTitle>
          <DialogDescription>
            Verify payment before generating access code for the patient.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onVerifyPayment)} className="space-y-4">
            <FormField
              control={form.control}
              name="paymentReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Reference Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter payment reference number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {verificationStatus === "verified" && verifiedPayment && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="text-sm font-semibold text-green-800">Payment Verified</h4>
                <div className="mt-2 text-sm text-green-700">
                  <p>Amount: {verifiedPayment.amount} {verifiedPayment.currency}</p>
                  <p>Status: {verifiedPayment.status}</p>
                  <p>Method: {verifiedPayment.paymentMethod}</p>
                  <p>Date: {new Date(verifiedPayment.createdAt).toLocaleString()}</p>
                </div>
              </div>
            )}

            {verificationStatus === "failed" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <h4 className="text-sm font-semibold text-red-800">Payment Verification Failed</h4>
                <p className="mt-1 text-sm text-red-700">
                  The payment reference couldn't be verified. Please check the reference number and try again.
                </p>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0">
              {verificationStatus !== "verified" ? (
                <Button type="submit" disabled={isVerifying}>
                  {isVerifying ? "Verifying..." : "Verify Payment"}
                </Button>
              ) : (
                <Button type="button" onClick={onGenerateAccessCode} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate Access Code"}
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}