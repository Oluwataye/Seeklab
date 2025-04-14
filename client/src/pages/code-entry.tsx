import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { PublicLayout } from "@/components/layout/public-layout";
import { useMutation } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, ShieldCheck, CheckCircle, Loader2 } from "lucide-react";

const codeSchema = z.object({
  code: z.string().length(8, { message: "Access code must be 8 characters" }),
});

export default function CodeEntry() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [cachedResult, setCachedResult] = useState<string | null>(null);
  
  // Clear any cached result when the user returns to this page
  useEffect(() => {
    localStorage.removeItem('lastAccessedCode');
    window.performance?.mark('page-load');
  }, []);

  const form = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: "",
    },
  });

  // Use TanStack Query for better caching and error handling
  const resultMutation = useMutation({
    mutationFn: async (data: { code: string }) => {
      window.performance?.mark('request-start');
      
      // Check if we already have this code in localStorage (client-side caching)
      const cachedData = localStorage.getItem(`result-${data.code}`);
      if (cachedData) {
        const { result, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;
        
        // Only use cache if it's less than 10 minutes old
        if (cacheAge < 10 * 60 * 1000) {
          localStorage.setItem('lastAccessedCode', data.code);
          window.performance?.mark('cache-hit');
          window.performance?.measure('request-time', 'request-start', 'cache-hit');
          return result;
        }
      }
      
      const res = await fetch("/api/results/access", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify({ code: data.code }),
        // Signal to the browser this is an important user-initiated request
        priority: "high",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to access results");
      }

      window.performance?.mark('request-end');
      window.performance?.measure('request-time', 'request-start', 'request-end');
      
      const result = await res.json();
      
      // Store in localStorage for future quick access
      localStorage.setItem(`result-${data.code}`, JSON.stringify({ 
        result, 
        timestamp: Date.now() 
      }));
      
      localStorage.setItem('lastAccessedCode', data.code);
      return result;
    },
    onSuccess: (result) => {
      navigate("/results", { state: { result } });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to access results",
        variant: "destructive",
      });
    }
  });

  function onSubmit(data: z.infer<typeof codeSchema>) {
    // Format the code to ensure consistent format
    const formattedCode = data.code.trim().toUpperCase();
    resultMutation.mutate({ code: formattedCode });
  }

  return (
    <PublicLayout>
      <div className="patient-portal flex flex-col items-center justify-center max-w-5xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 lab-header">Fast, Secure Access to Drug Test Results</h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            HIPAA-compliant medical test results portal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 w-full">
          <div className="md:col-span-3 space-y-4 md:space-y-6">
            <Card className="w-full">
              <CardContent className="pt-4 sm:pt-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-center">Access Your Test Results</h2>
                <p className="text-sm sm:text-base text-muted-foreground text-center mb-4 sm:mb-6">
                  Enter the 8-character code provided by your lab
                </p>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter code (e.g., SEEK-A1B2)"
                              className="text-center text-lg sm:text-xl tracking-wider code-input"
                              disabled={resultMutation.isPending}
                              autoComplete="off"
                              maxLength={8}
                              onChange={(e) => {
                                const value = e.target.value
                                  .replace(/[^a-zA-Z0-9-]/g, '')
                                  .toUpperCase();
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage className="error-text text-sm" />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      style={{ backgroundColor: 'var(--lab-header)', color: 'white' }}
                      disabled={resultMutation.isPending}
                      size="lg"
                    >
                      {resultMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </span>
                      ) : "View Results"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="text-xs sm:text-sm text-muted-foreground flex justify-center">
                <div className="flex items-center">
                  <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Secure, encrypted connection
                </div>
              </CardFooter>
            </Card>

            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle className="text-sm sm:text-base">Need help?</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">
                If you don't have an access code, please contact your healthcare provider or lab technician.
              </AlertDescription>
            </Alert>
          </div>

          <div className="md:col-span-2 space-y-4">
            {/* How It Works Card - More accessible on mobile */}
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">How It Works</h3>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex gap-2 text-xs sm:text-sm">
                    <span className="flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs sm:text-sm">1</span>
                    <span>Enter your 8-character access code</span>
                  </li>
                  <li className="flex gap-2 text-xs sm:text-sm">
                    <span className="flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs sm:text-sm">2</span>
                    <span>View your lab results securely</span>
                  </li>
                  <li className="flex gap-2 text-xs sm:text-sm">
                    <span className="flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs sm:text-sm">3</span>
                    <span>Download or print your results if needed</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Privacy & Security Card - More accessible on mobile */}
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Privacy & Security</h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mt-0.5" />
                    <span>HIPAA compliant</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mt-0.5" />
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mt-0.5" />
                    <span>Results expire after limited time</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}