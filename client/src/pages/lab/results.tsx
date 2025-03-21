import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TechnicianLayout } from "@/components/layout/technician-layout";
import { Result, ResultTemplate } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function TestResults() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ResultTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { data: results = [], isLoading: resultsLoading } = useQuery<Result[]>({
    queryKey: ["/api/results"],
    staleTime: 1000 * 60, // 1 minute
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery<ResultTemplate[]>({
    queryKey: ["/api/result-templates"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateResultMutation = useMutation({
    mutationFn: async (data: { resultId: number; resultData: any }) => {
      const response = await fetch(`/api/results/${data.resultId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultData: data.resultData }),
      });
      if (!response.ok) throw new Error("Failed to update result");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      setSelectedResult(null);
      setSelectedTemplate(null);
      setFormData({});
      toast({
        title: "Success",
        description: "Test result has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredResults = results.filter(result =>
    result.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.accessCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTemplateSelect = (template: ResultTemplate) => {
    setSelectedTemplate(template);
    // Initialize form data with empty values for each field
    const initialData = template.fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: "",
    }), {});
    setFormData(initialData);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleUpdateResult = async () => {
    if (!selectedResult || !selectedTemplate) return;

    const resultData = {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      values: formData,
      timestamp: new Date().toISOString(),
    };

    updateResultMutation.mutate({
      resultId: selectedResult.id,
      resultData,
    });
  };

  const isFormValid = () => {
    if (!selectedTemplate) return false;
    return selectedTemplate.fields.every(field => {
      if (field.type === "number") {
        const value = parseFloat(formData[field.name]);
        const range = field.referenceRange?.split("-").map(Number);
        return !isNaN(value) && (!range || (value >= range[0] && value <= range[1]));
      }
      return formData[field.name]?.trim() !== "";
    });
  };

  return (
    <TechnicianLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Test Results</h1>

        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by Patient ID or Access Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {resultsLoading || templatesLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Access Code</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-mono">{result.accessCode}</TableCell>
                    <TableCell>{result.patientId}</TableCell>
                    <TableCell>{result.testType}</TableCell>
                    <TableCell>
                      {new Date(result.testDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={result.resultData ? "default" : "outline"}>
                        {result.resultData ? "Completed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedResult(result)}
                          >
                            {result.resultData ? "Update Result" : "Enter Result"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              {result.resultData ? "Update Test Result" : "Enter Test Result"}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid gap-4">
                              <div>
                                <Label>Patient ID: {result.patientId}</Label>
                              </div>
                              <div>
                                <Label>Test Type: {result.testType}</Label>
                              </div>
                              <div>
                                <Label>Select Template</Label>
                                <select
                                  className="w-full border rounded-md p-2 mt-1"
                                  onChange={(e) => {
                                    const template = templates.find(t => t.id === parseInt(e.target.value));
                                    if (template) handleTemplateSelect(template);
                                  }}
                                  value={selectedTemplate?.id || ""}
                                >
                                  <option value="">Choose a template...</option>
                                  {templates.map(template => (
                                    <option key={template.id} value={template.id}>
                                      {template.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {selectedTemplate && (
                              <div className="space-y-4 border rounded-lg p-4">
                                <h3 className="font-medium">{selectedTemplate.name}</h3>
                                {selectedTemplate.fields.map((field, index) => (
                                  <div key={index} className="space-y-2">
                                    <Label>
                                      {field.name}
                                      {field.unit && ` (${field.unit})`}
                                    </Label>
                                    {field.type === "number" ? (
                                      <Input
                                        type="number"
                                        value={formData[field.name] || ""}
                                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                        placeholder={field.referenceRange ? `Reference: ${field.referenceRange}` : ""}
                                      />
                                    ) : field.type === "options" ? (
                                      <select
                                        className="w-full border rounded-md p-2"
                                        value={formData[field.name] || ""}
                                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                      >
                                        <option value="">Select an option...</option>
                                        {field.options?.map((option, i) => (
                                          <option key={i} value={option}>
                                            {option}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <Input
                                        value={formData[field.name] || ""}
                                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                      />
                                    )}
                                    {field.referenceRange && (
                                      <p className="text-sm text-muted-foreground">
                                        Reference Range: {field.referenceRange}
                                      </p>
                                    )}
                                  </div>
                                ))}

                                <div className="space-y-2">
                                  <Label>Additional Notes</Label>
                                  <Textarea
                                    value={formData.notes || ""}
                                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                                    placeholder="Enter any additional observations or notes..."
                                  />
                                </div>
                              </div>
                            )}

                            <Button
                              onClick={handleUpdateResult}
                              disabled={!isFormValid() || updateResultMutation.isPending}
                              className="w-full"
                            >
                              {updateResultMutation.isPending && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              )}
                              Save Result
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </TechnicianLayout>
  );
}