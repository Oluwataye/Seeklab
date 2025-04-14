import { useEffect, useState } from "react";
import { EdecLayout } from "@/components/layout/edec-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestType, Patient } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function EDECTestRequest() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [selectedTestType, setSelectedTestType] = useState("");
  const [notes, setNotes] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Add useEffect to automatically add the test type if it doesn't exist
  useEffect(() => {
    const addSubstanceAbuseTestType = async () => {
      try {
        // First check if test type already exists
        const response = await fetch("/api/test-types");
        if (!response.ok) return;
        
        const testTypes = await response.json();
        const exists = testTypes.some((type: TestType) => 
          type.name === "Substance Abuse Screening Test"
        );
        
        if (!exists) {
          // If test type doesn't exist, add it
          const result = await fetch("/api/test-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "Substance Abuse Screening Test",
              category: "Toxicology",
              description: "Comprehensive screening test for substance abuse as per the standardized laboratory request form. Used for educational, clinical, or diagnostic purposes.",
              isActive: true
            })
          });
          
          if (result.ok) {
            console.log("Successfully added Substance Abuse Screening Test");
            queryClient.invalidateQueries({ queryKey: ["/api/test-types"] });
          }
        }
      } catch (error) {
        console.error("Error setting up test type:", error);
      }
    };
    
    // Only run once when component mounts
    addSubstanceAbuseTestType();
  }, [queryClient]);

  const { data: testTypes = [], isLoading: isLoadingTestTypes } = useQuery<TestType[]>({
    queryKey: ["/api/test-types"],
  });

  const handlePatientDataUpdate = (data: Patient | null) => {
    if (data) {
      setPatientName(`${data.firstName} ${data.lastName}`);
    } else {
      setPatientName("");
    }
  };

  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["/api/patients/search", patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const response = await fetch(`/api/patients/search?patientId=${patientId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch patient");
      }
      return response.json();
    },
    enabled: !!patientId,
    retry: false
  });

  const createTestRequestMutation = useMutation({
    mutationFn: async (data: { patientId: string; testType: string; notes: string }) => {
      const response = await fetch("/api/test-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create test request");
      }
      
      return response.json();
    },
    onMutate: () => {
      setFormStatus("loading");
    },
    onSuccess: () => {
      setFormStatus("success");
      toast({
        title: "Success",
        description: "Test request created successfully",
      });
      // Reset form
      setPatientId("");
      setPatientName("");
      setSelectedTestType("");
      setNotes("");
      // Refresh notifications
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      setFormStatus("error");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test request",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setTimeout(() => setFormStatus("idle"), 1000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId || !selectedTestType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (!patient) {
      toast({
        title: "Error",
        description: "Patient not found. Please check the Patient ID.",
        variant: "destructive",
      });
      return;
    }
    
    createTestRequestMutation.mutate({
      patientId,
      testType: selectedTestType,
      notes: notes || "No additional notes"
    });
  };

  // Update patient name when data changes
  useEffect(() => {
    if (patient) {
      setPatientName(`${patient.firstName} ${patient.lastName}`);
    } else if (patient === null && patientId) {
      setPatientName("");
    }
  }, [patient, patientId]);

  return (
    <EdecLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Create Test Request</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>New Test Request Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="patientId"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      placeholder="Enter patient ID"
                      className="flex-1"
                    />
                    {isLoadingPatient && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                  </div>
                  {patientName && (
                    <p className="text-sm text-green-600">Patient found: {patientName}</p>
                  )}
                  {patientId && !patientName && !isLoadingPatient && (
                    <p className="text-sm text-destructive">No patient found with this ID</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="testType">Test Type</Label>
                  <Select 
                    value={selectedTestType} 
                    onValueChange={setSelectedTestType}
                  >
                    <SelectTrigger id="testType">
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions/Notes</Label>
                  <Textarea 
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter any special instructions or notes for this test"
                    rows={4}
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={formStatus === "loading"}
                className="w-full"
              >
                {formStatus === "loading" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {formStatus === "success" ? "Request Submitted!" : "Submit Test Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </EdecLayout>
  );
}