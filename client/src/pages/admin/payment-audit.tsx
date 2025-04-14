import { AdminLayout } from "@/components/layout/admin-layout";
import { PaymentAuditLog } from "@/components/admin/payment-audit-log";
import { Helmet } from 'react-helmet';

export default function PaymentAuditPage() {
  return (
    <AdminLayout>
      <Helmet>
        <title>Payment Audit - Admin Dashboard</title>
      </Helmet>
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