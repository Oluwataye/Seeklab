import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { PublicLayout } from "@/components/layout/public-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ArrowLeft, CreditCard, Eye, EyeOff, Landmark } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

interface PaymentSettings {
  accessCodePrice: number;
  currency: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentInstructions?: string;
}

// Define the form schema for card payment
const cardPaymentSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be at least 16 digits").max(19, "Card number too long"),
  expiryDate: z.string().min(5, "Please enter a valid expiry date (MM/YY)"),
  securityCode: z.string().min(3, "CVV must be at least 3 digits").max(4, "CVV cannot exceed 4 digits"),
  fullName: z.string().min(2, "Please enter your full name"),
  country: z.string().min(2, "Please select a country"),
  address: z.string().min(5, "Please enter your billing address"),
});

type CardPaymentFormValues = z.infer<typeof cardPaymentSchema>;

export default function PaymentPage() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'google' | 'card'>('card');
  const [showCvv, setShowCvv] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardForm = useForm<CardPaymentFormValues>({
    resolver: zodResolver(cardPaymentSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      securityCode: "",
      fullName: "",
      country: "",
      address: "",
    },
  });

  const { data: paymentSettings, isLoading, error } = useQuery<PaymentSettings>({
    queryKey: ['/api/payment-page'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Create fallback payment settings to avoid undefined errors
  const settings = paymentSettings || {
    accessCodePrice: 2500,
    currency: "NGN",
    bankName: "First Bank of Nigeria",
    accountName: "MedLab Results Ltd",
    accountNumber: "0123456789",
    paymentInstructions: "Please include your full name as payment reference"
  };
  
  // Handle card payment submission
  const onSubmitCardPayment = (data: CardPaymentFormValues) => {
    setIsSubmitting(true);
    // This would connect to a payment processor in a real application
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Payment Processing",
        description: "Your payment details have been submitted and are being processed.",
      });
    }, 1500);
  };

  const handleCopyAccountDetails = () => {
    const accountDetails = `Bank: ${settings.bankName}\nAccount Name: ${settings.accountName}\nAccount Number: ${settings.accountNumber}`;
    navigator.clipboard.writeText(accountDetails)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Bank account details copied to clipboard",
        });
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-8">Payment Information</h1>
          <p>Loading payment information...</p>
        </div>
      </PublicLayout>
    );
  }

  if (error || !paymentSettings) {
    return (
      <PublicLayout>
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-8">Payment Information</h1>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load payment information. Please try again later or contact support.
            </AlertDescription>
          </Alert>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Payment Information</h1>
        <p className="text-muted-foreground mb-8">
          Access code verification and payment services
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Tabs defaultValue="bank" className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="bank">
                  <Landmark className="mr-2 h-4 w-4" />
                  Bank Transfer
                </TabsTrigger>
                <TabsTrigger value="card">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Card Payment
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bank" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Bank Transfer Payment</CardTitle>
                    <CardDescription>
                      Make payment via bank transfer to the account below
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium">Bank Name</h3>
                        <p className="text-lg">{paymentSettings.bankName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Account Name</h3>
                        <p className="text-lg">{paymentSettings.accountName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Account Number</h3>
                        <p className="text-lg font-mono">{paymentSettings.accountNumber}</p>
                      </div>
                      <Separator />
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                          After making your payment, please contact our staff to verify and confirm your payment.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleCopyAccountDetails}>
                      Copy Account Details
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="card" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Payment</CardTitle>
                    <CardDescription>
                      Make a secure payment using your Nigerian financial institution card
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Card Payment</AlertTitle>
                      <AlertDescription>
                        To make a card payment, please visit our office or contact our support staff.
                        We accept all major Nigerian bank cards.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>
                  Current rates for our services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Access Code Price:</span>
                    <span className="font-bold">
                      {paymentSettings.currency} {paymentSettings.accessCodePrice.toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium mb-2">Access Code Benefits:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Secure access to test results</li>
                      <li>Can be used up to two times</li>
                      <li>Valid for 30 days</li>
                      <li>Confidential and personalized</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  For any payment inquiries, please contact our support team.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}