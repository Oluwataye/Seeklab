import { useQuery, useMutation } from "@tanstack/react-query";
import React from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, CheckCircle } from "lucide-react";

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
});

type PaymentSettingsFormValues = z.infer<typeof paymentSettingsSchema>;

export default function PaymentSettings() {
  const { toast } = useToast();

  const { data: paymentSettings, isLoading } = useQuery({
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
      });
    }
  }, [paymentSettings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: PaymentSettingsFormValues) => {
      return apiRequest('/api/payment-settings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex items-center"
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