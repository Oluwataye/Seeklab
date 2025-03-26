import React from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, UserPlus, Users } from "lucide-react";
import { EdecLayout } from "@/components/layout/edec-layout";

// Define types
interface Patient {
  id: number;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  contactNumber: string;
  contactAddress: string;
  email: string | null;
  kinFirstName: string;
  kinLastName: string;
  kinContactNumber: string;
  kinContactAddress: string;
  kinEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

const patientSchema = z.object({
  // Personal details
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  dateOfBirth: z.string().refine(val => !isNaN(new Date(val).getTime()), {
    message: "Please enter a valid date",
  }),
  contactNumber: z.string().min(10, "Contact number must be at least 10 characters"),
  contactAddress: z.string().min(5, "Address must be at least 5 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  
  // Next of kin details
  kinFirstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  kinLastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  kinContactNumber: z.string().min(10, "Contact number must be at least 10 characters"),
  kinContactAddress: z.string().min(5, "Address must be at least 5 characters"),
  kinEmail: z.string().email("Invalid email address").optional().or(z.literal(""))
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function RegisterPatient() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [registeredPatient, setRegisteredPatient] = React.useState<Patient | null>(null);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      contactNumber: "",
      contactAddress: "",
      email: "",
      kinFirstName: "",
      kinLastName: "",
      kinContactNumber: "",
      kinContactAddress: "",
      kinEmail: ""
    }
  });

  const registerMutation = useMutation<Patient, Error, PatientFormValues>({
    mutationFn: async (data: PatientFormValues) => {
      try {
        // Process empty email fields to be null instead of empty string
        // The dateOfBirth will be converted to a Date object by the server's schema transform
        const processedData = {
          ...data,
          email: data.email && data.email.trim() !== '' ? data.email : null,
          kinEmail: data.kinEmail && data.kinEmail.trim() !== '' ? data.kinEmail : null
        };
        
        console.log("Sending patient data:", processedData);
        
        const response = await apiRequest(
          'POST',
          '/api/patients',
          processedData
        );
        
        // Parse the JSON response
        return response.json();
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    onSuccess: async (patientData: Patient) => {
      toast({
        title: "Patient Registered",
        description: `Successfully registered ${patientData.firstName} ${patientData.lastName} with ID: ${patientData.patientId}`,
      });
      
      // Create notification for all EDEC staff
      try {
        await apiRequest(
          'POST',
          '/api/notifications',
          {
            title: "New Patient Registration",
            message: `Patient ${patientData.firstName} ${patientData.lastName} (ID: ${patientData.patientId}) has been registered`,
            type: "PATIENT_REGISTRATION",
            recipientId: "STAFF", // This will be filtered by the backend to appropriate staff
            metadata: {
              patientId: patientData.patientId,
              firstName: patientData.firstName,
              lastName: patientData.lastName
            }
          }
        );
      } catch (error) {
        console.error("Failed to create notification:", error);
      }
      
      setRegisteredPatient(patientData);
      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register patient",
        variant: "destructive"
      });
    }
  });

  function onSubmit(data: PatientFormValues) {
    registerMutation.mutate(data);
  }

  const handleReset = () => {
    setIsSuccess(false);
    setRegisteredPatient(null);
    form.reset();
  };

  return (
    <EdecLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Patient Registration</h1>
        <p className="text-muted-foreground mb-8">
          Register a new patient with personal and next of kin details
        </p>

        {isSuccess ? (
          <Card className="border-green-500">
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <CardTitle className="flex items-center text-green-700 dark:text-green-300">
                <UserPlus className="h-5 w-5 mr-2" />
                Registration Successful
              </CardTitle>
              <CardDescription>
                Patient has been successfully registered in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Patient ID</h3>
                  <p className="text-2xl font-mono">{registeredPatient?.patientId}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This ID can be used to identify the patient in the system
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Patient Name</h3>
                    <p>{registeredPatient?.firstName} {registeredPatient?.lastName}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Date of Birth</h3>
                    <p>{registeredPatient?.dateOfBirth ? new Date(registeredPatient.dateOfBirth as string).toLocaleDateString() : ''}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleReset}>Register Another Patient</Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>New Patient Registration</CardTitle>
              <CardDescription>
                Enter patient's personal information and next of kin details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Personal Details</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Patient's personal identification information
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+234..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Optional email address for communications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="contactAddress"
                      render={({ field }) => (
                        <FormItem className="mt-6">
                          <FormLabel>Contact Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St, City, State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium">Next of Kin Details</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Emergency contact information for the patient
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="kinFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="kinLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="kinContactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+234..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="kinEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Optional email address for communications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="kinContactAddress"
                      render={({ field }) => (
                        <FormItem className="mt-6">
                          <FormLabel>Contact Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St, City, State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full md:w-auto"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Register Patient
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </EdecLayout>
  );
}