import { Separator } from "../ui/separator";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="mt-auto py-4 sm:py-6">
      <Separator className="mb-4 sm:mb-6" />
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            © 2025 T-Tech General Services. All rights reserved.
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link href="/about" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              About Us
            </Link>
            <Link href="/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Contact
            </Link>
            <Link href="/privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}