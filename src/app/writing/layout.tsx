import type { Metadata } from "next";
import { Providers } from "@/domains/writing/components/Providers";
import { LegalLinks } from "@/components/LegalLinks";
import { WRITING_SITE } from "@/domains/writing/site";
import { copyrightLine } from "@/lib/site-identity";
import { totalToolCount } from "@/domains/writing/registry";

// Counts derive from the registry (totalToolCount) — the old hardcoded "150+"
// could drift from the actual catalog.
export const metadata: Metadata = {
  title: WRITING_SITE.title,
  description: `AI writing, grammar, paraphrasing, summarizing and content tools. ${totalToolCount}+ free writing tools in your browser. No signup required.`,
  authors: [{ name: "Racira" }],
  openGraph: {
    title: WRITING_SITE.title,
    description: `${totalToolCount}+ free writing tools in your browser. No signup required.`,
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@Racira",
    title: WRITING_SITE.title,
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
          <p className="mb-3 text-center text-xs text-muted-foreground">{copyrightLine(WRITING_SITE)}</p>
          <LegalLinks />
        </footer>
      </>
    
  );
}
