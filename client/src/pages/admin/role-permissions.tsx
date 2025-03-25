import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Shield, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

const predefinedRoles = [
  {
    name: "Admin",
    description: "Full system access",
    permissions: ["all"],
    locked: true,
  },
  {
    name: "Psychologist",
    description: "View-only access to test results",
    permissions: ["view_results"],
    locked: true,
  },
  {
    name: "EDEC",
    description: "Electronic Data Entry Clerk for patient registration and payment verification",
    permissions: ["register_patients", "verify_payments", "manage_payments"],
    locked: true,
  },
];

const availablePermissions = [
  { id: "create_test", label: "Create Tests" },
  { id: "view_results", label: "View Results" },
  { id: "edit_templates", label: "Edit Templates" },
  { id: "delete_results", label: "Delete Results" },
  { id: "manage_users", label: "Manage Users" },
  { id: "view_audit_logs", label: "View Audit Logs" },
  { id: "generate_codes", label: "Generate Access Codes" },
  { id: "register_patients", label: "Register Patients" },
  { id: "verify_payments", label: "Verify Payments" },
  { id: "manage_payments", label: "Manage Payment Settings" },
];

interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export default function RolePermissions() {
  const { toast } = useToast();
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState<Partial<CustomRole>>({
    name: "",
    description: "",
    permissions: [],
  });

  const { data: customRoles = [], isLoading } = useQuery<CustomRole[]>({
    queryKey: ["/api/roles"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createRoleMutation = useMutation({
    mutationFn: async (role: Partial<CustomRole>) => {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(role),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create role");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setIsAddRoleOpen(false);
      setNewRole({ name: "", description: "", permissions: [] });
      toast({
        title: "Success",
        description: "Role created successfully",
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

  const handlePermissionToggle = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions?.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...(prev.permissions || []), permissionId],
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Role & Permissions Management</CardTitle>
              <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Custom Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Role Name</label>
                      <Input
                        value={newRole.name}
                        onChange={e => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter role name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        value={newRole.description}
                        onChange={e => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter role description"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Permissions</label>
                      <div className="grid grid-cols-2 gap-2">
                        {availablePermissions.map(permission => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={newRole.permissions?.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <label
                              htmlFor={permission.id}
                              className="text-sm font-medium leading-none"
                            >
                              {permission.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => createRoleMutation.mutate(newRole)}
                      disabled={createRoleMutation.isPending}
                    >
                      {createRoleMutation.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Create Role
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Predefined Roles */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Predefined Roles</h3>
                <div className="grid gap-4">
                  {predefinedRoles.map((role) => (
                    <div
                      key={role.name}
                      className="flex items-start p-4 border rounded-lg bg-white shadow-sm"
                    >
                      <div className="mr-4">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{role.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {role.description}
                        </p>
                        <div className="mt-2">
                          <p className="text-sm font-medium">Permissions:</p>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {role.permissions.map((permission) => (
                              <div
                                key={permission}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox checked disabled />
                                <label className="text-sm">
                                  {permission === "all"
                                    ? "Full Access"
                                    : availablePermissions.find((p) => p.id === permission)?.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground italic">
                        System defined
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Roles */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Custom Roles</h3>
                  <div className="grid gap-4">
                    {customRoles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-start p-4 border rounded-lg bg-white shadow-sm"
                      >
                        <div className="mr-4">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{role.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {role.description}
                          </p>
                          <div className="mt-2">
                            <p className="text-sm font-medium">Permissions:</p>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {role.permissions.map((permission) => (
                                <div
                                  key={permission}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox checked disabled />
                                  <label className="text-sm">
                                    {availablePermissions.find((p) => p.id === permission)?.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}