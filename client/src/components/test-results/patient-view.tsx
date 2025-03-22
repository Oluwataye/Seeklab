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
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
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
            Patient ID: {result.patientId} • Test Date: {formatDate(result.testDate.toString())}
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
                {result.resultData?.templateName === "12-Panel Drug Test" ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-semibold mb-3">Drug Test Results</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
                        {result.resultData && Object.entries(result.resultData.values)
                          .filter(([key]) => !['Specimen Validity', 'Oxidant', 'Specific Gravity', 'pH', 'Nitrite', 'Creatinine', 'Comments'].includes(key))
                          .map(([key, value], index) => {
                            let resultClass = 'text-gray-700';
                            if (value === 'Presumptive Positive') {
                              resultClass = 'text-red-600 font-semibold';
                            } else if (value === 'Negative') {
                              resultClass = 'text-green-600';
                            }
                            
                            return (
                              <div key={index} className="flex justify-between pb-1 border-b border-gray-200">
                                <span className="text-sm">{key}</span>
                                <span className={`text-sm ${resultClass}`}>{value}</span>
                              </div>
                            );
                        })}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-semibold mb-3">Specimen Validity Tests</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
                        {result.resultData && Object.entries(result.resultData.values)
                          .filter(([key]) => ['Specimen Validity', 'Oxidant', 'Specific Gravity', 'pH', 'Nitrite', 'Creatinine'].includes(key))
                          .map(([key, value], index) => {
                            let resultClass = 'text-gray-700';
                            if (value === 'Abnormal' || value === 'Invalid') {
                              resultClass = 'text-red-600 font-semibold';
                            } else if (value === 'Normal' || value === 'Valid') {
                              resultClass = 'text-green-600';
                            }
                            
                            return (
                              <div key={index} className="flex justify-between pb-1 border-b border-gray-200">
                                <span className="text-sm">{key}</span>
                                <span className={`text-sm ${resultClass}`}>{value}</span>
                              </div>
                            );
                        })}
                      </div>
                    </div>
                    
                    {result.resultData?.values?.Comments && (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-semibold mb-2">Comments</h4>
                        <p className="text-sm whitespace-pre-wrap">{result.resultData.values.Comments}</p>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-300 text-sm">
                      <p className="font-medium text-blue-800 mb-1">Important Note</p>
                      <p className="text-blue-700">
                        This is a preliminary drug screening test. Presumptive positive results should be confirmed with a more specific method such as GC/MS (Gas Chromatography/Mass Spectrometry).
                      </p>
                    </div>
                  </div>
                ) : (
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
                )}
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