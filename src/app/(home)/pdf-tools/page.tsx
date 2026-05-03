import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "PDF Tools — Coming Soon",
  description: "Advanced PDF tools for merging, splitting, and converting documents directly in your browser. Coming soon to Racira.",
};

export default function PdfToolsComingSoon() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="rounded-full bg-primary/10 p-4 mb-6">
        <span className="text-4xl">📄</span>
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">PDF Tools</h1>
      <p className="mt-4 text-xl text-muted-foreground">Coming Soon</p>
      <p className="mt-6 max-w-md text-muted-foreground">
        We're building a powerful suite of PDF utilities that work entirely in your browser. 
        No uploads, no privacy concerns.
      </p>
      <Button asChild className="mt-10" variant="hero">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
