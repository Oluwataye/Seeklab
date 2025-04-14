import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { FlaskConical, Lock, User, Mail, ShieldAlert } from "lucide-react";
import { useEffect } from "react";
import { PublicLayout } from "@/components/layout/public-layout";
import { PasswordInput } from "@/components/ui/password-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { loginMutation, registerMutation, user } = useAuth();
  const [, navigate] = useLocation();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Redirect to the secure login page immediately
  useEffect(() => {
    // Redirect to the secure login page after a small delay
    const redirectTimer = setTimeout(() => {
      navigate("/secure/login");
    }, 500);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  // Also handle normal user redirects if they somehow authenticate here
  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        navigate("/admin");
      } else if (user.role === "psychologist") {
        navigate("/psychologist/dashboard");
      } else if (user.role === "edec") {
        navigate("/edec");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);
  
  // Return null early if user exists
  if (user) {
    return null;
  }

  return (
    <PublicLayout>
      <div className="flex flex-col lg:flex-row gap-8 px-4 py-8">
        {/* Redirect Alert */}
        <div className="w-full max-w-3xl mx-auto mb-6">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Security Enhancement</AlertTitle>
            <AlertDescription>
              For security reasons, the login page has been moved to a secure endpoint. 
              You are being redirected to the secure staff portal login page...
            </AlertDescription>
          </Alert>
        </div>
      
        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center opacity-50 pointer-events-none">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="mb-8 text-center">
                <FlaskConical className="h-12 w-12 text-primary mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Staff Portal</h1>
                <p className="text-muted-foreground mt-2">
                  Access the medical results management system
                </p>
              </div>

              <div className="space-y-6">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}
                    className="space-y-4"
                  >
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-medium">Login to your account</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Staff accounts are created by administrators
                      </p>
                    </div>
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input {...field} className="pl-10" placeholder="Enter your username" disabled />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground z-10" />
                              <PasswordInput 
                                {...field} 
                                className="pl-10"
                                placeholder="Enter your password" 
                                disabled
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={true}
                    >
                      Redirecting...
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
          <div className="max-w-lg text-white">
            <h2 className="text-3xl font-bold mb-6">
              Welcome to the Staff Portal
            </h2>
            <div className="space-y-4 text-primary-foreground/90">
              <p>
                Access and manage patient data, verify payments, generate access codes, and maintain
                medical records through our HIPAA-compliant system.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Secure role-based access control</li>
                <li>Patient registration and management</li>
                <li>Payment verification system</li>
                <li>Comprehensive audit logging</li>
                <li>End-to-end data encryption</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}