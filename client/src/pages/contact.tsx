import { PublicLayout } from "@/components/layout/public-layout";
import { PageContentDisplay } from "@/components/page-content-display";

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="mx-auto py-4 sm:py-6 md:py-8">
        <PageContentDisplay 
          slug="contact" 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 max-w-4xl mx-auto"
        />
      </div>
    </PublicLayout>
  );
}