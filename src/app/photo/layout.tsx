import type { Metadata } from "next";
import { Providers } from "./providers";
import { LegalLinks } from "@/components/LegalLinks";
import { PHOTO_SITE, PHOTO_TOOL_COUNT } from "@/domains/photo/site";

// Count derives from the registry (ALL_TOOLS) — the old hardcoded "112"
// could drift from the actual catalog.
export const metadata: Metadata = {
  title: PHOTO_SITE.title,
  description: `${PHOTO_TOOL_COUNT} free photography tools: RAW processing, exposure, color grading, composition, lens math, EXIF, printing and forensics. Fast, simple, in-browser.`,
  openGraph: {
    title: PHOTO_SITE.title,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      
      <>
        <Providers>
          {children}
        </Providers>
        <footer className="border-t border-border/60 py-8">
          <LegalLinks />
        </footer>
      </>
    
  );
}
