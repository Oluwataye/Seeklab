import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Loader2, Search } from "lucide-react";

export function PaymentAuditLog() {
  const [filterReference, setFilterReference] = useState("");
  const [filterPatient, setFilterPatient] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");
  
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
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Audit Log</CardTitle>
        <CardDescription>
          View and verify all payment transactions in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
            <div className="rounded-md border">
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
                    filteredPayments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.referenceNumber}
                        </TableCell>
                        <TableCell>{payment.patientId}</TableCell>
                        <TableCell>
                          {payment.amount} {payment.currency || "NGN"}
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={payment.status === 'verified'}
                          >
                            {payment.status === 'verified' ? 'Verified' : 'Verify'}
                          </Button>
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
  );
}