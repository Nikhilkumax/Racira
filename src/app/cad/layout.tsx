import type { Metadata } from "next";
import { Providers } from "./providers";
import { LegalLinks } from "@/components/LegalLinks";

export const metadata: Metadata = {
  title: "Racira CAD",
  description: "108+ free CAD tools in your browser. No signup required.",
  openGraph: {
    title: "Racira CAD",
    description: "108+ free CAD tools in your browser.",
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
