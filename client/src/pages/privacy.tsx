import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout/public-layout";

// Temporary Privacy page - to be fully implemented
export default function PrivacyPage() {
  return (
    <PublicLayout>
      {/* Privacy Policy Content */}
      <div className="flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
