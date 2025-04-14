import { AdminLayout } from "@/components/layout/admin-layout";
import { PaymentAuditLog } from "@/components/admin/payment-audit-log";
import { useEffect } from "react";

export default function PaymentAuditPage() {
  // Set page title directly
  useEffect(() => {
    document.title = "Payment Audit - Admin Dashboard";
  }, []);
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Payment Audit</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and verify payment transactions across the system
          </p>
        </div>

        <PaymentAuditLog />
      </div>
    </AdminLayout>
  );
}