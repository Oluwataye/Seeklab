import { Separator } from "../ui/separator";
import { BrandLogo } from "@/components/brand/logo";

export function Footer() {
  return (
    <footer className="mt-auto py-4">
      <Separator className="mb-4" />
      <div className="container mx-auto flex flex-col items-center gap-2">
        <BrandLogo variant="small" showText={false} />
        <div className="text-center text-sm text-muted-foreground">
          Copyright © 2025 T-TECH SOLUTION®. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}