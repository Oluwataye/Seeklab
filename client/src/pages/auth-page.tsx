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
import { FlaskConical, Lock, User, Mail } from "lucide-react";
import { useEffect } from "react";
import { PublicLayout } from "@/components/layout/public-layout";

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

  // Use useEffect for navigation to avoid state updates during render
  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        navigate("/admin");
      } else if (user.role === "technician") {
        navigate("/lab/dashboard");
      } else if (user.role === "lab_scientist") {
        navigate("/lab/scientist-dashboard");
      } else if (user.role === "psychologist") {
        navigate("/psychologist/dashboard");
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
        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="mb-8 text-center">
                <FlaskConical className="h-12 w-12 text-primary mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Lab Staff Portal</h1>
                <p className="text-muted-foreground mt-2">
                  Access the laboratory management system
                </p>
              </div>

              <Tabs defaultValue="login" className="space-y-6">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
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
                        control={loginForm.control}
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
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input {...field} className="pl-10" placeholder="Choose a username" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input {...field} className="pl-10" placeholder="Enter your email" type="email" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
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
                                  placeholder="Create a password" 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input 
                                  type="password" 
                                  {...field} 
                                  className="pl-10"
                                  placeholder="Confirm your password" 
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
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
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
    </PublicLayout>
  );
}