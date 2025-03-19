import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Mail, Phone } from "lucide-react";

// Temporary Contact page - to be fully implemented
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Seek Labs
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-sm hover:text-primary">
                <Home className="h-4 w-4 inline mr-1" />
                Home
              </Link>
              <Link href="/about" className="text-sm hover:text-primary">About Us</Link>
              <Link href="/contact" className="text-sm hover:text-primary font-medium">Contact</Link>
              <Link href="/privacy" className="text-sm hover:text-primary">Privacy Policy</Link>
            </nav>
          </div>
          <Link href="/auth" className="text-sm text-primary hover:underline">
            Lab Staff Login
          </Link>
        </div>
      </header>

      {/* Coming Soon Message */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-4">Contact Page</h1>
            <p className="text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-primary">About Us</Link>
                <Link href="/contact" className="block text-sm text-muted-foreground hover:text-primary">Contact</Link>
                <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Seek Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
