import type { Metadata } from "next";
import { Providers } from "./providers";
import { LegalLinks } from "@/components/LegalLinks";
import { PRODUCTIVITY_SITE } from "@/domains/productivity/site";
import { TOTAL_TOOLS } from "@/domains/productivity/registry";

// Counts derive from the registry (TOTAL_TOOLS) — the old hardcoded "69"
// could drift from the actual catalog.
export const metadata: Metadata = {
  title: PRODUCTIVITY_SITE.title,
  description:
    `Racira is a library of ${TOTAL_TOOLS} free, no-login productivity tools for deep work, time blocking, habits, projects, writing, and creators.`,
  openGraph: {
    siteName: PRODUCTIVITY_SITE.copyrightName,
    title: PRODUCTIVITY_SITE.title,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: PRODUCTIVITY_SITE.title,
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
