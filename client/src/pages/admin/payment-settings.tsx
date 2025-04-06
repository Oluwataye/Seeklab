import { useQuery, useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, CheckCircle, CreditCard, BanknoteIcon, ShieldAlert, Eye, EyeOff } from "lucide-react";

interface PaymentSettingsData {
  id?: number;
  accessCodePrice: number;
  currency: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  isActive: boolean;
  enableOpay?: boolean;
  opayPublicKey?: string;
  opaySecretKey?: string;
  opayMerchantId?: string;
  updatedAt?: string;
  updatedBy?: string;
  createdAt?: string;
}

const paymentSettingsSchema = z.object({
  accessCodePrice: z.coerce.number()
    .int()
    .min(1, "Price must be at least 1")
    .max(1000000, "Price cannot exceed 1,000,000"),
  currency: z.string()
    .min(1, "Currency is required")
    .max(10, "Currency code cannot exceed 10 characters"),
  bankName: z.string()
    .min(2, "Bank name is required")
    .max(100, "Bank name cannot exceed 100 characters"),
  accountName: z.string()
    .min(2, "Account name is required")
    .max(100, "Account name cannot exceed 100 characters"),
  accountNumber: z.string()
    .min(10, "Account number must be at least 10 characters")
    .max(20, "Account number cannot exceed 20 characters"),
  isActive: z.boolean().default(true),
  enableOpay: z.boolean().default(false),
  opayPublicKey: z.string().optional(),
  opaySecretKey: z.string().optional(),
  opayMerchantId: z.string().optional(),
});

type PaymentSettingsFormValues = z.infer<typeof paymentSettingsSchema>;

export default function PaymentSettings() {
  const { toast } = useToast();
  const [showSecretKey, setShowSecretKey] = useState(false);

  const { data: paymentSettings, isLoading } = useQuery<PaymentSettingsData>({
    queryKey: ['/api/payment-settings'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const form = useForm<PaymentSettingsFormValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      accessCodePrice: 1000,
      currency: "NGN",
      bankName: "",
      accountName: "",
      accountNumber: "",
      isActive: true,
      enableOpay: false,
      opayPublicKey: "",
      opaySecretKey: "",
      opayMerchantId: "",
    },
  });

  // Update form when data is loaded
  React.useEffect(() => {
    if (paymentSettings) {
      form.reset({
        accessCodePrice: paymentSettings.accessCodePrice,
        currency: paymentSettings.currency,
        bankName: paymentSettings.bankName,
        accountName: paymentSettings.accountName,
        accountNumber: paymentSettings.accountNumber,
        isActive: paymentSettings.isActive,
        enableOpay: paymentSettings.enableOpay || false,
        opayPublicKey: paymentSettings.opayPublicKey || "",
        opaySecretKey: paymentSettings.opaySecretKey || "",
        opayMerchantId: paymentSettings.opayMerchantId || "",
      });
    }
  }, [paymentSettings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: PaymentSettingsFormValues) => {
      const response = await fetch('/api/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update payment settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Payment settings have been successfully updated.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payment-settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment settings",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: PaymentSettingsFormValues) {
    updateMutation.mutate(data);
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Payment Settings</h1>
        <p className="text-muted-foreground mb-8">
          Configure payment methods and pricing for the application
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading settings...</span>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
              <CardDescription>
                Setup bank account details and pricing for access codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="accessCodePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Code Price</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1000" {...field} />
                          </FormControl>
                          <FormDescription>
                            The price for a new access code in the selected currency
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <FormControl>
                            <Input placeholder="NGN" {...field} />
                          </FormControl>
                          <FormDescription>
                            The currency code (e.g., NGN for Nigerian Naira)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Tabs defaultValue="bank" className="w-full mt-8">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="bank" className="flex items-center">
                        <BanknoteIcon className="mr-2 h-4 w-4" />
                        Bank Transfer
                      </TabsTrigger>
                      <TabsTrigger value="opay" className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        OPay Integration
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="bank" className="pt-4">
                      <div className="grid grid-cols-1 gap-6">
                        <FormField
                          control={form.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter bank name" {...field} />
                              </FormControl>
                              <FormDescription>
                                The name of the bank for transfer payments
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <FormField
                          control={form.control}
                          name="accountName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter account name" {...field} />
                              </FormControl>
                              <FormDescription>
                                The name on the bank account
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="accountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter account number" {...field} />
                              </FormControl>
                              <FormDescription>
                                The bank account number for transfers
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="opay" className="pt-4">
                      <div className="mb-6">
                        <FormField
                          control={form.control}
                          name="enableOpay"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable OPay Payments</FormLabel>
                                <FormDescription>
                                  Allow patients to pay directly through OPay payment gateway
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <FormField
                          control={form.control}
                          name="opayMerchantId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>OPay Merchant ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter OPay Merchant ID" {...field} />
                              </FormControl>
                              <FormDescription>
                                The merchant ID provided by OPay
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <FormField
                          control={form.control}
                          name="opayPublicKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>OPay Public Key</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter OPay Public Key"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Public API key from OPay dashboard
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="opaySecretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>OPay Secret Key</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    type={showSecretKey ? "text" : "password"}
                                    placeholder="Enter OPay Secret Key"
                                    {...field}
                                  />
                                </FormControl>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 py-2 transition-transform hover:scale-110"
                                        onClick={() => setShowSecretKey(!showSecretKey)}
                                      >
                                        {showSecretKey ? (
                                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                          <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className="sr-only">
                                          {showSecretKey ? "Hide" : "Show"} secret key
                                        </span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{showSecretKey ? "Hide" : "Show"} secret key</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <FormDescription className="flex items-center mt-2">
                                <ShieldAlert className="h-4 w-4 mr-1" /> Keep this key secure
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex items-center mt-8"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-muted-foreground">
              <p>Last updated: {paymentSettings?.updatedAt ? new Date(paymentSettings.updatedAt).toLocaleString() : 'Never'}</p>
            </CardFooter>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}