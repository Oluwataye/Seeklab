import { Separator } from "../ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto py-4">
      <Separator className="mb-4" />
      <div className="container mx-auto">
        <div className="text-center text-sm text-muted-foreground">
          © 2025 T-Tech General Services. All rights reserved.
        </div>
      </div>
    </footer>
  );
}