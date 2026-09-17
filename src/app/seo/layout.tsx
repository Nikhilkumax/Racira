import type { Metadata } from "next";
import { Providers } from "@/domains/seo/components/providers";
import { LegalLinks } from "@/components/LegalLinks";
import { SEO_SITE } from "@/domains/seo/site";

export const metadata: Metadata = {
  title: SEO_SITE.title,
  description: "230 free SEO tools in one place: keyword analysis, on-page audits, technical SEO, schema, SERP previews and more. No signup required.",
  openGraph: {
    title: SEO_SITE.title,
    description: "All the SEO tools you need in one fast, simple workspace. No signup required.",
  },
  twitter: {
    card: "summary",
    title: SEO_SITE.title,
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
