import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TechnicianLayout } from "@/components/layout/technician-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Loader2, Copy, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Result } from "@shared/schema";

const TEST_TYPES = [
  "Comprehensive Panel",
  "Blood Panel",
  "Lipid Panel", 
  "Drug Test"
];

export default function MockGenerator() {
  const { toast } = useToast();
  const [selectedTestType, setSelectedTestType] = useState("Comprehensive Panel");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Query to fetch existing mock results
  const { data: results = [], isLoading, refetch } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Get mock results created in the last 24 hours
  const recentResults = results.filter(r => {
    const createdDate = new Date(r.createdAt || new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return createdDate > yesterday;
  });

  // Mutation to generate a mock test result
  const generateMockMutation = useMutation({
    mutationFn: async (testType: string) => {
      const response = await fetch("/api/results/generate-mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testType }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate mock result");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Mock test result generated with code: ${data.accessCode}`,
      });
      
      // Invalidate the results query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Function to copy code to clipboard
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Copied!",
        description: "Access code copied to clipboard",
      });
      
      // Reset the copied state after 3 seconds
      setTimeout(() => setCopiedCode(null), 3000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      });
    }
  };

  // Function to handle generating a mock result
  const handleGenerateMock = () => {
    generateMockMutation.mutate(selectedTestType);
  };

  return (
    <TechnicianLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mock Test Results Generator</h1>
          <p className="text-muted-foreground mt-2">
            Generate mock test results for testing and demonstration purposes
          </p>
        </div>

        <Tabs defaultValue="generate">
          <TabsList>
            <TabsTrigger value="generate">Generate Mock Result</TabsTrigger>
            <TabsTrigger value="recent">Recent Mocks ({recentResults.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Mock Result</CardTitle>
                <CardDescription>
                  Generate a test result with random values based on the selected test type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="test-type">Test Type</Label>
                    <Select
                      value={selectedTestType}
                      onValueChange={setSelectedTestType}
                    >
                      <SelectTrigger id="test-type">
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEST_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Button 
                      onClick={handleGenerateMock} 
                      className="w-full"
                      disabled={generateMockMutation.isPending}
                    >
                      {generateMockMutation.isPending ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Generate Mock Result
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {generateMockMutation.isSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Mock Result Generated Successfully</AlertTitle>
                <AlertDescription className="flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div>
                      <p className="text-sm font-medium">Patient ID</p>
                      <p className="text-sm">{generateMockMutation.data.patientId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Access Code</p>
                      <div className="flex items-center">
                        <code className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-sm font-mono mr-2">
                          {generateMockMutation.data.accessCode}
                        </code>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6" 
                          onClick={() => copyToClipboard(generateMockMutation.data.accessCode)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Test Type</p>
                      <p className="text-sm">{generateMockMutation.data.testType}</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-fit"
                    onClick={() => {
                      // Copy to clipboard and navigate to home in a new tab
                      copyToClipboard(generateMockMutation.data.accessCode);
                      window.open('/', '_blank');
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy code and test on home page
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertTitle>How to use mock results</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal ml-4 mt-2 space-y-2">
                  <li>Select a test type from the dropdown and click "Generate Mock Result"</li>
                  <li>Copy the generated access code</li>
                  <li>Navigate to the <a href="/" target="_blank" className="text-primary hover:underline">home page</a> in a new tab</li>
                  <li>Enter the access code to view the mock test result</li>
                  <li>To demonstrate the review workflow, use the "Review Results" page as a lab scientist</li>
                </ol>
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="recent" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recently Generated Mock Results</CardTitle>
                <CardDescription>
                  View and access mock test results created in the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : recentResults.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No recent mock results found
                  </div>
                ) : (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Access Code</TableHead>
                          <TableHead>Patient ID</TableHead>
                          <TableHead>Test Type</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentResults.map((result) => {
                          const createdAt = new Date(result.createdAt || new Date());
                          return (
                            <TableRow key={result.id}>
                              <TableCell className="font-mono">
                                {result.accessCode}
                              </TableCell>
                              <TableCell>{result.patientId}</TableCell>
                              <TableCell>{result.testType}</TableCell>
                              <TableCell>{createdAt.toLocaleString()}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(result.accessCode)}
                                  >
                                    {copiedCode === result.accessCode ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.open('/', '_blank')}
                                  >
                                    <ArrowRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()}
                  className="ml-auto"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh List
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TechnicianLayout>
  );
}