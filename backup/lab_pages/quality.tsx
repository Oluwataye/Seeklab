import { TechnicianLayout } from "@/components/layout/technician-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function QualityControl() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);

  const runQualityChecks = async () => {
    setIsRunning(true);
    try {
      // Simulate quality checks
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Quality Check Complete",
        description: "All systems are operating within normal parameters.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete quality checks",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <TechnicianLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Quality Control</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipment Status</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Operational</div>
              <p className="text-xs text-muted-foreground">
                All equipment calibrated and ready
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Control Samples</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Valid</div>
              <p className="text-xs text-muted-foreground">
                Control samples within acceptable range
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">None</div>
              <p className="text-xs text-muted-foreground">
                No quality issues in last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button 
            onClick={runQualityChecks} 
            disabled={isRunning}
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Checks...
              </>
            ) : (
              'Run Quality Checks'
            )}
          </Button>
        </div>
      </div>
    </TechnicianLayout>
  );
}
