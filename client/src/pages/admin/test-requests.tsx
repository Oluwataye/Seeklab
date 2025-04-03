import React from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  FileText, 
  Filter, 
  Check, 
  AlertTriangle, 
  Clock, 
  Search,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminTestRequests() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [testTypeFilter, setTestTypeFilter] = React.useState<string | null>(null);
  const [currentTab, setCurrentTab] = React.useState("all");

  // Fetch test requests
  const { data: testRequests = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['/api/test-requests'],
    retry: 1,
  });

  // Fetch test types for filtering
  const { data: testTypes = [] } = useQuery<any[]>({
    queryKey: ['/api/test-types'],
    retry: 1,
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setTestTypeFilter(null);
  };

  // Filter and sort test requests
  const filteredRequests = React.useMemo(() => {
    if (!testRequests) return [];
    
    return testRequests
      .filter((request: any) => {
        // Search filter
        const searchMatch = !searchTerm || 
          request.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.requestId?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Status filter
        const statusMatch = !statusFilter || request.status === statusFilter;
        
        // Test type filter
        const testTypeMatch = !testTypeFilter || request.testTypeId === parseInt(testTypeFilter);
        
        // Tab filter
        const tabMatch = 
          (currentTab === "all") ||
          (currentTab === "pending" && request.status === "pending") ||
          (currentTab === "completed" && request.status === "completed") ||
          (currentTab === "in-progress" && request.status === "in-progress");
        
        return searchMatch && statusMatch && testTypeMatch && tabMatch;
      })
      .sort((a: any, b: any) => {
        // Sort by creation date (most recent first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [testRequests, searchTerm, statusFilter, testTypeFilter, currentTab]);

  // Function to get appropriate status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          In Progress
        </Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Check className="h-3 w-3 mr-1" />
          Completed
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Mock export function
  const exportRequests = () => {
    toast({
      title: "Export Initiated",
      description: "Test requests data is being prepared for export.",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Test Requests</h1>
            <p className="text-muted-foreground">
              View and manage test requests across all patients
            </p>
          </div>
          <Button onClick={exportRequests}>
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Test Requests</CardTitle>
            <CardDescription>View, filter, and search all test requests in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full" onValueChange={setCurrentTab}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <TabsList className="grid grid-cols-4 w-full md:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search requests..."
                      className="pl-8 w-[250px]"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                  
                  <Button variant="outline" size="icon" onClick={() => {
                    const dialog = document.getElementById('filter-dialog') as HTMLDialogElement;
                    if (dialog) dialog.showModal();
                  }}>
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Filter dialog */}
              <dialog id="filter-dialog" className="modal p-6 rounded-lg shadow-lg border bg-background w-full max-w-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Filter Test Requests</h3>
                    <Button variant="ghost" size="icon" onClick={() => {
                      const dialog = document.getElementById('filter-dialog') as HTMLDialogElement;
                      if (dialog) dialog.close();
                    }}>
                      &times;
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select value={statusFilter || ""} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status-filter">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="test-type-filter">Test Type</Label>
                    <Select value={testTypeFilter || ""} onValueChange={setTestTypeFilter}>
                      <SelectTrigger id="test-type-filter">
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Test Types</SelectItem>
                        {testTypes?.map((type: any) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                    <Button onClick={() => {
                      const dialog = document.getElementById('filter-dialog') as HTMLDialogElement;
                      if (dialog) dialog.close();
                    }}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </dialog>
              
              <TabsContent value="all" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Test Type</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading test requests...
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-red-500">
                            Error loading test requests.
                          </TableCell>
                        </TableRow>
                      ) : filteredRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No test requests found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRequests.map((request: any) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.requestId || `REQ-${request.id}`}</TableCell>
                            <TableCell>
                              <div className="font-medium">{request.patientName}</div>
                              <div className="text-sm text-muted-foreground">{request.patientId}</div>
                            </TableCell>
                            <TableCell>{request.testTypeName}</TableCell>
                            <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              {/* Each tab content is identical for this example */}
              <TabsContent value="pending" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Test Type</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading pending requests...
                          </TableCell>
                        </TableRow>
                      ) : filteredRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No pending requests found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRequests.map((request: any) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.requestId || `REQ-${request.id}`}</TableCell>
                            <TableCell>
                              <div className="font-medium">{request.patientName}</div>
                              <div className="text-sm text-muted-foreground">{request.patientId}</div>
                            </TableCell>
                            <TableCell>{request.testTypeName}</TableCell>
                            <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="in-progress" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Test Type</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading in-progress requests...
                          </TableCell>
                        </TableRow>
                      ) : filteredRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No in-progress requests found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRequests.map((request: any) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.requestId || `REQ-${request.id}`}</TableCell>
                            <TableCell>
                              <div className="font-medium">{request.patientName}</div>
                              <div className="text-sm text-muted-foreground">{request.patientId}</div>
                            </TableCell>
                            <TableCell>{request.testTypeName}</TableCell>
                            <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Test Type</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading completed requests...
                          </TableCell>
                        </TableRow>
                      ) : filteredRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No completed requests found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRequests.map((request: any) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.requestId || `REQ-${request.id}`}</TableCell>
                            <TableCell>
                              <div className="font-medium">{request.patientName}</div>
                              <div className="text-sm text-muted-foreground">{request.patientId}</div>
                            </TableCell>
                            <TableCell>{request.testTypeName}</TableCell>
                            <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}