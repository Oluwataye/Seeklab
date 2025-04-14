import { PublicLayout } from "@/components/layout/public-layout";
import { PageContentDisplay } from "@/components/page-content-display";

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto py-8 px-4">
        <PageContentDisplay 
          slug="contact" 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto"
        />
      </div>
    </PublicLayout>
  );
}