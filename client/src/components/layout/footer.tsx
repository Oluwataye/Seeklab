import { Separator } from "../ui/separator";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="mt-auto py-6">
      <Separator className="mb-6" />
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 T-Tech General Services. All rights reserved.
          </div>
          
          <div className="flex gap-6">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              About Us
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Contact
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}