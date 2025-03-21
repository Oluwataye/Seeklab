import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PsychologistLayout } from "../../components/layout/psychologist-layout";
import { Result } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Search, Loader2, Users, FileText, CalendarDays } from "lucide-react";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const { data: results = [], isLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Derive unique patient IDs
  const uniquePatientIds = new Set();
  results.forEach(result => {
    if (result.patientId) {
      uniquePatientIds.add(result.patientId);
    }
  });
  const patientIds = Array.from(uniquePatientIds) as string[];
  
  // Filter patients by search term
  const filteredPatients = patientIds.filter(patientId => 
    patientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get patient history when a patient is selected
  const patientHistory = results.filter(
    result => result.patientId === selectedPatient
  ).sort((a, b) => {
    const dateA = a.resultData?.timestamp ? new Date(a.resultData.timestamp).getTime() : 0;
    const dateB = b.resultData?.timestamp ? new Date(b.resultData.timestamp).getTime() : 0;
    return dateB - dateA; // Sort newest first
  });

  return (
    <PsychologistLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Patient History</h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientIds.length}</div>
              <p className="text-xs text-muted-foreground">
                Patients in database
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{results.length}</div>
              <p className="text-xs text-muted-foreground">
                Total test results
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Tests</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.filter(r => {
                  const resultDate = r.resultData?.timestamp 
                    ? new Date(r.resultData.timestamp) 
                    : null;
                  if (!resultDate) return false;
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return resultDate >= thirtyDaysAgo;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Tests in last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-4 border-b">
                <h2 className="font-medium">Patients</h2>
              </div>
              <div className="divide-y">
                {filteredPatients.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No patients found
                  </div>
                ) : (
                  filteredPatients.map((patientId) => (
                    <button
                      key={patientId}
                      className={`w-full text-left p-4 hover:bg-accent/50 transition-colors ${
                        selectedPatient === patientId ? "bg-accent" : ""
                      }`}
                      onClick={() => setSelectedPatient(patientId)}
                    >
                      <div className="font-medium">{patientId}</div>
                      <div className="text-sm text-muted-foreground">
                        {
                          results.filter(r => r.patientId === patientId).length
                        } test results
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="md:col-span-2 border rounded-lg overflow-hidden">
              {!selectedPatient ? (
                <div className="p-8 text-center text-muted-foreground">
                  Select a patient to view their history
                </div>
              ) : (
                <>
                  <div className="bg-muted p-4 border-b flex items-center justify-between">
                    <h2 className="font-medium">Patient: {selectedPatient}</h2>
                  </div>
                  <div className="p-4">
                    <Tabs defaultValue="history">
                      <TabsList className="mb-4">
                        <TabsTrigger value="history">Test History</TabsTrigger>
                        <TabsTrigger value="assessments">Assessments</TabsTrigger>
                      </TabsList>
                      <TabsContent value="history">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Test Type</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {patientHistory.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                  No test history available
                                </TableCell>
                              </TableRow>
                            ) : (
                              patientHistory.map((result) => (
                                <TableRow key={result.id}>
                                  <TableCell>
                                    {result.resultData?.timestamp 
                                      ? new Date(result.resultData.timestamp).toLocaleDateString()
                                      : '-'}
                                  </TableCell>
                                  <TableCell>{result.testType}</TableCell>
                                  <TableCell>
                                    {result.psychologistAssessment ? (
                                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                        Assessed
                                      </span>
                                    ) : (
                                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                        Pending
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                          View Details
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>Test Details</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <h3 className="font-medium">Test Information</h3>
                                            <div className="mt-2 grid grid-cols-2 gap-2">
                                              <span className="font-medium">Patient ID:</span>
                                              <span>{result.patientId}</span>
                                              <span className="font-medium">Test Type:</span>
                                              <span>{result.testType}</span>
                                              <span className="font-medium">Date:</span>
                                              <span>
                                                {result.resultData?.timestamp 
                                                  ? new Date(result.resultData.timestamp).toLocaleDateString()
                                                  : '-'}
                                              </span>
                                              <span className="font-medium">Status:</span>
                                              <span>
                                                {result.psychologistAssessment ? "Assessed" : "Pending Assessment"}
                                              </span>
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <h3 className="font-medium">Test Results</h3>
                                            <div className="mt-2 space-y-2">
                                              {result.resultData?.values && Object.entries(result.resultData.values).map(([key, value]) => (
                                                <div key={key} className="grid grid-cols-2 gap-2">
                                                  <span className="font-medium">{key}:</span>
                                                  <span>{value}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          
                                          {result.psychologistAssessment && (
                                            <div className="space-y-2">
                                              <h3 className="font-medium">Psychological Assessment</h3>
                                              <div className="p-4 border rounded-md bg-muted/50">
                                                {result.psychologistAssessment}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TabsContent>
                      <TabsContent value="assessments">
                        <div className="space-y-4">
                          {patientHistory.filter(result => result.psychologistAssessment).length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground">
                              No psychological assessments available for this patient
                            </div>
                          ) : (
                            patientHistory
                              .filter(result => result.psychologistAssessment)
                              .map(result => (
                                <Card key={result.id} className="overflow-hidden">
                                  <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <CardTitle className="text-base">{result.testType}</CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                          {result.resultData?.timestamp
                                            ? new Date(result.resultData.timestamp).toLocaleDateString()
                                            : '-'}
                                        </p>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-0">
                                    <div className="text-sm">
                                      {result.psychologistAssessment}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </PsychologistLayout>
  );
}