import type { Metadata } from "next";
import { LegalLinks } from "@/components/LegalLinks";
import { TYPOGRAPHY_SITE } from "@/domains/typography/site";
import { categories } from "@/domains/typography/registry";
import { FONT_STYLESHEET } from "@/domains/typography/components/tools/fonts";

const TOTAL_FONT_TOOLS = categories.reduce((n, c) => n + c.tools.length, 0);

export const metadata: Metadata = {
  title: TYPOGRAPHY_SITE.title,
  description: `${TOTAL_FONT_TOOLS} free font tools: font previewer, pairing, type scales, glyphs, CSS and more. Fast, simple, free.`,
  authors: [{ name: "Racira" }],
  openGraph: {
    title: TYPOGRAPHY_SITE.title,
    description: `${TOTAL_FONT_TOOLS} free font tools in your browser.`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TYPOGRAPHY_SITE.title,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Preview font set — one stylesheet for every family the tools offer. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_STYLESHEET} />
      {children}
      <footer className="border-t border-border/60 py-8">
        <LegalLinks />
      </footer>
    </>
  );
}
