import type { Metadata } from "next";
import { Providers } from "@/domains/seo/components/providers";
import { LegalLinks } from "@/components/LegalLinks";

export const metadata: Metadata = {
  title: "Racira SEO — All SEO Tools You Need, Fast, Simple & Free",
  description: "230 free SEO tools in one place: keyword analysis, on-page audits, technical SEO, schema, SERP previews and more. No signup required.",
  openGraph: {
    title: "Racira SEO — 230 free SEO tools",
    description: "All the SEO tools you need in one fast, simple workspace. No signup required.",
  }
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
