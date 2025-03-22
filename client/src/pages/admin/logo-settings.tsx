import { useState } from 'react';
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

// Define schema for logo settings form
const logoSettingsSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  tagline: z.string().min(5, { message: "Tagline must be at least 5 characters." }),
  imageUrl: z.string().url({ message: "Must be a valid URL." }).or(z.literal('/logo.svg'))
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
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Branding Settings</CardTitle>
              <CardDescription>
                Update your organization's branding that appears throughout the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The URL to your organization's logo image. Default is /logo.svg
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="mt-4"
                    disabled={mutation.isPending || isLoading}
                  >
                    {mutation.isPending ? "Saving..." : "Save Changes"}
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
              <div className="p-4 border rounded-md">
                <h3 className="mb-2 text-sm font-medium">Header Logo (Default)</h3>
                <div className="bg-white p-4 flex items-center">
                  <BrandLogo variant="default" showText={true} />
                </div>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="mb-2 text-sm font-medium">Small Logo</h3>
                <div className="bg-white p-4 flex items-center">
                  <BrandLogo variant="small" showText={true} />
                </div>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="mb-2 text-sm font-medium">Large Logo</h3>
                <div className="bg-white p-4 flex items-center">
                  <BrandLogo variant="large" showText={true} />
                </div>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="mb-2 text-sm font-medium">Icon Only</h3>
                <div className="bg-white p-4 flex items-center">
                  <BrandLogo variant="default" showText={false} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}