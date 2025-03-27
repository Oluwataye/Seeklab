import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { Loader2, CheckCircle2, Search, AlertTriangle, CreditCard, Landmark } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const patientSearchSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
});

const paymentVerificationSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  amount: z.coerce.number().min(1, "Payment amount is required"),
  referenceNumber: z.string().min(1, "Reference number is required"),
  paymentMethod: z.enum(["bank_transfer", "card_payment"]),
  verificationNotes: z.string().optional(),
});

type PatientSearchFormValues = z.infer<typeof patientSearchSchema>;
type PaymentVerificationFormValues = z.infer<typeof paymentVerificationSchema>;

export default function AdminVerifyPayment() {
  const { toast } = useToast();
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null);
  const [isVerified, setIsVerified] = React.useState(false);
  const [verifiedPayment, setVerifiedPayment] = React.useState<any>(null);

  const searchForm = useForm<PatientSearchFormValues>({
    resolver: zodResolver(patientSearchSchema),
    defaultValues: {
      patientId: "",
    }
  });

  const verificationForm = useForm<PaymentVerificationFormValues>({
    resolver: zodResolver(paymentVerificationSchema),
    defaultValues: {
      patientId: "",
      amount: 0,
      referenceNumber: "",
      paymentMethod: "bank_transfer",
      verificationNotes: "",
    }
  });

  // Update verification form when patient is selected
  React.useEffect(() => {
    if (selectedPatient) {
      verificationForm.setValue("patientId", selectedPatient.patientId);
    }
  }, [selectedPatient, verificationForm]);

  // Define payment settings interface
  interface PaymentSettings {
    accessCodePrice: number;
    currency: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    paymentInstructions?: string;
  }

  // Get payment settings for reference
  const { data: paymentSettings } = useQuery<PaymentSettings>({
    queryKey: ['/api/payment-settings'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: true,
  });
  
  // Fallback empty object with default values for safe rendering
  const settings = paymentSettings || {
    accessCodePrice: 0,
    currency: 'USD',
    bankName: '',
    accountName: '',
    accountNumber: '',
  };

  const searchMutation = useMutation({
    mutationFn: async (data: PatientSearchFormValues) => {
      const response = await apiRequest(
        'POST',
        `/api/patients/search`,
        data
      );
      return response;
    },
    onSuccess: async (response) => {
      try {
        const patientData = await response.json();
        if (patientData) {
          setSelectedPatient(patientData);
          toast({
            title: "Patient Found",
            description: `Found patient: ${patientData.firstName} ${patientData.lastName}`,
          });
        } else {
          toast({
            title: "Patient Not Found",
            description: "No patient found with that ID",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error parsing patient data:", error);
        toast({
          title: "Error",
          description: "Failed to process patient data",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search for patient",
        variant: "destructive",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: PaymentVerificationFormValues) => {
      const response = await apiRequest(
        'POST',
        '/api/payments/verify',
        data
      );
      return response;
    },
    onSuccess: async (response) => {
      toast({
        title: "Payment Verified",
        description: `Payment has been successfully verified`,
      });
      
      try {
        const responseData = await response.json();
        
        // Create notification for payment verification
        try {
          await apiRequest(
            'POST',
            '/api/notifications',
            {
              title: "Payment Verified",
              message: `Payment for patient ID: ${responseData.patientId} (Ref: ${responseData.referenceNumber}) has been verified`,
              type: "PAYMENT_VERIFICATION",
              recipientId: "STAFF", // This will be filtered by the backend to appropriate staff
              metadata: {
                patientId: responseData.patientId,
                referenceNumber: responseData.referenceNumber,
                amount: responseData.amount
              }
            }
          );
        } catch (error) {
          console.error("Failed to create notification:", error);
        }
        
        setVerifiedPayment(responseData);
        setIsVerified(true);
        queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      } catch (error) {
        console.error("Error parsing payment verification data:", error);
        toast({
          title: "Warning",
          description: "Payment verified but could not process response data",
          variant: "default",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify payment",
        variant: "destructive",
      });
    },
  });

  function onSearchSubmit(data: PatientSearchFormValues) {
    searchMutation.mutate(data);
  }

  function onVerificationSubmit(data: PaymentVerificationFormValues) {
    verifyMutation.mutate(data);
  }

  const handleReset = () => {
    setIsVerified(false);
    setVerifiedPayment(null);
    setSelectedPatient(null);
    searchForm.reset();
    verificationForm.reset();
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Verify Payment</h1>
        <p className="text-muted-foreground mb-8">
          Verify patient payments for access codes
        </p>

        {isVerified ? (
          <Card className="border-green-500">
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Payment Verified Successfully
              </CardTitle>
              <CardDescription>
                The payment has been verified and recorded in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-medium">Patient ID</h3>
                    <p className="font-mono">{verifiedPayment?.patientId}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Reference Number</h3>
                    <p className="font-mono">{verifiedPayment?.referenceNumber}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Amount</h3>
                    <p>{verifiedPayment?.amount.toLocaleString()} {settings.currency}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Payment Method</h3>
                  <p className="capitalize">
                    {verifiedPayment?.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Card Payment'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Verification Date</h3>
                  <p>{new Date(verifiedPayment?.verificationDate).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleReset}>Verify Another Payment</Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Verification</CardTitle>
                  <CardDescription>
                    Search for a patient by ID, then verify their payment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="search" className="w-full">
                    <TabsList className="grid grid-cols-2 w-full mb-4">
                      <TabsTrigger value="search">
                        <Search className="mr-2 h-4 w-4" />
                        Search Patient
                      </TabsTrigger>
                      <TabsTrigger value="verify" disabled={!selectedPatient}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Verify Payment
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search">
                      <Form {...searchForm}>
                        <form onSubmit={searchForm.handleSubmit(onSearchSubmit)} className="space-y-6">
                          <FormField
                            control={searchForm.control}
                            name="patientId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Patient ID</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter patient ID" 
                                    {...field} 
                                    className="font-mono"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter the patient ID to search for their records
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            disabled={searchMutation.isPending}
                            className="w-full md:w-auto"
                          >
                            {searchMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Searching...
                              </>
                            ) : (
                              <>
                                <Search className="mr-2 h-4 w-4" />
                                Search Patient
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>

                      {selectedPatient && (
                        <div className="mt-6">
                          <Separator className="my-4" />
                          <h3 className="text-lg font-medium mb-4">Patient Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium">Patient ID</h4>
                              <p className="font-mono">{selectedPatient.patientId}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Name</h4>
                              <p>{selectedPatient.firstName} {selectedPatient.lastName}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Contact</h4>
                              <p>{selectedPatient.contactNumber}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Date of Birth</h4>
                              <p>{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-medium mt-6 mb-2">Payment History</h3>
                          {selectedPatient.payments?.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Method</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedPatient.payments.map((payment: any, i: number) => (
                                  <TableRow key={i}>
                                    <TableCell>
                                      {new Date(payment.paymentDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                      {payment.amount.toLocaleString()} {settings.currency}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                      {payment.paymentMethod.replace('_', ' ')}
                                    </TableCell>
                                    <TableCell>
                                      {payment.verified ? (
                                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                                          Verified
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary">
                                          Pending
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <Alert variant="default" className="mt-2">
                              <AlertTitle className="flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                No Payment Records
                              </AlertTitle>
                              <AlertDescription>
                                This patient has no payment records. Proceed to payment verification to record a new payment.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="verify">
                      {selectedPatient ? (
                        <Form {...verificationForm}>
                          <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-6">
                            {/* Preset Patient ID */}
                            <FormField
                              control={verificationForm.control}
                              name="patientId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Patient ID</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="font-mono"
                                      disabled
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Payment Method */}
                            <FormField
                              control={verificationForm.control}
                              name="paymentMethod"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Payment Method</FormLabel>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div 
                                      className={`flex items-center gap-2 p-3 rounded-md cursor-pointer border ${field.value === 'bank_transfer' ? 'bg-primary/10 border-primary' : 'bg-background border-input'}`}
                                      onClick={() => verificationForm.setValue('paymentMethod', 'bank_transfer')}
                                    >
                                      <Landmark className="h-5 w-5" />
                                      <span>Bank Transfer</span>
                                    </div>
                                    <div
                                      className={`flex items-center gap-2 p-3 rounded-md cursor-pointer border ${field.value === 'card_payment' ? 'bg-primary/10 border-primary' : 'bg-background border-input'}`}
                                      onClick={() => verificationForm.setValue('paymentMethod', 'card_payment')}
                                    >
                                      <CreditCard className="h-5 w-5" />
                                      <span>Card Payment</span>
                                    </div>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Amount */}
                            <FormField
                              control={verificationForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Amount</FormLabel>
                                  <FormControl>
                                    <div className="flex">
                                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                                        {settings.currency}
                                      </span>
                                      <Input 
                                        type="number"
                                        {...field}
                                        className="rounded-l-none"
                                        defaultValue={settings.accessCodePrice}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    Standard price: {settings.currency} {settings.accessCodePrice.toLocaleString()}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {/* Reference Number */}
                            <FormField
                              control={verificationForm.control}
                              name="referenceNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reference Number</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="Enter payment reference/transaction ID"
                                      className="font-mono"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Enter the transaction reference number or bank transfer reference
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {/* Verification Notes */}
                            <FormField
                              control={verificationForm.control}
                              name="verificationNotes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Verification Notes (Optional)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="Additional notes about this payment"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <Button
                              type="submit"
                              disabled={verifyMutation.isPending}
                              className="w-full md:w-auto"
                            >
                              {verifyMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Verify Payment
                                </>
                              )}
                            </Button>
                          </form>
                        </Form>
                      ) : (
                        <Alert>
                          <AlertTitle>No Patient Selected</AlertTitle>
                          <AlertDescription>
                            Please search for a patient first to verify their payment.
                          </AlertDescription>
                        </Alert>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>
                    Current payment settings and verification process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Access Code Price</h3>
                      <p className="text-xl font-bold">{settings.currency} {settings.accessCodePrice.toLocaleString()}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium">Bank Information</h3>
                      <div className="space-y-2 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Bank Name</p>
                          <p>{settings.bankName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Account Name</p>
                          <p>{settings.accountName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Account Number</p>
                          <p className="font-mono">{settings.accountNumber}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Verification Process</h3>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Confirm payment details with bank statement</li>
                        <li>Enter correct amount and reference number</li>
                        <li>Verify the payment to activate access code</li>
                        <li>Provide receipt to patient if needed</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}