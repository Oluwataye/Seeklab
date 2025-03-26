import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { EdecLayout } from "@/components/layout/edec-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Loader2, 
  Search, 
  ClipboardList, 
  Filter, 
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  CheckCheck
} from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Result {
  id: number;
  patientId: string;
  accessCode: string;
  testType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  accessCount: number;
  resultData: any;
  scientistReview?: {
    approved: boolean;
    comments: string;
    reviewedBy: string;
    reviewedAt: string;
  };
}

export default function TestRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: results, isLoading } = useQuery({
    queryKey: ['/api/results'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Navigate to patient details
  const viewPatientDetails = (patientId: string) => {
    setCurrentPatientId(patientId);
    // This would typically navigate to a patient details page
    // For now, we'll show a toast notification
    toast({
      title: "Patient Details",
      description: `Redirecting to details for patient ${patientId}`,
    });
    
    // Simulate navigation delay (would be replaced with actual navigation)
    setTimeout(() => {
      window.location.href = `/edec/patients?patientId=${patientId}`;
    }, 1000);
  };
  
  const handleCopyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCode(code);
        toast({
          title: "Access Code Copied",
          description: "The access code has been copied to your clipboard",
        });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopiedCode(null);
        }, 2000);
      })
      .catch(err => {
        console.error("Failed to copy access code:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy access code to clipboard",
        });
      });
  };

  const filteredResults = React.useMemo(() => {
    if (!results) return [];
    
    return results.filter((result: Result) => {
      // Apply status filter
      if (statusFilter !== "all" && result.status !== statusFilter) {
        return false;
      }
      
      // Apply search filter
      const searchLower = searchTerm.toLowerCase();
      return (
        result.patientId.toLowerCase().includes(searchLower) ||
        result.accessCode.toLowerCase().includes(searchLower) ||
        result.testType.toLowerCase().includes(searchLower)
      );
    });
  }, [results, searchTerm, statusFilter]);

  function getStatusBadge(status: string) {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "review":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
            <ClipboardList className="h-3 w-3" />
            In Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {status}
          </Badge>
        );
    }
  }
  
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }

  return (
    <EdecLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Test Requests</h1>
            <p className="text-muted-foreground">
              Manage and track patient test requests
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button asChild variant="outline" size="sm">
              <Link href="/edec/dashboard">
                Dashboard
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/edec/verify-payment">
                Verify Payment
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Request Management</CardTitle>
            <CardDescription>
              Track and manage all test requests in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by patient ID, access code..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground mr-2">Status:</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="review">In Review</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <p className="text-sm text-muted-foreground mt-2 md:mt-0 md:ml-auto">
                {filteredResults.length} request{filteredResults.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Access Code</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {searchTerm || statusFilter !== "all"
                          ? "No test requests match your filters"
                          : "No test requests have been created yet"
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((result: Result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          {result.patientId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {result.accessCode}
                        </TableCell>
                        <TableCell>
                          {result.testType}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(result.createdAt)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(result.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions <ChevronDown className="ml-2 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Link href={`/results/${result.accessCode}`}>
                                  View Result
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleCopyAccessCode(result.accessCode)}>
                                <div className="flex items-center">
                                  {copiedCode === result.accessCode ? 
                                    <CheckCheck className="mr-2 h-4 w-4 text-green-600" /> : 
                                    <Copy className="mr-2 h-4 w-4" />
                                  }
                                  Copy Access Code
                                </div>
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => viewPatientDetails(result.patientId)}>
                                <div className="flex items-center">
                                  {currentPatientId === result.patientId ? 
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                                    <UserPlus className="mr-2 h-4 w-4" />
                                  }
                                  View Patient Details
                                </div>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <div className="flex flex-col">
              <h3 className="text-sm font-medium mb-1">Test Request Statistics</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  Completed: {results?.filter((r: Result) => r.status === 'completed').length || 0}
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                  Pending: {results?.filter((r: Result) => r.status === 'pending').length || 0}
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                  In Review: {results?.filter((r: Result) => r.status === 'review').length || 0}
                </div>
              </div>
            </div>
            
            <Button asChild>
              <Link href="/edec/verify-payment">
                Verify New Payment
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </EdecLayout>
  );
}