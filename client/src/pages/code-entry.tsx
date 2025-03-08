import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const codeSchema = z.object({
  code: z.string().length(8, "Code must be 8 characters"),
});

export default function CodeEntry() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(data: z.infer<typeof codeSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/results/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: data.code }),
      });

      if (!res.ok) {
        throw new Error((await res.json()).message);
      }

      const result = await res.json();
      navigate("/results", { state: { result } });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to access results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-bold">Seek Labs</div>
          <Link href="/auth" className="text-sm text-primary hover:underline">
            Lab Staff Login
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Access Your Test Results Securely</h1>
              <p className="text-muted-foreground">
                Enter the code provided by your lab to view your results
              </p>
            </div>

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
                          placeholder="Enter 8-digit code (e.g., SEEK-A1B2)"
                          className="text-center text-lg"
                          disabled={isLoading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    "Checking..."
                  ) : (
                    <>
                      View Results
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <h2 className="font-semibold">Need Help?</h2>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Your code is on your lab receipt or email</li>
                  <li>• Lost your code? Contact support@seeklabs.com</li>
                </ul>
              </div>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  HIPAA-Compliant
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Data Encrypted
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Seek Labs. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
