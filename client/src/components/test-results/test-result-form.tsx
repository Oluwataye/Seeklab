import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Result, ResultTemplate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TestResultFormProps {
  result: Result;
  templates: ResultTemplate[];
  onSuccess?: () => void;
  userRole: string;
  canDelete?: boolean;
}

export function TestResultForm({ 
  result, 
  templates, 
  onSuccess, 
  userRole,
  canDelete = false
}: TestResultFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // For template selection and form data
  const [selectedTemplate, setSelectedTemplate] = useState<ResultTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Find and set the initial template if result has data
  useEffect(() => {
    if (result.resultData?.templateId) {
      const template = templates.find(t => t.id === result.resultData?.templateId);
      if (template) {
        setSelectedTemplate(template);
        // Initialize form data with existing values
        if (result.resultData.values) {
          setFormData(
            Object.keys(result.resultData.values).reduce((acc, key) => {
              const value = result.resultData?.values[key];
              return { ...acc, [key]: value !== undefined ? String(value) : "" };
            }, {})
          );
        }
      }
    }
  }, [result, templates]);

  // Update result mutation
  const updateResultMutation = useMutation({
    mutationFn: async (data: { resultId: number; resultData: any }) => {
      const response = await fetch(`/api/results/${data.resultId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultData: data.resultData }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update result");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      toast({
        title: "Success",
        description: "Test result has been updated.",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete result mutation (for admin and lab scientist)
  const deleteResultMutation = useMutation({
    mutationFn: async (resultId: number) => {
      const response = await fetch(`/api/results/${resultId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete result");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/results"] });
      toast({
        title: "Success",
        description: "Test result has been deleted.",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTemplateSelect = (template: ResultTemplate) => {
    setSelectedTemplate(template);
    // Initialize form data with empty values or existing values if available
    if (result.resultData?.templateId === template.id && result.resultData.values) {
      setFormData(
        Object.keys(result.resultData.values).reduce((acc, key) => {
          const value = result.resultData?.values[key];
          return { ...acc, [key]: value !== undefined ? String(value) : "" };
        }, {})
      );
    } else {
      // Initialize with empty values
      const initialData = template.fields.reduce((acc, field) => ({
        ...acc,
        [field.name]: "",
      }), {});
      setFormData(initialData);
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a template first",
        variant: "destructive",
      });
      return;
    }

    const resultData = {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      values: formData,
      timestamp: new Date().toISOString(),
    };

    updateResultMutation.mutate({
      resultId: result.id,
      resultData,
    });
  };

  const handleDelete = () => {
    if (canDelete) {
      deleteResultMutation.mutate(result.id);
      setShowDeleteConfirm(false);
    }
  };

  // Check if required fields are filled
  const isFormValid = () => {
    if (!selectedTemplate) return false;
    return selectedTemplate.fields.every(field => {
      if (field.type === "number") {
        const value = parseFloat(formData[field.name] || "");
        return !isNaN(value);
      }
      return formData[field.name]?.trim() !== "";
    });
  };

  // Check if result was approved by a scientist
  const isApproved = result.scientistReview?.approved === true;
  
  // Check if user can edit (technicians can't edit approved results)
  const canEdit = userRole !== 'technician' || !isApproved;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Test Result for Patient: {result.patientId}</h3>
          <p className="text-sm text-muted-foreground">Test Type: {result.testType}</p>
        </div>
        <div className="flex space-x-2">
          {isApproved && (
            <Badge className="bg-green-600">Approved</Badge>
          )}
          {!isApproved && result.resultData && (
            <Badge variant="outline">Pending Approval</Badge>
          )}
          {!result.resultData && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              No Data
            </Badge>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Result Details</CardTitle>
          <CardDescription>
            Enter test results using the appropriate template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label>Select Template</Label>
              <select
                className="w-full border rounded-md p-2 mt-1"
                onChange={(e) => {
                  const template = templates.find(t => t.id === parseInt(e.target.value));
                  if (template) handleTemplateSelect(template);
                }}
                value={selectedTemplate?.id || ""}
                disabled={!canEdit || updateResultMutation.isPending}
              >
                <option value="">-- Select Template --</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </option>
                ))}
              </select>
            </div>
            
            {selectedTemplate && (
              <div className="space-y-4">
                <h4 className="font-medium">Enter Results</h4>
                
                {selectedTemplate.fields.map((field, index) => {
                  // Determine if there's an out-of-range value for number fields
                  const isOutOfRange = field.type === 'number' && field.referenceRange && formData[field.name] ? 
                    (() => {
                      const value = parseFloat(formData[field.name]);
                      const [min, max] = field.referenceRange.split('-').map(Number);
                      return !isNaN(value) && !isNaN(min) && !isNaN(max) && (value < min || value > max);
                    })() : false;
                    
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`field-${index}`} className="flex-grow">
                          {field.name}
                          {field.unit && <span className="text-muted-foreground ml-1">({field.unit})</span>}
                        </Label>
                        {field.referenceRange && (
                          <span className="text-xs text-muted-foreground">
                            Ref: {field.referenceRange}
                          </span>
                        )}
                      </div>
                      
                      <div className="relative">
                        {field.type === "options" && field.options ? (
                          <select
                            className={`w-full border rounded-md p-2 ${isOutOfRange ? 'border-red-500' : ''}`}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            disabled={!canEdit || updateResultMutation.isPending}
                            id={`field-${index}`}
                          >
                            <option value="">-- Select --</option>
                            {field.options.map((option, i) => (
                              <option key={i} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : field.type === "text" ? (
                          <Textarea
                            id={`field-${index}`}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            disabled={!canEdit || updateResultMutation.isPending}
                            className={isOutOfRange ? 'border-red-500' : ''}
                          />
                        ) : (
                          <Input
                            id={`field-${index}`}
                            type="number"
                            value={formData[field.name] || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            disabled={!canEdit || updateResultMutation.isPending}
                            className={isOutOfRange ? 'border-red-500' : ''}
                            step="any"
                          />
                        )}
                        
                        {isOutOfRange && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertCircle className="h-4 w-4 text-red-500 absolute right-3 top-1/2 -translate-y-1/2" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Value is outside reference range ({field.referenceRange})</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {selectedTemplate.interpretationGuidelines && (
                  <div className="bg-muted/50 p-3 rounded-md mt-4">
                    <h5 className="text-sm font-medium mb-1">Interpretation Guidelines</h5>
                    <p className="text-xs">{selectedTemplate.interpretationGuidelines}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {canDelete && (
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={updateResultMutation.isPending || deleteResultMutation.isPending}
                >
                  Delete Result
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-h-[90vh] overflow-y-auto custom-scrollbar">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the test result
                    for patient {result.patientId}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    {deleteResultMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <div className="flex-grow"></div>
          
          <Button
            onClick={handleSubmit}
            disabled={
              !canEdit || 
              !isFormValid() || 
              updateResultMutation.isPending || 
              deleteResultMutation.isPending
            }
          >
            {updateResultMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Results
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Display scientist review if available */}
      {result.scientistReview && (result.scientistReview.comments || result.scientistReview.approved) && (
        <Card className={`${result.scientistReview.approved ? 'border-green-300' : 'border-orange-300'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Scientific Review
              {result.scientistReview.approved && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                  Approved
                </Badge>
              )}
              {!result.scientistReview.approved && (
                <Badge variant="outline" className="ml-2 bg-orange-50 text-orange-700 border-orange-200">
                  Needs Revision
                </Badge>
              )}
            </CardTitle>
            {result.scientistReview.reviewedAt && (
              <CardDescription>
                Reviewed by {result.scientistReview.reviewedBy} on {
                  new Date(result.scientistReview.reviewedAt).toLocaleString()
                }
              </CardDescription>
            )}
          </CardHeader>
          {result.scientistReview.comments && (
            <CardContent>
              <p className="text-sm">{result.scientistReview.comments}</p>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}