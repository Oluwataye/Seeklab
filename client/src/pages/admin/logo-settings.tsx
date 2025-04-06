import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BrandLogo } from "@/components/brand/logo";
import { Upload, Image as ImageIcon, Check, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Define schema for logo settings form
const logoSettingsSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  tagline: z.string().min(5, { message: "Tagline must be at least 5 characters." }),
  imageUrl: z.string()
    .min(1, { message: "Image URL is required" })
    // Accept both absolute URLs and relative paths starting with /
    .refine(val => val.startsWith('/') || val.startsWith('http'), {
      message: "Image URL must be a path starting with / or a full URL"
    })
});

interface LogoSettings {
  imageUrl: string;
  name: string;
  tagline: string;
}

type LogoSettingsFormValues = z.infer<typeof logoSettingsSchema>;

export default function LogoSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropDialog, setShowCropDialog] = useState(false);
  
  // Fetch current logo settings
  const { data: logoSettings, isLoading } = useQuery({
    queryKey: ['/api/settings/logo'],
    initialData: {
      name: 'SeekLab',
      tagline: 'Medical Lab Results Management',
      imageUrl: '/logo.svg'
    } as LogoSettings
  });

  // Form setup
  const form = useForm<LogoSettingsFormValues>({
    resolver: zodResolver(logoSettingsSchema),
    defaultValues: {
      name: logoSettings.name,
      tagline: logoSettings.tagline,
      imageUrl: logoSettings.imageUrl,
    },
  });

  // Logo upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('logo', file);
      
      console.log('Uploading file:', file.name, 'size:', file.size, 'type:', file.type);
      
      try {
        // Make sure cookies are included in the request for authentication
        const response = await fetch('/api/settings/logo/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include', // Important for auth cookies
          headers: {
            // Don't set Content-Type header when using FormData
            // It will be automatically set with the boundary parameter
            'Accept': 'application/json'
          }
        });
        
        console.log('Upload response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Upload failed with error:', errorData);
          throw new Error(errorData.message || 'Failed to upload logo');
        }
        
        const data = await response.json();
        console.log('Upload successful, received:', data);
        return data;
      } catch (error) {
        console.error('Error in upload mutation:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Logo uploaded",
        description: "Your logo has been uploaded successfully"
      });
      
      // Update the form with the new logo URL
      form.setValue('imageUrl', data.imageUrl, { 
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
      
      // Reset the file input and preview
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploadPreview(null);
      
      // Submit the form automatically to update the logo settings
      const currentSettings = {
        name: form.getValues('name'),
        tagline: form.getValues('tagline'),
        imageUrl: data.imageUrl
      };
      
      mutation.mutate(currentSettings);
      
      // Invalidate the logo settings query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/settings/logo'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo image",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Mutation for updating logo settings
  const mutation = useMutation({
    mutationFn: async (data: LogoSettingsFormValues) => {
      return apiRequest('POST', '/api/settings/logo', data);
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Logo settings have been successfully updated."
      });
      // Invalidate the logo settings query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/settings/logo'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update logo settings",
        variant: "destructive"
      });
    }
  });

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG or SVG image file",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "File too large",
        description: "Image file must be less than 2MB",
        variant: "destructive"
      });
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setUploadPreview(reader.result);
        setShowCropDialog(true);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle logo upload confirmation
  const handleUploadConfirm = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
      setShowCropDialog(false);
    }
  };
  
  // Cancel upload
  const handleCancelUpload = () => {
    setUploadPreview(null);
    setShowCropDialog(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form submission handler
  function onSubmit(data: LogoSettingsFormValues) {
    mutation.mutate(data);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logo Settings</h1>
          <p className="text-muted-foreground">
            Customize the application branding by updating the logo and text.
          </p>
        </div>
        
        <Separator />
        
        {/* Logo Preview Dialog */}
        <AlertDialog open={showCropDialog} onOpenChange={setShowCropDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Upload Logo</AlertDialogTitle>
              <AlertDialogDescription>
                Review your logo before uploading. The image will be used throughout the application and on reports.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="py-4">
              {uploadPreview && (
                <div className="border rounded-lg overflow-hidden bg-gray-50 p-4 flex justify-center">
                  <img 
                    src={uploadPreview} 
                    alt="Logo Preview" 
                    className="max-h-64 object-contain"
                  />
                </div>
              )}
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelUpload}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleUploadConfirm}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Upload Logo
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Branding Settings</CardTitle>
              <CardDescription>
                Update your organization's branding that appears throughout the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/svg+xml"
              />
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Logo Image</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className="flex items-center"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Logo
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="border rounded-md p-4 bg-gray-50 flex items-center justify-center">
                  <div className="relative p-4 bg-white rounded-md border">
                    <div className="h-20 w-40 flex items-center justify-center mb-2">
                      {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      ) : (
                        <img 
                          key={`${form.watch('imageUrl')}?t=${Date.now()}`} // Force re-render on URL change with cache buster
                          src={`${form.watch('imageUrl')}?t=${Date.now()}`} 
                          alt="Current logo" 
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            // If image fails to load, show a fallback icon
                            console.error(`Failed to load logo from ${form.watch('imageUrl')}`);
                            const target = e.target as HTMLImageElement;
                            target.src = '/logo.svg';
                          }}
                        />
                      )}
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      Current Logo Image
                    </p>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: PNG or SVG with transparent background. Max 2MB.
                </p>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the main name displayed in the logo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          A short description or slogan that appears under the name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Make Logo URL field completely optional */}
                  <div className="mb-2">
                    <h4 className="text-sm font-medium mb-1">Logo URL</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      This URL is automatically updated when you upload a new logo.
                    </p>
                    <div className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
                      {form.watch('imageUrl')}
                    </div>
                    <input type="hidden" {...form.register('imageUrl')} />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="mt-4"
                    disabled={mutation.isPending || isLoading || isUploading}
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                See how your branding will appear in different contexts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Create a LivePreview component that updates when the form changes */}
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="p-4 border rounded-md">
                    <h3 className="mb-2 text-sm font-medium">Header Logo (Default)</h3>
                    <div className="bg-white p-4 flex items-center">
                      {/* Use the form values directly for live preview */}
                      <div className="flex items-center gap-2">
                        <img 
                          key={`${form.watch('imageUrl')}?t=${Date.now()}-default`} 
                          src={`${form.watch('imageUrl')}?t=${Date.now()}`} 
                          alt={form.watch('name')}
                          className="h-8 w-8 rounded-sm object-contain"
                          onError={(e) => {
                            console.error(`Failed to load preview logo from ${form.watch('imageUrl')}`);
                            const target = e.target as HTMLImageElement;
                            target.src = '/logo.svg';
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-base">
                            {form.watch('name')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {form.watch('tagline')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <h3 className="mb-2 text-sm font-medium">Small Logo</h3>
                    <div className="bg-white p-4 flex items-center">
                      <div className="flex items-center gap-2">
                        <img 
                          key={`${form.watch('imageUrl')}?t=${Date.now()}-small`} 
                          src={`${form.watch('imageUrl')}?t=${Date.now()}`}  
                          alt={form.watch('name')}
                          className="h-6 w-6 rounded-sm object-contain"
                          onError={(e) => {
                            console.error(`Failed to load small logo from ${form.watch('imageUrl')}`);
                            const target = e.target as HTMLImageElement;
                            target.src = '/logo.svg';
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">
                            {form.watch('name')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <h3 className="mb-2 text-sm font-medium">Large Logo</h3>
                    <div className="bg-white p-4 flex items-center">
                      <div className="flex items-center gap-2">
                        <img 
                          key={`${form.watch('imageUrl')}?t=${Date.now()}-large`} 
                          src={`${form.watch('imageUrl')}?t=${Date.now()}`}  
                          alt={form.watch('name')}
                          className="h-12 w-12 rounded-sm object-contain"
                          onError={(e) => {
                            console.error(`Failed to load large logo from ${form.watch('imageUrl')}`);
                            const target = e.target as HTMLImageElement;
                            target.src = '/logo.svg';
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-xl">
                            {form.watch('name')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {form.watch('tagline')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <h3 className="mb-2 text-sm font-medium">Icon Only</h3>
                    <div className="bg-white p-4 flex items-center">
                      <div className="flex items-center">
                        <img 
                          key={`${form.watch('imageUrl')}?t=${Date.now()}-icon`} 
                          src={`${form.watch('imageUrl')}?t=${Date.now()}`}  
                          alt={form.watch('name')}
                          className="h-8 w-8 rounded-sm object-contain"
                          onError={(e) => {
                            console.error(`Failed to load icon logo from ${form.watch('imageUrl')}`);
                            const target = e.target as HTMLImageElement;
                            target.src = '/logo.svg';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}