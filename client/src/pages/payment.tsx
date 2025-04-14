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
                        <p className="text-lg">{settings.bankName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Account Name</h3>
                        <p className="text-lg">{settings.accountName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Account Number</h3>
                        <p className="text-lg font-mono">{settings.accountNumber}</p>
                      </div>
                      <Separator className="my-4" />
                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start mb-3">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-base font-semibold text-blue-800 dark:text-blue-300">What to do after making your payment</h3>
                          </div>
                        </div>
                        <div className="ml-8 space-y-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Step 1: Make the transfer</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Complete the bank transfer of {settings.currency} {settings.accessCodePrice.toLocaleString()} to the account details above.
                              Use your full name as the payment reference.
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Step 2: Save your receipt</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Keep a copy of your payment receipt or transaction reference. You will need this for verification.
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Step 3: Verify your payment</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Visit our laboratory or contact our staff at <span className="font-medium">(+234) 123-456-7890</span> to verify your payment.
                              Provide your name and payment reference number.
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Step 4: Receive your access code</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Once your payment is verified, our staff will generate and provide you with your personal access code
                              for viewing your test results.
                            </p>
                          </div>
                        </div>
                      </div>
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
                <Card className="bg-gray-900 text-white border-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowLeft className="h-5 w-5 cursor-pointer" 
                          onClick={() => {}} />
                        <CardTitle>Payment details</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-white/70">
                      Update Payment Method
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-3 font-medium">Card information</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`flex items-center justify-between rounded-md p-3 ${paymentMethod === 'google' ? 'bg-gray-800' : 'bg-gray-800/50'}`}
                              onClick={() => setPaymentMethod('google')}
                              style={{ cursor: 'pointer' }}>
                            <div className="flex items-center gap-2">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                                <span className="text-xs font-semibold text-black">G</span>
                              </div>
                              <span>Google Pay</span>
                            </div>
                          </div>
                          <div className={`flex items-center justify-between rounded-md p-3 ${paymentMethod === 'card' ? 'bg-gray-800' : 'bg-gray-800/50'}`}
                              onClick={() => setPaymentMethod('card')}
                              style={{ cursor: 'pointer' }}>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-5 w-5" />
                              <span>Card</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Form {...cardForm}>
                        <form onSubmit={cardForm.handleSubmit(onSubmitCardPayment)} className="space-y-6">
                          <FormField
                            control={cardForm.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Card number</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      placeholder="1234 1234 1234 1234"
                                      className="bg-gray-800 border-gray-700 text-white pr-12"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                      <span className="w-6 h-4 bg-red-500 rounded"></span>
                                      <span className="w-6 h-4 bg-yellow-500 rounded"></span>
                                      <span className="w-6 h-4 bg-blue-500 rounded"></span>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={cardForm.control}
                              name="expiryDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expiry date</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="MM / YY"
                                      className="bg-gray-800 border-gray-700 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={cardForm.control}
                              name="securityCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Security code</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        type={showCvv ? "text" : "password"}
                                        placeholder="CVC"
                                        className="bg-gray-800 border-gray-700 text-white pr-10"
                                      />
                                      <div 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                        onClick={() => setShowCvv(!showCvv)}
                                      >
                                        {showCvv ? (
                                          <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                          <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div>
                            <h3 className="mb-3 font-medium">Billing address</h3>
                            <div className="space-y-4">
                              <FormField
                                control={cardForm.control}
                                name="fullName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Full name</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        className="bg-gray-800 border-gray-700 text-white"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={cardForm.control}
                                name="country"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Country or region</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                          <SelectValue placeholder="Select a country" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                        <SelectItem value="nigeria">Nigeria</SelectItem>
                                        <SelectItem value="ghana">Ghana</SelectItem>
                                        <SelectItem value="kenya">Kenya</SelectItem>
                                        <SelectItem value="southafrica">South Africa</SelectItem>
                                        <SelectItem value="netherlands">Netherlands</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={cardForm.control}
                                name="address"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        className="bg-gray-800 border-gray-700 text-white"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          
                          <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Processing..." : "Make payment"}
                          </Button>
                          
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-6">
                            <div className="flex items-start mb-3">
                              <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-blue-400" />
                              </div>
                              <div className="ml-3">
                                <h3 className="text-base font-semibold text-blue-300">After submitting your payment</h3>
                              </div>
                            </div>
                            <div className="ml-8 space-y-4">
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-blue-300">Step 1: Wait for processing</p>
                                <p className="text-sm text-gray-300">
                                  Your payment will be processed immediately. You'll see a confirmation message once it's successful.
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-blue-300">Step 2: Save your confirmation</p>
                                <p className="text-sm text-gray-300">
                                  Make sure to save or screenshot the payment confirmation for your records.
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-blue-300">Step 3: Receive your access code</p>
                                <p className="text-sm text-gray-300">
                                  Your access code will be generated automatically and displayed on screen. 
                                  You will also receive it via email if you've provided your email address.
                                </p>
                              </div>
                            </div>
                          </div>
                        </form>
                      </Form>
                    </div>
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
                      {settings.currency} {settings.accessCodePrice.toLocaleString()}
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
              <CardFooter className="flex flex-col space-y-4">
                <p className="text-sm text-muted-foreground">
                  For any payment inquiries, please contact our support team.
                </p>
                
                <div className="flex items-center p-3 bg-green-50 dark:bg-green-900 rounded-md">
                  <div className="flex-shrink-0 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <span className="font-medium">Access Code Direct Support:</span> Call <span className="font-semibold">(+234) 123-456-7890</span> for immediate assistance
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}