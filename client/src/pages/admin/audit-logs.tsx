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
import { Calendar } from "@/components/ui/calendar";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data for demonstration
const mockLogs = [
  {
    id: 1,
    timestamp: new Date().toISOString(),
    user: "admin",
    action: "Generated 10 access codes",
    ipAddress: "192.168.1.1",
  },
  {
    id: 2,
    timestamp: new Date().toISOString(),
    user: "lab_tech1",
    action: "Submitted test result",
    ipAddress: "192.168.1.2",
  },
];

export default function AuditLogs() {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isLoading] = useState(false);

  const exportLogs = () => {
    // TODO: Implement log export functionality
    toast({
      title: "Export started",
      description: "Your logs will be downloaded shortly.",
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
                    placeholder="Search by user or action..."
                    className="max-w-sm"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    placeholder="Start Date"
                    onChange={(e) =>
                      setStartDate(e.target.value ? new Date(e.target.value) : undefined)
                    }
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    placeholder="End Date"
                    onChange={(e) =>
                      setEndDate(e.target.value ? new Date(e.target.value) : undefined)
                    }
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
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.ipAddress}</TableCell>
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
