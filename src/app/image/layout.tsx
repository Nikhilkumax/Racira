import type { Metadata } from "next";
import { LegalLinks } from "@/components/LegalLinks";

export const metadata: Metadata = {
  title: "Racira Image — Free Image Tools",
  description: "Image conversion, editing and processing tools in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      <>
        {children}
        <footer className="border-t border-border/60 py-8">
          <LegalLinks />
        </footer>
      </>
    
  );
}
