import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Racira Security & Privacy — 175 Free In-Browser Tools",
  description: "Passwords, cryptography, hashing, encoding, JWT, CSP, privacy checklists — 175 free security & privacy tools running entirely in your browser.",
  openGraph: {
    title: "Racira Security & Privacy",
    description: "175 free security & privacy tools. Fast, simple, in-browser. No signup.",
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@Lovable",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      <>
        {children}
        <Toaster />
      </>
    
  );
}
