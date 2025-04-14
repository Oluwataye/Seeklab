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
            <Link href="/about">
              <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
              </a>
            </Link>
            <Link href="/contact">
              <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </Link>
            <Link href="/privacy">
              <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}