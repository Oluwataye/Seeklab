import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Loader2, 
  Search, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  CreditCard,
  Calendar,
  User,
  RefreshCw
} from "lucide-react";

export function PaymentAuditLog() {
  const [filterReference, setFilterReference] = useState("");
  const [filterPatient, setFilterPatient] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Define payment types
  interface Payment {
    id: number;
    patientId: string;
    amount: number;
    currency?: string;
    paymentMethod: string;
    status: string;
    referenceNumber: string;
    transactionId?: string;
    completedAt?: string;
    createdAt: string;
    metadata?: Record<string, any>;
  }

  // Fetch all payments
  const { data: payments = [], isLoading, refetch } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  // Mutation to verify a payment
  const verifyPaymentMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      return await apiRequest(`/api/payments/${paymentId}/verify`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment verified",
        description: "The payment has been successfully verified.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      setIsVerifyDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Failed to verify payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter payments based on search criteria
  const filteredPayments = payments.filter((payment) => {
    return (
      (filterReference === "" || 
        payment.referenceNumber.toLowerCase().includes(filterReference.toLowerCase())) &&
      (filterPatient === "" || 
        payment.patientId.toLowerCase().includes(filterPatient.toLowerCase())) &&
      (filterStatus === "all" || payment.status === filterStatus) &&
      (filterMethod === "all" || payment.paymentMethod === filterMethod)
    );
  });

  // Get unique payment methods for filter dropdown
  const paymentMethodsSet = new Set<string>(payments.map(p => p.paymentMethod));
  const paymentMethods = Array.from(paymentMethodsSet);

  // Handle view payment details
  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };

  // Handle verify payment
  const handleVerifyPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsVerifyDialogOpen(true);
  };

  // Confirm verify payment
  const confirmVerifyPayment = () => {
    if (selectedPayment) {
      verifyPaymentMutation.mutate(selectedPayment.id);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Payment Audit Log</CardTitle>
            <CardDescription>
              View and verify all payment transactions in the system
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center border rounded-md px-3 py-1 flex-1">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input 
                placeholder="Search by reference number..." 
                className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={filterReference}
                onChange={(e) => setFilterReference(e.target.value)}
              />
            </div>
            <div className="flex items-center border rounded-md px-3 py-1 flex-1">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input 
                placeholder="Search by patient ID..." 
                className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={filterPatient}
                onChange={(e) => setFilterPatient(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {paymentMethods.map((method: string) => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference #</TableHead>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No payment records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment: Payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.referenceNumber}
                          </TableCell>
                          <TableCell>{payment.patientId}</TableCell>
                          <TableCell>
                            ₦{payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{payment.paymentMethod}</span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === 'verified' 
                                ? 'bg-green-100 text-green-800' 
                                : payment.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleViewPayment(payment)}
                                title="View payment details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleVerifyPayment(payment)}
                                disabled={payment.status === 'verified'}
                                title={payment.status === 'verified' ? 'Already verified' : 'Verify payment'}
                                className={payment.status === 'verified' ? 'text-green-600' : ''}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Total: {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedPayment && (
            <>
              <DialogHeader>
                <DialogTitle>Payment Details</DialogTitle>
                <DialogDescription>
                  Reference #: {selectedPayment.referenceNumber}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Patient ID:</span>
                  <span>{selectedPayment.patientId}</span>
                </div>
                
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Amount:</span>
                  <span>₦{selectedPayment.amount.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Method:</span>
                  <span className="capitalize">{selectedPayment.paymentMethod}</span>
                </div>
                
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Status:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedPayment.status === 'verified' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedPayment.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedPayment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedPayment.status}
                  </span>
                </div>
                
                {selectedPayment.transactionId && (
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium mr-2">Transaction ID:</span>
                    <span className="text-sm font-mono">{selectedPayment.transactionId}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Created:</span>
                  <span>{formatDate(selectedPayment.createdAt)}</span>
                </div>
                
                {selectedPayment.completedAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium mr-2">Completed:</span>
                    <span>{formatDate(selectedPayment.completedAt)}</span>
                  </div>
                )}
                
                {selectedPayment.metadata && Object.keys(selectedPayment.metadata).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium mb-2">Additional Details</h3>
                      <div className="text-sm space-y-1">
                        {Object.entries(selectedPayment.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium">{key}:</span>
                            <span className="text-right">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                {selectedPayment.status !== 'verified' && (
                  <Button 
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleVerifyPayment(selectedPayment);
                    }}
                  >
                    Verify Payment
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Verify Payment Alert Dialog */}
      <AlertDialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this payment as verified?
              {selectedPayment && (
                <div className="mt-2 space-y-1 text-foreground">
                  <p><strong>Reference:</strong> {selectedPayment.referenceNumber}</p>
                  <p><strong>Patient ID:</strong> {selectedPayment.patientId}</p>
                  <p><strong>Amount:</strong> ₦{selectedPayment.amount.toLocaleString()}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmVerifyPayment}
              disabled={verifyPaymentMutation.isPending}
              className="bg-primary"
            >
              {verifyPaymentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Payment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}