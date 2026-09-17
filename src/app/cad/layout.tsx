import type { Metadata } from "next";
import { Providers } from "./providers";
import { LegalLinks } from "@/components/LegalLinks";
import { totalCount } from "@/domains/cad/registry";
import { CAD_SITE } from "@/domains/cad/site";

export const metadata: Metadata = {
  title: CAD_SITE.title,
  description: `${totalCount}+ free CAD tools in your browser. No signup required.`,
  openGraph: {
    title: CAD_SITE.title,
    description: `${totalCount}+ free CAD tools in your browser.`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: CAD_SITE.title,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <>
        <Providers>{children}</Providers>
        <footer className="border-t border-border/60 py-8">
          <LegalLinks />
        </footer>
      </>
    
  );
}
