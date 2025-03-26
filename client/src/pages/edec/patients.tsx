import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { EdecLayout } from "@/components/layout/edec-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, UserPlus, ChevronRight, FileText, Calendar, Phone, Mail, Clock, CircleDollarSign, CheckCircle, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

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
  kinRelationship: string;
  kinContactNumber: string;
  kinContactAddress: string;
  kinEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaymentSettingsType {
  accessCodePrice: number;
  currency: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export default function PatientsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isAccessCodeDialogOpen, setIsAccessCodeDialogOpen] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [accessCodeGenerated, setAccessCodeGenerated] = useState("");
  const [currentPaymentSettings, setCurrentPaymentSettings] = useState<PaymentSettingsType | null>(null);
  
  // Get all patients
  const { data: patients, isLoading } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Get payment settings
  const { data: paymentSettings } = useQuery({
    queryKey: ['/api/payment-settings'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Filter patients based on search term
  const filteredPatients = React.useMemo(() => {
    if (!patients || !Array.isArray(patients)) return [];
    
    return patients.filter((patient: Patient) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        patient.patientId.toLowerCase().includes(searchLower) ||
        patient.firstName.toLowerCase().includes(searchLower) ||
        patient.lastName.toLowerCase().includes(searchLower) ||
        patient.contactNumber.includes(searchTerm) ||
        (patient.email && patient.email.toLowerCase().includes(searchLower))
      );
    });
  }, [patients, searchTerm]);

  // Handle access code generation with payment check
  const handleGenerateAccessCode = async (patient: Patient) => {
    try {
      // First check payment status
      const checkResponse = await fetch(`/api/patients/${patient.id}/access-code-payment`);
      
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        
        // If payment is required, show payment instructions
        if (checkData.paymentRequired) {
          setSelectedPatient(patient);
          setPaymentRequired(true);
          setCurrentPaymentSettings(checkData.paymentSettings);
          setIsPaymentDialogOpen(true);
          return;
        }
        
        // If payment is verified or user is admin, proceed with access code generation
        const response = await fetch(`/api/patients/${patient.id}/access-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            testType: 'General Assessment'
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          toast({
            title: "Access Code Generated",
            description: `The access code ${data.accessCode} was generated successfully`,
          });
          
          // Show access code to the user
          setSelectedPatient(patient);
          setAccessCodeGenerated(data.accessCode);
          setIsAccessCodeDialogOpen(true);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to generate access code");
        }
      } else {
        throw new Error("Failed to check payment status");
      }
    } catch (error) {
      console.error("Error generating access code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate access code. Try again later.",
      });
    }
  };

  // View patient details
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsViewDialogOpen(true);
  };
  
  // Redirect to payment verification page
  const handleRedirectToPaymentVerify = () => {
    if (selectedPatient) {
      setIsPaymentDialogOpen(false);
      // Navigate to payment verification page
      window.location.href = `/edec/verify-payment?patientId=${selectedPatient.patientId}`;
    }
  };
  
  // Format date for display
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }

  return (
    <EdecLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Patient Management</h1>
            <p className="text-muted-foreground">
              View and manage registered patients
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button asChild variant="outline" size="sm">
              <Link href="/edec/dashboard">
                Dashboard
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/edec/register-patient">
                <UserPlus className="mr-2 h-4 w-4" />
                Register Patient
              </Link>
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Patient Directory</CardTitle>
            <CardDescription>
              Search and manage all registered patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients by ID, name or contact..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="hidden md:table-cell">Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        {searchTerm ? "No patients match your search" : "No patients have been registered yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient: Patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">
                          {patient.patientId}
                        </TableCell>
                        <TableCell>
                          {patient.firstName} {patient.lastName}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {patient.contactNumber}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(patient.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewPatient(patient)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateAccessCode(patient.patientId)}
                              title="Generate a new access code for this patient"
                            >
                              Generate Code
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common patient management tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors">
              <div className="bg-primary/10 rounded-full p-3 mb-3">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Register Patient</h3>
              <p className="text-sm text-muted-foreground mb-4">Add a new patient to the system</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/edec/register-patient">Register</Link>
              </Button>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors">
              <div className="bg-primary/10 rounded-full p-3 mb-3">
                <CircleDollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Verify Payment</h3>
              <p className="text-sm text-muted-foreground mb-4">Process payment verification</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/edec/verify-payment">Verify</Link>
              </Button>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors">
              <div className="bg-primary/10 rounded-full p-3 mb-3">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Test Requests</h3>
              <p className="text-sm text-muted-foreground mb-4">Manage patient test requests</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/edec/test-requests">View Requests</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Patient Details</DialogTitle>
                <DialogDescription>
                  Information for patient {selectedPatient.patientId}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Patient basic information */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-primary" />
                    Personal Information
                  </h3>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Full Name</p>
                      <p>
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Patient ID</p>
                      <p>{selectedPatient.patientId}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        Date of Birth
                      </p>
                      <p>{formatDate(selectedPatient.dateOfBirth)}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                        Contact Number
                      </p>
                      <p>{selectedPatient.contactNumber}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                        Email Address
                      </p>
                      <p>{selectedPatient.email || "Not provided"}</p>
                    </div>
                    
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-sm font-medium">Contact Address</p>
                      <p>{selectedPatient.contactAddress}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        Registration Date
                      </p>
                      <p>{formatDate(selectedPatient.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Next of Kin information */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-primary" />
                    Next of Kin Information
                  </h3>
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Full Name</p>
                      <p>
                        {selectedPatient.kinFirstName} {selectedPatient.kinLastName}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Relationship</p>
                      <p>{selectedPatient.kinRelationship}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                        Contact Number
                      </p>
                      <p>{selectedPatient.kinContactNumber}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                        Email Address
                      </p>
                      <p>{selectedPatient.kinEmail || "Not provided"}</p>
                    </div>
                    
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-sm font-medium">Contact Address</p>
                      <p>{selectedPatient.kinContactAddress}</p>
                    </div>
                  </div>
                </div>
                
                {/* Payment information */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <CircleDollarSign className="h-5 w-5 mr-2 text-primary" />
                    Generate Access Code
                  </h3>
                  <Separator />
                  
                  <div className="py-2">
                    <p className="mb-2">
                      Generate a new access code for this patient after payment verification.
                      Current price: <span className="font-semibold">{paymentSettings?.currency} {paymentSettings?.accessCodePrice?.toLocaleString() || 0}</span>
                    </p>
                    <Button 
                      onClick={() => handleGenerateAccessCode(selectedPatient.patientId)}
                    >
                      Generate Access Code
                    </Button>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </EdecLayout>
  );
}