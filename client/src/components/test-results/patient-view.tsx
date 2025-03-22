import { useState } from "react";
import { Result } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generatePDF } from "@/lib/pdf-generator";
import { Loader2, Download, FileText, AlertTriangle, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PatientResultViewProps {
  result: Result;
  onPrint?: () => void;
}

export function PatientResultView({ result, onPrint }: PatientResultViewProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintPDF = async () => {
    setIsPrinting(true);
    
    try {
      const element = document.getElementById(`result-${result.id}`);
      if (!element) throw new Error("Could not find element to print");
      
      await generatePDF(element, {
        filename: `medical_result_${result.accessCode}.pdf`,
        pageTitle: `Medical Test Result - ${result.testType}`,
        watermark: true
      });
      
      if (onPrint) onPrint();
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  // Format a date string
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if result data is available
  const hasResultData = result.resultData && 
    result.resultData.values && 
    Object.keys(result.resultData.values).length > 0;
  
  // Check if scientist has approved the result
  const isApproved = result.scientistReview?.approved === true;

  return (
    <div id={`result-${result.id}`} className="space-y-4 print:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold print:text-2xl">
            Test Results: {result.testType}
          </h3>
          <p className="text-sm text-muted-foreground print:text-base">
            Patient ID: {result.patientId} • Test Date: {formatDate(result.testDate)}
          </p>
          <p className="text-xs text-muted-foreground print:text-sm">
            Result Code: {result.accessCode}
          </p>
        </div>
        <div className="flex space-x-2 print:hidden">
          {isApproved ? (
            <Badge className="bg-green-600">Verified Result</Badge>
          ) : hasResultData ? (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              Preliminary Result
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
              Pending Results
            </Badge>
          )}
        </div>
        <div className="hidden print:block">
          <Badge variant={isApproved ? "default" : "outline"} className="print:text-black print:border-black">
            {isApproved ? "Verified Result" : "Preliminary Result"}
          </Badge>
        </div>
      </div>
      
      {!hasResultData && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-amber-800">Results Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-800 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800">
                  Your test results are still being processed by our laboratory. Please check back later.
                </p>
                <p className="text-xs text-amber-700 mt-2">
                  Results typically take 24-48 hours to process after sample collection.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {hasResultData && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {result.resultData?.templateName || result.testType} Results
              </CardTitle>
              {!isApproved && (
                <CardDescription className="text-amber-700">
                  These are preliminary results that have not yet been verified by a laboratory scientist.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-sm">Test</th>
                      <th className="text-left py-2 font-medium text-sm">Result</th>
                      <th className="text-left py-2 font-medium text-sm">Reference Range</th>
                      <th className="text-left py-2 font-medium text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.resultData && Object.entries(result.resultData.values).map(([key, value], index) => {
                      // Find corresponding field from template to get reference range
                      const templateField = result.resultData?.templateId 
                        ? { name: key, referenceRange: '' } // Fallback
                        : { name: key, referenceRange: '' };
                      
                      let status = 'Normal';
                      let statusColor = 'text-green-600';
                      
                      if (templateField.referenceRange && typeof value === 'number') {
                        const [min, max] = templateField.referenceRange.split('-').map(Number);
                        if (!isNaN(min) && !isNaN(max)) {
                          if (value < min) {
                            status = 'Low';
                            statusColor = 'text-amber-600';
                          } else if (value > max) {
                            status = 'High';
                            statusColor = 'text-red-600';
                          }
                        }
                      }
                      
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-3 text-sm">{key}</td>
                          <td className="py-3 text-sm font-medium">{value}</td>
                          <td className="py-3 text-sm text-muted-foreground">
                            {templateField.referenceRange || 'N/A'}
                          </td>
                          <td className={`py-3 text-sm ${statusColor}`}>
                            {status}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="print:hidden">
              <Button
                variant="outline"
                onClick={handlePrintPDF}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {!isApproved && (
            <div className="mt-4 text-sm text-muted-foreground print:hidden">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>
                  This result is preliminary and has not been verified by a laboratory scientist.
                  Please check back later for the final verified results.
                </span>
              </div>
            </div>
          )}
          
          {isApproved && result.scientistReview?.reviewedAt && (
            <div className="mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>
                  Result verified by {result.scientistReview.reviewedBy} on{" "}
                  {new Date(result.scientistReview.reviewedAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}