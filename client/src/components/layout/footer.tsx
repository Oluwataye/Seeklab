import { Separator } from "../ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto py-4">
      <Separator className="mb-4" />
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        Copyright © 2025 T-TECH SOLUTION®. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
}