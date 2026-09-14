import type { Metadata } from "next";
import { Providers } from "./providers";
import { LegalLinks } from "@/components/LegalLinks";
import { totalCount } from "@/domains/cad/registry";

export const metadata: Metadata = {
  title: "CAD is fixed",
  description: `${totalCount}+ free CAD tools in your browser. No signup required.`,
  openGraph: {
    title: "CAD is fixed",
    description: `${totalCount}+ free CAD tools in your browser.`,
    type: "website",
  },
  twitter: {
    card: "summary",
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
