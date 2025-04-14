import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileEdit, Plus, Trash2, Save } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getCSRFToken } from "@/lib/csrf";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// Define form schema
const pageContentSchema = z.object({
  pageSlug: z.string().min(2, "Slug must be at least 2 characters").max(64, "Slug cannot exceed 64 characters"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  metaDescription: z.string().optional(),
});

// Define update form schema (makes all fields optional)
const updatePageContentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  content: z.string().min(10, "Content must be at least 10 characters").optional(),
  metaDescription: z.string().optional(),
});

type PageContent = {
  id: number;
  pageSlug: string;
  title: string;
  content: string;
  metaDescription?: string;
  updatedAt: string;
  updatedBy: string;
};

function PageContentManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<PageContent | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [previewHtml, setPreviewHtml] = useState("");

  // Fetch page contents
  const { data: pageContents = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/page-contents"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/page-contents");
      return await response.json() as PageContent[];
    },
  });

  // Form for adding new page content
  const form = useForm<z.infer<typeof pageContentSchema>>({
    resolver: zodResolver(pageContentSchema),
    defaultValues: {
      pageSlug: "",
      title: "",
      content: "",
      metaDescription: "",
    },
  });

  // Form for editing existing page content
  const editForm = useForm<z.infer<typeof updatePageContentSchema>>({
    resolver: zodResolver(updatePageContentSchema),
    defaultValues: {
      title: "",
      content: "",
      metaDescription: "",
    },
  });

  // Mutation for creating page content
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof pageContentSchema>) => {
      const csrfToken = getCSRFToken();
      return apiRequest("POST", "/api/page-contents", values);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Page content created successfully",
      });
      setIsAddDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/page-contents"] });
    },
    onError: (error: any) => {
      console.error("Page content error:", error);
      const errorMessage = error.response?.data?.details || error.message || "Failed to create page content";
      toast({
        title: "Error Creating Page Content",
        description: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
        variant: "destructive",
      });
    },
  });

  // Mutation for updating page content
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; values: z.infer<typeof updatePageContentSchema> }) => {
      const { id, values } = data;
      return apiRequest("PATCH", `/api/page-contents/${id}`, values);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Page content updated successfully",
      });
      setIsEditDialogOpen(false);
      editForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/page-contents"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update page content",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting page content
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/page-contents/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Page content deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/page-contents"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete page content",
        variant: "destructive",
      });
    },
  });

  // Handle form submission for creating
  const onSubmit = (values: z.infer<typeof pageContentSchema>) => {
    createMutation.mutate(values);
  };

  // Handle form submission for editing
  const onEditSubmit = (values: z.infer<typeof updatePageContentSchema>) => {
    if (selectedPage) {
      updateMutation.mutate({ id: selectedPage.id, values });
    }
  };

  // Set up edit form when a page is selected
  useEffect(() => {
    if (selectedPage) {
      editForm.reset({
        title: selectedPage.title,
        content: selectedPage.content,
        metaDescription: selectedPage.metaDescription || "",
      });

      // Generate preview HTML
      setPreviewHtml(selectedPage.content);
    }
  }, [selectedPage, editForm]);

  // Function to select a page for editing
  const handleEdit = (page: PageContent) => {
    setSelectedPage(page);
    setIsEditDialogOpen(true);
  };

  // Function to select a page for deletion
  const handleDelete = (page: PageContent) => {
    setSelectedPage(page);
    setIsDeleteDialogOpen(true);
  };
  
  // Function to load page content from slug
  const getPageContentBySlug = async (slug: string) => {
    try {
      const response = await apiRequest("GET", `/api/page-contents/by-slug/${slug}`);
      return await response.json() as PageContent;
    } catch (error) {
      console.error('Error loading page content:', error);
      toast({
        title: "Error",
        description: "Failed to load page content",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update preview as user types in edit form
  const updatePreview = (content: string) => {
    setPreviewHtml(content);
  };

  // Filter pages based on the active tab
  const filteredPages = pageContents.filter(page => {
    if (activeTab === "all") return true;
    return page.pageSlug.includes(activeTab);
  });

  // Get all unique categories from page slugs
  const pageCategories = Array.from(
    new Set(pageContents.map(page => {
      const parts = page.pageSlug.split('/');
      return parts[0] || 'other';
    }))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Page Content Management</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Page
          </Button>
        </div>

        {/* Tabs for filtering pages by category */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Pages</TabsTrigger>
            {pageCategories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Information Alert */}
        <Alert className="mb-4">
          <AlertTitle>Managing Public Content</AlertTitle>
          <AlertDescription>
            Use this interface to manage the content for your public pages like About Us, 
            Contact, and Privacy Policy. Each page should have a unique slug that identifies 
            it in the system. For example, "about", "contact", or "privacy".
          </AlertDescription>
        </Alert>

        {/* Page content table */}
        <Card>
          <CardHeader>
            <CardTitle>Page Contents</CardTitle>
            <CardDescription>
              Manage the content for various pages on your website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading page contents...</div>
            ) : filteredPages.length === 0 ? (
              <div className="text-center py-4">No page contents found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page Slug</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.pageSlug}</TableCell>
                      <TableCell>{page.title}</TableCell>
                      <TableCell>{new Date(page.updatedAt).toLocaleString()}</TableCell>
                      <TableCell>{page.updatedBy}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(page)}
                          >
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(page)}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Page Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Add New Page Content</DialogTitle>
            <DialogDescription>
              Create content for a new page on your website. Provide a unique slug, title, and content.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="pageSlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Slug</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., about, contact, privacy" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This will be used in the URL to identify the page.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Page Title" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description (SEO)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description for search engines" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Optional but helpful for SEO.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Page content in HTML format" 
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      You can use HTML formatting for more control over the layout.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Saving..." : "Save Page Content"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Page Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Edit Page Content</DialogTitle>
            <DialogDescription>
              {selectedPage ? `Editing: ${selectedPage.title} (${selectedPage.pageSlug})` : "Edit page content"}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <Tabs defaultValue="edit">
                <TabsList className="mb-4">
                  <TabsTrigger value="edit">Edit Content</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Page Title" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description (SEO)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description for search engines" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Optional but helpful for SEO.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Page content in HTML format" 
                            className="min-h-[300px]"
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              updatePreview(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          You can use HTML formatting for more control over the layout.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <div className="border rounded-md p-4 min-h-[400px] overflow-auto bg-white">
                    <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Update Page Content"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the page content for "{selectedPage?.title}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedPage && deleteMutation.mutate(selectedPage.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Page Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default PageContentManagement;