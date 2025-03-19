import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { FlaskConical, Lock, User } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { loginMutation, user } = useAuth();
  const [, navigate] = useLocation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  if (user) {
    navigate(user.isAdmin ? "/admin" : "/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Login Form Section */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="mb-8 text-center">
              <FlaskConical className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold">Lab Staff Portal</h1>
              <p className="text-muted-foreground mt-2">
                Access the laboratory management system
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input {...field} className="pl-10" placeholder="Enter your username" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input 
                            type="password" 
                            {...field} 
                            className="pl-10"
                            placeholder="Enter your password" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Login to Portal"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <h2 className="text-3xl font-bold mb-6">
            Welcome to the Lab Staff Portal
          </h2>
          <div className="space-y-4 text-primary-foreground/90">
            <p>
              Access and manage patient test results, generate access codes, and maintain
              laboratory records through our HIPAA-compliant system.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Secure role-based access control</li>
              <li>Real-time test result management</li>
              <li>Comprehensive audit logging</li>
              <li>End-to-end data encryption</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}