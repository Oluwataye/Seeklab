import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, Clock } from "lucide-react";
import type { Result } from "@shared/schema";

export default function Results() {
  const [, navigate] = useLocation();
  const result = (window.history.state?.state?.result as Result | undefined);

  useEffect(() => {
    if (!result) {
      navigate("/");
      return;
    }

    // Auto-expire after 5 minutes
    const timeout = setTimeout(() => {
      navigate("/");
    }, 5 * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [result, navigate]);

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-bold">Seek Labs</div>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-destructive"
          >
            Close Results
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Patient Information</h2>
                  <p className="text-muted-foreground">Patient #{result.patientId}</p>
                  <p className="text-muted-foreground">
                    Test Date: {new Date(result.testDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Test Results</h2>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <pre className="whitespace-pre-wrap">{result.resultData}</pre>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button asChild>
                    <a href={result.reportUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" />
                      Download Full Report (PDF)
                    </a>
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h2 className="font-semibold">Next Steps</h2>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li>• Review your results with your healthcare provider</li>
                    <li>• For questions about your results, contact our lab at 1-800-SEEK-LAB</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Results are confidential
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Session expires in 5 minutes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
