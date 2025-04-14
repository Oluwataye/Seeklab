import { AdminLayout } from "@/components/layout/admin-layout";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

interface ResultTemplate {
  id: number;
  name: string;
  category: string;
  fields: {
    name: string;
    type: "number" | "text" | "options";
    unit?: string;
    referenceRange?: string;
    options?: string[];
  }[];
  interpretationGuidelines: string;
}

const predefinedTemplates = [
  {
    name: "Substance Abuse Screening Test",
    category: "Toxicology",
    fields: [
      // Requesting Facility Information
      { 
        name: "Requesting Facility", 
        type: "text"
      },
      { 
        name: "Facility Address", 
        type: "text"
      },
      { 
        name: "Facility Phone", 
        type: "text"
      },
      { 
        name: "Facility Email", 
        type: "text"
      },
      
      // Patient Information
      { 
        name: "Patient ID/Student ID", 
        type: "text"
      },
      { 
        name: "Patient Sex", 
        type: "options", 
        options: ["Male", "Female", "Other"] 
      },
      
      // Test Request Details
      { 
        name: "Date of Request", 
        type: "text"
      },
      { 
        name: "Requested By", 
        type: "text"
      },
      { 
        name: "Relationship to Patient", 
        type: "options", 
        options: ["Parent/Guardian", "School Official", "Healthcare Provider", "Self", "Other"] 
      },
      
      // Reason for Test
      { 
        name: "Reason for Test", 
        type: "options", 
        options: ["Routine School Screening", "Clinical Assessment", "Behavioral Concerns", "Follow-Up Test", "Suspected Substance Use", "Other"] 
      },
      { 
        name: "Reason Details", 
        type: "text"
      },
      
      // Test Type
      { 
        name: "Test Type", 
        type: "options", 
        options: ["Urine Drug Test", "Saliva Drug Test", "Breath Alcohol Test", "Blood Test", "Other"] 
      },
      
      // Substance Test Results
      { 
        name: "Cannabis (THC)", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      { 
        name: "Cocaine", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"]  
      },
      { 
        name: "Opioids", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      { 
        name: "Amphetamines", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      { 
        name: "Benzodiazepines", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      { 
        name: "Tramadol", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      { 
        name: "Other Substance", 
        type: "text"
      },
      { 
        name: "Other Substance Result", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      
      // Lab Use Section
      { 
        name: "Sample Received", 
        type: "options", 
        options: ["Yes", "No"] 
      },
      { 
        name: "Date & Time Collected", 
        type: "text"
      },
      { 
        name: "Collected By", 
        type: "text"
      },
      { 
        name: "Lab Technician", 
        type: "text"
      },
      {
        name: "Specimen Validity",
        type: "options",
        options: ["Valid", "Invalid", "Not Tested"]
      },
      {
        name: "Specific Gravity",
        type: "options",
        options: ["Normal", "Abnormal", "Not Tested"]
      },
      {
        name: "pH",
        type: "options",
        options: ["Normal", "Abnormal", "Not Tested"]
      },
      { 
        name: "Comments", 
        type: "text" 
      },
    ],
    interpretationGuidelines: "This is a preliminary substance abuse screening test. Presumptive positive results should be confirmed with a more specific method such as GC/MS (Gas Chromatography/Mass Spectrometry). Negative results do not necessarily indicate the absence of substance metabolites below the detection threshold. This test is performed in accordance with standard laboratory protocols and may be used for educational, clinical, or diagnostic purposes as indicated by the requesting facility.",
  },
  {
    name: "12-Panel Drug Test",
    category: "Toxicology",
    fields: [
      { 
        name: "Amphetamines (AMP)", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      { 
        name: "Barbiturates (BAR)", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      { 
        name: "Benzodiazepines (BZO)", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      { 
        name: "Cannabis (THC)", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      { 
        name: "Cocaine (COC)", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"]  
      },
      { 
        name: "Methadone (MTD)", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      { 
        name: "Methaqualone (MQL)", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      { 
        name: "Opiates (OPI)", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      { 
        name: "Phencyclidine (PCP)", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"]  
      },
      { 
        name: "Propoxyphene (PPX)", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      { 
        name: "Ecstasy (MDMA)", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      { 
        name: "Oxycodone (OXY)", 
        type: "options", 
        options: ["Negative", "Presumptive Positive", "Not Tested"] 
      },
      {
        name: "Specimen Validity",
        type: "options",
        options: ["Valid", "Invalid", "Not Tested"]
      },
      {
        name: "Oxidant",
        type: "options",
        options: ["Normal", "Abnormal", "Not Tested"]
      },
      {
        name: "Specific Gravity",
        type: "options",
        options: ["Normal", "Abnormal", "Not Tested"]
      },
      {
        name: "pH",
        type: "options",
        options: ["Normal", "Abnormal", "Not Tested"]
      },
      {
        name: "Nitrite",
        type: "options",
        options: ["Normal", "Abnormal", "Not Tested"]
      },
      {
        name: "Creatinine",
        type: "options",
        options: ["Normal", "Abnormal", "Not Tested"]
      },
      { 
        name: "Comments", 
        type: "text" 
      },
    ],
    interpretationGuidelines: "This is a preliminary drug screening test. Presumptive positive results should be confirmed with a more specific method such as GC/MS (Gas Chromatography/Mass Spectrometry). Negative results do not necessarily indicate the absence of drug metabolites below the detection threshold.",
  },
  {
    name: "Complete Blood Count (CBC)",
    category: "Hematology",
    fields: [
      { name: "Hemoglobin", type: "number", unit: "g/dL", referenceRange: "12.0-15.5" },
      { name: "Hematocrit", type: "number", unit: "%", referenceRange: "36-45" },
      { name: "White Blood Cells", type: "number", unit: "K/µL", referenceRange: "4.5-11.0" },
      { name: "Red Blood Cells", type: "number", unit: "M/µL", referenceRange: "4.0-5.2" },
      { name: "Platelets", type: "number", unit: "K/µL", referenceRange: "150-450" },
      { name: "Mean Corpuscular Volume", type: "number", unit: "fL", referenceRange: "80-96" },
    ],
    interpretationGuidelines: "Evaluate for anemia, infection, and platelet disorders. Check for abnormal cell morphology.",
  },
  {
    name: "Basic Metabolic Panel (BMP)",
    category: "Chemistry",
    fields: [
      { name: "Glucose", type: "number", unit: "mg/dL", referenceRange: "70-100" },
      { name: "Calcium", type: "number", unit: "mg/dL", referenceRange: "8.5-10.5" },
      { name: "Sodium", type: "number", unit: "mEq/L", referenceRange: "135-145" },
      { name: "Potassium", type: "number", unit: "mEq/L", referenceRange: "3.5-5.0" },
      { name: "CO2", type: "number", unit: "mEq/L", referenceRange: "22-29" },
      { name: "Chloride", type: "number", unit: "mEq/L", referenceRange: "96-106" },
      { name: "BUN", type: "number", unit: "mg/dL", referenceRange: "7-20" },
      { name: "Creatinine", type: "number", unit: "mg/dL", referenceRange: "0.6-1.2" },
    ],
    interpretationGuidelines: "Assess kidney function, electrolyte balance, and blood sugar levels.",
  },
  {
    name: "Psychological Assessment",
    category: "Mental Health",
    fields: [
      { 
        name: "Mood Scale", 
        type: "options",
        options: ["Normal", "Mildly Depressed", "Moderately Depressed", "Severely Depressed"]
      },
      { 
        name: "Anxiety Level", 
        type: "options",
        options: ["Minimal", "Mild", "Moderate", "Severe"]
      },
      { name: "Sleep Quality", type: "number", unit: "hours", referenceRange: "6-9" },
      { name: "Concentration", type: "options", options: ["Poor", "Fair", "Good", "Excellent"] },
      { name: "Clinical Observations", type: "text" },
    ],
    interpretationGuidelines: "Evaluate overall mental health status, mood patterns, and any concerning behaviors.",
  },
  {
    name: "Cognitive Function Test",
    category: "Neurology",
    fields: [
      { name: "Memory Score", type: "number", unit: "points", referenceRange: "24-30" },
      { name: "Processing Speed", type: "number", unit: "seconds", referenceRange: "15-30" },
      { 
        name: "Attention Level", 
        type: "options",
        options: ["Poor", "Below Average", "Average", "Above Average", "Excellent"]
      },
      { name: "Executive Function", type: "number", unit: "score", referenceRange: "85-115" },
      { name: "Behavioral Notes", type: "text" },
    ],
    interpretationGuidelines: "Assess cognitive abilities, memory function, and attention span. Note any significant deviations from age-appropriate norms.",
  },
];

export default function ResultTemplates() {
  const { toast } = useToast();
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<ResultTemplate>>({
    name: "",
    category: "",
    fields: [],
    interpretationGuidelines: "",
  });

  const { data: templates = [], isLoading } = useQuery<ResultTemplate[]>({
    queryKey: ["/api/result-templates"],
  });

  const addFieldToTemplate = () => {
    setCurrentTemplate(prev => ({
      ...prev,
      fields: [
        ...(prev.fields || []),
        { name: "", type: "number", unit: "", referenceRange: "" }
      ]
    }));
  };

  const updateField = (index: number, field: Partial<ResultTemplate["fields"][0]>) => {
    setCurrentTemplate(prev => ({
      ...prev,
      fields: prev.fields?.map((f, i) => i === index ? { ...f, ...field } : f) || []
    }));
  };

  const removeField = (index: number) => {
    setCurrentTemplate(prev => ({
      ...prev,
      fields: prev.fields?.filter((_, i) => i !== index) || []
    }));
  };

  const saveTemplateMutation = useMutation({
    mutationFn: async (template: Partial<ResultTemplate>) => {
      const response = await fetch("/api/result-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error("Failed to save template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/result-templates"] });
      setIsAddingTemplate(false);
      setCurrentTemplate({
        name: "",
        category: "",
        fields: [],
        interpretationGuidelines: "",
      });
      toast({
        title: "Success",
        description: "Template saved successfully",
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Result Templates</h1>
          <Dialog open={isAddingTemplate} onOpenChange={setIsAddingTemplate}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Result Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={currentTemplate.name}
                      onChange={(e) =>
                        setCurrentTemplate((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Complete Blood Count"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={currentTemplate.category}
                      onChange={(e) =>
                        setCurrentTemplate((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      placeholder="e.g., Hematology"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Fields</Label>
                  {currentTemplate.fields?.map((field, index) => (
                    <div key={index} className="grid gap-2 p-4 border rounded-lg">
                      <div className="flex justify-between">
                        <Input
                          value={field.name}
                          onChange={(e) =>
                            updateField(index, { name: e.target.value })
                          }
                          placeholder="Field name"
                          className="flex-1 mr-2"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeField(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Type</Label>
                          <select
                            value={field.type}
                            onChange={(e) =>
                              updateField(index, {
                                type: e.target.value as "number" | "text" | "options",
                              })
                            }
                            className="w-full border rounded-md p-2"
                          >
                            <option value="number">Number</option>
                            <option value="text">Text</option>
                            <option value="options">Options</option>
                          </select>
                        </div>
                        {field.type === "number" && (
                          <>
                            <div>
                              <Label>Unit</Label>
                              <Input
                                value={field.unit}
                                onChange={(e) =>
                                  updateField(index, { unit: e.target.value })
                                }
                                placeholder="e.g., g/dL"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Reference Range</Label>
                              <Input
                                value={field.referenceRange}
                                onChange={(e) =>
                                  updateField(index, {
                                    referenceRange: e.target.value,
                                  })
                                }
                                placeholder="e.g., 12.0-15.5"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addFieldToTemplate}
                    className="w-full"
                  >
                    Add Field
                  </Button>
                </div>

                <div>
                  <Label htmlFor="guidelines">Interpretation Guidelines</Label>
                  <Textarea
                    id="guidelines"
                    value={currentTemplate.interpretationGuidelines}
                    onChange={(e) =>
                      setCurrentTemplate((prev) => ({
                        ...prev,
                        interpretationGuidelines: e.target.value,
                      }))
                    }
                    placeholder="Enter guidelines for result interpretation..."
                    className="h-32"
                  />
                </div>

                <Button
                  onClick={() => saveTemplateMutation.mutate(currentTemplate)}
                  disabled={saveTemplateMutation.isPending}
                  className="w-full"
                >
                  Save Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Predefined Templates */}
          {predefinedTemplates.map((template, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Fields:</p>
                  <ul className="list-disc list-inside text-sm">
                    {template.fields.map((field, index) => (
                      <li key={index}>
                        {field.name}
                        {field.unit && ` (${field.unit})`}
                        {field.referenceRange &&
                          ` - Range: ${field.referenceRange}`}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Custom Templates */}
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Fields:</p>
                  <ul className="list-disc list-inside text-sm">
                    {template.fields.map((field, index) => (
                      <li key={index}>
                        {field.name}
                        {field.unit && ` (${field.unit})`}
                        {field.referenceRange &&
                          ` - Range: ${field.referenceRange}`}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}