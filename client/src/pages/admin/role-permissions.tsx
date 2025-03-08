import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Shield } from "lucide-react";

const predefinedRoles = [
  {
    name: "Admin",
    description: "Full system access",
    permissions: ["all"],
    locked: true,
  },
  {
    name: "Lab Technician",
    description: "Can manage test results and patient records",
    permissions: ["create_test", "view_results", "edit_templates"],
    locked: true,
  },
  {
    name: "Viewer",
    description: "View-only access to test results",
    permissions: ["view_results"],
    locked: true,
  },
];

const availablePermissions = [
  { id: "create_test", label: "Create Tests" },
  { id: "view_results", label: "View Results" },
  { id: "edit_templates", label: "Edit Templates" },
  { id: "delete_codes", label: "Delete Access Codes" },
  { id: "manage_users", label: "Manage Users" },
];

export default function RolePermissions() {
  const { toast } = useToast();
  const [customRoles, setCustomRoles] = useState([]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Role & Permissions Management</CardTitle>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Role
              </Button>
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
                      className="flex items-start p-4 border rounded-lg"
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
                          <ul className="mt-1 text-sm text-muted-foreground">
                            {role.permissions.map((permission) => (
                              <li key={permission}>• {permission}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground italic">
                        System defined
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Permissions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Available Permissions
                </h3>
                <div className="grid gap-2">
                  {availablePermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox id={permission.id} />
                      <label
                        htmlFor={permission.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
