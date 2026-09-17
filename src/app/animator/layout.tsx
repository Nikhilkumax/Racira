import type { Metadata } from "next";
import { Providers } from "@/domains/animator/components/providers";
import Header from "@/components/Header";
import { LegalLinks } from "@/components/LegalLinks";
import { ANIMATOR_SITE } from "@/domains/animator/site";
import { totalCount } from "@/domains/animator/registry";
import { type ReactNode } from "react";

// Counts derive from the registry (totalCount) — the old hardcoded "106"
// could drift from the actual catalog.
export const metadata: Metadata = {
  title: ANIMATOR_SITE.title,
  description: `All animation tools you need — fast, simple & free. ${totalCount} browser-based animation tools. No signup required.`,
  openGraph: {
    title: ANIMATOR_SITE.title,
    description: "All animation tools you need — fast, simple & free.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: ANIMATOR_SITE.title,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    
      <>
        <Providers>
          <Header mode="category" categoryName="Animation" />
          {children}
          <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
            <p>Built with <span className="text-gradient-pink font-semibold">{ANIMATOR_SITE.copyrightName}</span> · no signup</p>
            <LegalLinks className="mt-4" />
          </footer>
        </Providers>
      </>
    
  );
}
