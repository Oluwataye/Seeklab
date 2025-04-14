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
import { useEffect } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { BrandLogo } from "@/components/brand/logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SecureLogin() {
  const { loginMutation, user } = useAuth();
  const [, navigate] = useLocation();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Use useEffect for navigation to avoid state updates during render
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <BrandLogo showText={true} variant="default" />
          </div>
          <div className="flex items-center">
            <ShieldCheck className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm text-green-600 font-medium">Secure Portal</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl">
          <div className="flex flex-col lg:flex-row shadow-lg rounded-lg overflow-hidden">
            {/* Form Section */}
            <div className="flex-1 bg-white p-8">
              <Card className="w-full border-0 shadow-none">
                <CardContent className="p-0">
                  <div className="mb-8 text-center">
                    <div className="bg-primary/10 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <FlaskConical className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Staff Portal</h1>
                    <p className="text-muted-foreground mt-2">
                      Secure access to the medical results management system
                    </p>
                  </div>

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
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground z-10" />
                                <PasswordInput 
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
                  
                  <div className="mt-8">
                    <Alert className="bg-blue-50 text-blue-800 border-blue-100">
                      <AlertTitle className="text-blue-800">Secure Authentication</AlertTitle>
                      <AlertDescription className="text-blue-700">
                        This is a dedicated, secure authentication endpoint for authorized personnel only. 
                        All login attempts are logged and monitored.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Information Section */}
            <div className="flex-1 bg-primary p-8 text-white">
              <div className="h-full flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-6">
                  Staff Authorization Required
                </h2>
                <div className="space-y-6 text-primary-foreground/90">
                  <p>
                    This secure portal is exclusively for authorized medical staff and administrative personnel.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-white/20 rounded-full p-2 mt-1">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Enhanced Security</h3>
                        <p className="text-sm text-white/80">Protected login with rate limiting and audit logging</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-white/20 rounded-full p-2 mt-1">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">HIPAA Compliance</h3>
                        <p className="text-sm text-white/80">Ensuring the privacy and security of all medical records</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm border-t border-white/20 pt-4 mt-6">
                    If you require access to this system, please contact the system administrator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SeekLab Medical Systems. All rights reserved.</p>
          <p className="mt-1">Protected by comprehensive security protocols and monitoring.</p>
        </div>
      </footer>
    </div>
  );
}