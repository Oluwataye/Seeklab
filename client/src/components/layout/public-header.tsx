import { useState } from "react";
import { Link } from "wouter";
import { 
  Home, 
  CreditCard, 
  InfoIcon, 
  Mail, 
  Shield,
  Menu,
  X
} from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { href: "/", icon: <Home className="h-4 w-4" />, label: "Home" },
    { href: "/about", icon: <InfoIcon className="h-4 w-4" />, label: "About Us" },
    { href: "/contact", icon: <Mail className="h-4 w-4" />, label: "Contact" },
    { href: "/privacy", icon: <Shield className="h-4 w-4" />, label: "Privacy Policy" },
    { href: "/payment", icon: <CreditCard className="h-4 w-4" />, label: "Payment", highlight: true }
  ];

  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <BrandLogo showText={true} variant="default" />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`text-sm hover:text-primary flex items-center ${link.highlight ? 'font-medium' : ''}`}
            >
              <span className="mr-1">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="py-4">
                <div className="flex justify-between items-center mb-6">
                  <BrandLogo showText={false} variant="small" />
                </div>
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      className={`text-sm hover:text-primary flex items-center p-2 rounded-md ${link.highlight ? 'font-medium bg-primary/10' : ''}`}
                      onClick={() => document.body.click()} // Close sheet
                    >
                      <span className="mr-3">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
