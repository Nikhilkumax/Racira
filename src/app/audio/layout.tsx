import type { Metadata } from "next";
import { Providers } from "./providers";
import { TOTAL_TOOL_COUNT } from "@/domains/audio/registry";
import { LegalLinks } from "@/components/LegalLinks";
import { AUDIO_SITE } from "@/domains/audio/site";

export const metadata: Metadata = {
  title: AUDIO_SITE.title,
  description: `${AUDIO_SITE.copyrightName} offers ${TOTAL_TOOL_COUNT}+ free online audio tools — convert, trim, record, clean, analyze and generate audio right in your browser.`,
  openGraph: {
    siteName: AUDIO_SITE.copyrightName,
    title: AUDIO_SITE.title,
    description: `${TOTAL_TOOL_COUNT}+ free in-browser audio tools: converters, editors, effects, analyzers and more.`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: AUDIO_SITE.title,
  },
};
// NOTE: /audio page metadata (below) intentionally overrides the layout title
// with its own page-level title — see audio/page.tsx.

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
