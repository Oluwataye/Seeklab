import { Link } from "wouter";
import { Home, CreditCard } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";

export function PublicHeader() {
  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center">
            <BrandLogo showText={true} variant="default" />
          </Link>
          <nav className="flex space-x-6">
            <Link href="/" className="text-sm hover:text-primary">
              <Home className="h-4 w-4 inline mr-1" />
              Home
            </Link>
            <Link href="/about" className="text-sm hover:text-primary">About Us</Link>
            <Link href="/contact" className="text-sm hover:text-primary">Contact</Link>
            <Link href="/privacy" className="text-sm hover:text-primary">Privacy Policy</Link>
            <Link href="/payment" className="text-sm hover:text-primary font-medium">
              <CreditCard className="h-4 w-4 inline mr-1" />
              Payment
            </Link>
          </nav>
        </div>
        <Link href="/auth" className="text-sm text-primary hover:underline">
          Staff Login
        </Link>
      </div>
    </header>
  );
}
