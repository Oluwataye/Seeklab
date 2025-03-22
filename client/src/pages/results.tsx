import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Printer, 
  Download, 
  ArrowLeft,
  Check,
  Loader2
} from "lucide-react";
import type { Result } from "@shared/schema";
import { PublicLayout } from "@/components/layout/public-layout";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from "@/lib/pdf-generator";
import { BrandLogo } from "@/components/brand/logo";
import { PatientResultView } from "@/components/test-results/patient-view";

export default function Results() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);
  const [result, setResult] = useState<Result | undefined>(window.history.state?.state?.result);
  const reportRef = useRef<HTMLDivElement>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  // Fetch logo settings
  const { data: logoSettings } = useQuery({
    queryKey: ['/api/settings/logo'],
    // Default logo settings if API fails
    initialData: {
      imageUrl: '/logo.svg',
      name: 'SeekLab',
      tagline: 'Medical Lab Results Management',
    }
  });

  // Mutation to fetch results by code if not in state
  const fetchResultMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/results/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to access results");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to access results",
        variant: "destructive",
      });
      setTimeout(() => navigate("/"), 1500);
    }
  });

  // Attempt to get result from localStorage if not in state
  useEffect(() => {
    if (!result) {
      const lastCode = localStorage.getItem('lastAccessedCode');
      
      if (lastCode) {
        // Try to get from localStorage cache first
        const cachedData = localStorage.getItem(`result-${lastCode}`);
        if (cachedData) {
          try {
            const parsedCache = JSON.parse(cachedData);
            if (parsedCache.result) {
              setResult(parsedCache.result);
              return;
            }
          } catch (e) {
            console.error("Error parsing cached result:", e);
          }
        }
        
        // If not in cache, fetch from server
        fetchResultMutation.mutate(lastCode);
      } else {
        navigate("/");
      }
      return;
    }

    // Auto-expire after 5 minutes
    const expiryInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(expiryInterval);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(expiryInterval);
  }, [result, navigate, fetchResultMutation]);

  // Redirect if expired
  useEffect(() => {
    if (isExpired) {
      setTimeout(() => {
        navigate("/");
      }, 3000); // Give user a chance to see the expiry message
    }
  }, [isExpired, navigate]);

  // Handle print action
  const handlePrint = () => {
    window.print();
  };
  
  // Handle PDF generation and download
  const handlePdfDownload = async () => {
    if (!reportRef.current || !logoSettings) return;
    
    try {
      setGeneratingPdf(true);
      
      // Cache the result in localStorage for future reference
      if (result) {
        try {
          const lastCode = result.accessCode;
          localStorage.setItem('lastAccessedCode', lastCode);
          localStorage.setItem(`result-${lastCode}`, JSON.stringify({ 
            result,
            timestamp: Date.now() 
          }));
        } catch (e) {
          console.warn('Failed to cache result', e);
        }
      }
      
      // Generate PDF with the current logo settings
      await generatePDF(reportRef.current, {
        filename: `${result?.patientId || 'patient'}_results_${new Date().toISOString().split('T')[0]}.pdf`,
        logoUrl: logoSettings.imageUrl,
        organization: logoSettings.name,
        pageTitle: 'Test Results Report',
        watermark: true
      });
      
      toast({
        title: "Success",
        description: "PDF report has been generated and downloaded.",
      });
      
      // Log the download (without sensitive info)
      try {
        const analyticsData = {
          event: 'pdf_download',
          testType: result?.testType,
          timestamp: new Date().toISOString()
        };
        console.info('Download analytics:', analyticsData);
      } catch (e) {
        // Quiet failure for analytics
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Format values for display
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!result) {
    if (fetchResultMutation.isPending) {
      return (
        <PublicLayout>
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-lg">Loading test results...</p>
          </div>
        </PublicLayout>
      );
    }
    return null;
  }

  // Calculate progress percentage (5 minutes = 300 seconds)
  const progressPercentage = (timeLeft / 300) * 100;

  // Determine if test was approved by a scientist
  const isApproved = result.scientistReview?.approved;

  return (
    <PublicLayout>
      {isExpired ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Session Expired</h2>
            <p className="text-muted-foreground mb-6">
              For your security, your session has timed out after 5 minutes of inactivity.
            </p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              Session expires in {formatTimeLeft()}
            </div>
          </div>
          
          <div className="mb-4">
            <Progress value={progressPercentage} className="h-1" />
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="shadow-sm print:shadow-none" ref={reportRef}>
              <CardHeader className="print:pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Test Results Report</CardTitle>
                    <p className="text-muted-foreground mt-1">
                      Access Code: <span className="font-mono">{result.accessCode}</span>
                    </p>
                  </div>
                  <Badge className={isApproved === undefined ? "bg-yellow-500" : 
                          isApproved ? "bg-green-500" : "bg-red-500"}>
                    {isApproved === undefined ? "Pending Review" : 
                     isApproved ? "Approved" : "Rejected"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="p-4 border border-gray-100 rounded-lg bg-white">
                  {/* Using the PatientResultView component */}
                  <div className="max-w-full">
                    {result && (
                      <div 
                        className="patient-result-view" 
                        data-testid="patient-result-view"
                      >
                        <PatientResultView 
                          result={result} 
                          onPrint={handlePdfDownload}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {result.psychologistAssessment && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Psychologist Assessment</h3>
                      <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                        {result.psychologistAssessment}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  {result.reportUrl && (
                    <Button asChild>
                      <a 
                        href={result.reportUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        download="test_result.pdf"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Original Report
                      </a>
                    </Button>
                  )}
                  <Button 
                    onClick={handlePdfDownload}
                    disabled={generatingPdf}
                    className="lab-highlight"
                  >
                    {generatingPdf ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Branded PDF
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Results
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold">Next Steps</h3>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-blue-100 p-0.5 mt-0.5">
                        <Check className="h-3 w-3 text-blue-600" />
                      </span>
                      Review your results with your healthcare provider
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-blue-100 p-0.5 mt-0.5">
                        <Check className="h-3 w-3 text-blue-600" />
                      </span>
                      For questions about your results, contact our lab at 1-800-SEEK-LAB
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-blue-100 p-0.5 mt-0.5">
                        <Check className="h-3 w-3 text-blue-600" />
                      </span>
                      Save or print this report for your records
                    </li>
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground border-t gap-4 print:hidden">
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Results are confidential and protected by HIPAA regulations
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Secure connection
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Session expires in {formatTimeLeft()}
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </PublicLayout>
  );
}
