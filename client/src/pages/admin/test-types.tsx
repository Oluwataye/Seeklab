import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TestType } from "@shared/schema";
import { Trash2, Pencil, Plus, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function TestTypes() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<TestType | null>(null);
  
  // Form states
  const [newTestType, setNewTestType] = useState({
    name: "",
    description: "",
    category: "",
    isActive: true
  });
  
  const [editTestType, setEditTestType] = useState({
    name: "",
    description: "",
    category: "",
    isActive: true
  });

  // Query to fetch test types
  const { 
    data: testTypes, 
    isLoading, 
    isError, 
    error
  } = useQuery({
    queryKey: ['/api/test-types'],
    retry: 1
  });

  // Mutation to create a new test type
  const createMutation = useMutation({
    mutationFn: async (data: typeof newTestType) => {
      return await apiRequest('/api/test-types', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test type created successfully",
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/test-types'] });
      setNewTestType({
        name: "",
        description: "",
        category: "",
        isActive: true
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create test type: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mutation to update a test type
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<TestType> }) => {
      return await apiRequest(`/api/test-types/${id}`, 'PATCH', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test type updated successfully",
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/test-types'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update test type: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mutation to delete a test type
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/test-types/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test type deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/test-types'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete test type: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Handler for creating a new test type
  const handleCreateTestType = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newTestType);
  };

  // Handler for updating a test type
  const handleUpdateTestType = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTestType) {
      updateMutation.mutate({
        id: selectedTestType.id,
        data: editTestType
      });
    }
  };

  // Handler for deleting a test type
  const handleDeleteTestType = () => {
    if (selectedTestType) {
      deleteMutation.mutate(selectedTestType.id);
    }
  };

  // Handler for opening the edit dialog
  const openEditDialog = (testType: TestType) => {
    setSelectedTestType(testType);
    setEditTestType({
      name: testType.name,
      description: testType.description || "",
      category: testType.category || "",
      isActive: testType.isActive
    });
    setIsEditDialogOpen(true);
  };

  // Handler for opening the delete dialog
  const openDeleteDialog = (testType: TestType) => {
    setSelectedTestType(testType);
    setIsDeleteDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Test Types Management</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add New Test Type
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Test Types</CardTitle>
            <CardDescription>
              Manage the test types available in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading test types...</span>
              </div>
            ) : isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Error loading test types: {error instanceof Error ? error.message : "Unknown error"}
                </AlertDescription>
              </Alert>
            ) : testTypes && testTypes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testTypes.map((testType: TestType) => (
                    <TableRow key={testType.id}>
                      <TableCell className="font-medium">{testType.name}</TableCell>
                      <TableCell>{testType.category || "—"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {testType.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={testType.isActive ? "default" : "outline"}>
                          {testType.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(testType)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(testType)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No test types found. Create one to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Test Type</DialogTitle>
              <DialogDescription>
                Add a new test type to the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTestType}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Complete Blood Count"
                    value={newTestType.name}
                    onChange={(e) => setNewTestType({ ...newTestType, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Hematology"
                    value={newTestType.category}
                    onChange={(e) => setNewTestType({ ...newTestType, category: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter a description of the test type"
                    value={newTestType.description}
                    onChange={(e) => setNewTestType({ ...newTestType, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={newTestType.isActive}
                    onCheckedChange={(checked: boolean) =>
                      setNewTestType({ ...newTestType, isActive: checked })
                    }
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Active
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Test Type
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Edit Test Type</DialogTitle>
              <DialogDescription>
                Update the test type details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateTestType}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    placeholder="e.g., Complete Blood Count"
                    value={editTestType.name}
                    onChange={(e) => setEditTestType({ ...editTestType, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    placeholder="e.g., Hematology"
                    value={editTestType.category}
                    onChange={(e) => setEditTestType({ ...editTestType, category: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    placeholder="Enter a description of the test type"
                    value={editTestType.description}
                    onChange={(e) => setEditTestType({ ...editTestType, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-isActive"
                    checked={editTestType.isActive}
                    onCheckedChange={(checked: boolean) =>
                      setEditTestType({ ...editTestType, isActive: checked })
                    }
                  />
                  <label
                    htmlFor="edit-isActive"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Active
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Test Type
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this test type? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedTestType && (
                <p className="text-center font-medium">
                  Test Type: <span className="text-destructive">{selectedTestType.name}</span>
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTestType}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete Test Type
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}