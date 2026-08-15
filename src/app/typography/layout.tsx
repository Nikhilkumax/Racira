import type { Metadata } from "next";
import { LegalLinks } from "@/components/LegalLinks";
export const metadata: Metadata = {
  title: "Racira Typography — Free Typography Tools",
  description: "98+ free typography tools: font previewer, pairing, type scales, glyphs, CSS and more. Fast, simple, free.",
  authors: [{ name: "Racira" }],
  openGraph: {
    title: "Racira Typography — Free Typography Tools",
    description: "98+ free typography tools in your browser.",
    type: "website",
  },
  twitter: {
    card: "summary",
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
        <footer className="border-t border-border/60 py-8">
          <LegalLinks />
        </footer>
      </>
    
  );
}
