import { Link } from "wouter";
import { 
  Home, 
  CreditCard, 
  InfoIcon, 
  Mail, 
  Shield, 
  LogIn 
} from "lucide-react";
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
            <Link href="/about" className="text-sm hover:text-primary">
              <InfoIcon className="h-4 w-4 inline mr-1" />
              About Us
            </Link>
            <Link href="/contact" className="text-sm hover:text-primary">
              <Mail className="h-4 w-4 inline mr-1" />
              Contact
            </Link>
            <Link href="/privacy" className="text-sm hover:text-primary">
              <Shield className="h-4 w-4 inline mr-1" />
              Privacy Policy
            </Link>
            <Link href="/payment" className="text-sm hover:text-primary font-medium">
              <CreditCard className="h-4 w-4 inline mr-1" />
              Payment
            </Link>
          </nav>
        </div>
        <Link href="/auth" className="text-sm text-primary hover:underline flex items-center gap-1">
          <LogIn className="h-4 w-4" />
          Staff Login
        </Link>
      </div>
    </header>
  );
}
