import type { Metadata } from "next";
import { LegalLinks } from "@/components/LegalLinks";
import { TYPOGRAPHY_SITE } from "@/domains/typography/site";
export const metadata: Metadata = {
  title: TYPOGRAPHY_SITE.title,
  description: "98+ free typography tools: font previewer, pairing, type scales, glyphs, CSS and more. Fast, simple, free.",
  authors: [{ name: "Racira" }],
  openGraph: {
    title: TYPOGRAPHY_SITE.title,
    description: "98+ free typography tools in your browser.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TYPOGRAPHY_SITE.title,
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
