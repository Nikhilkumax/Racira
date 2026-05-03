import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h2 className="text-4xl font-bold tracking-tight">404 - Page Not Found</h2>
      <p className="mt-4 text-muted-foreground">
        The tool or page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="mt-8" variant="hero">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
