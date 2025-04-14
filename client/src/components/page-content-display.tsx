import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type PageContent = {
  id: number;
  pageSlug: string;
  title: string;
  content: string;
  metaDescription?: string;
  updatedAt: string;
  updatedBy: string;
};

interface PageContentDisplayProps {
  slug: string;
  className?: string;
}

export function PageContentDisplay({ slug, className }: PageContentDisplayProps) {
  const [error, setError] = useState<string | null>(null);

  // Fetch page content by slug
  const { data: pageContent, isLoading, isError } = useQuery({
    queryKey: [`/api/page-contents/by-slug/${slug}`],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/page-contents/by-slug/${slug}`);
        return await response.json() as PageContent;
      } catch (error) {
        // Handle 404 specifically
        if ((error as any)?.message?.includes("404")) {
          setError(`No content found for "${slug}" page.`);
        } else {
          setError("Failed to load page content. Please try again later.");
        }
        throw error;
      }
    },
    retry: false, // Don't retry if the request fails
  });

  // Use document title with the page title if available
  useEffect(() => {
    if (pageContent?.title) {
      document.title = `${pageContent.title} | SeekLab`;
    }
  }, [pageContent]);

  // Loading state
  if (isLoading) {
    return (
      <div className={className}>
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  // Error state
  if (isError || error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || "Failed to load page content. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  // Render content - ensure pageContent exists
  if (!pageContent) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Notice</AlertTitle>
        <AlertDescription>Content for this page is not available.</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className={className}>
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{pageContent.title}</h1>
      <div 
        className="prose max-w-none dark:prose-invert 
                 prose-headings:scroll-mt-16 
                 prose-h1:text-xl sm:prose-h1:text-2xl
                 prose-h2:text-lg sm:prose-h2:text-xl
                 prose-p:text-sm sm:prose-p:text-base
                 prose-img:rounded-md prose-img:mx-auto
                 prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: pageContent.content }}
      />
    </div>
  );
}