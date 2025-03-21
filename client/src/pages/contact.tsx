import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/layout/public-layout";

// Temporary Contact page - to be fully implemented
export default function ContactPage() {
  return (
    <PublicLayout>
      {/* Coming Soon Message */}
      <div className="flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-4">Contact Page</h1>
            <p className="text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
