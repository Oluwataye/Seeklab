import { PublicHeader } from "./public-header";
import { Footer } from "./footer";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}