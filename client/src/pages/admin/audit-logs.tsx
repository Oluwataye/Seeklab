import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { AuditLog } from "@shared/schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AuditLogs() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId.toLowerCase().includes(searchTerm.toLowerCase());

    const logDate = new Date(log.createdAt);
    const afterStartDate = startDate ? logDate >= new Date(startDate) : true;
    const beforeEndDate = endDate ? logDate <= new Date(endDate) : true;

    return matchesSearch && afterStartDate && beforeEndDate;
  });

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "User ID", "Action", "Entity Type", "Entity ID", "IP Address", "Details"],
      ...filteredLogs.map(log => [
        new Date(log.createdAt).toLocaleString(),
        log.userId,
        log.action,
        log.entityType,
        log.entityId || "",
        log.ipAddress || "",
        JSON.stringify(log.details || {})
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: "Audit logs have been downloaded as CSV.",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>System Audit Logs</CardTitle>
              <Button onClick={exportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Input
                    type="text"
                    placeholder="Search by user, action, or entity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>

              {/* Logs Table */}
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Entity ID</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.userId}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            log.action === 'CREATE' ? 'text-green-600' :
                            log.action === 'UPDATE' ? 'text-blue-600' :
                            log.action === 'DELETE' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell>{log.entityType}</TableCell>
                        <TableCell>{log.entityId}</TableCell>
                        <TableCell>{log.ipAddress}</TableCell>
                        <TableCell>
                          {log.details && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <pre className="text-xs">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}