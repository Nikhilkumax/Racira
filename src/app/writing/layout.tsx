import type { Metadata } from "next";
import { Providers } from "@/components/writing/Providers";

export const metadata: Metadata = {
  title: "Racira Writing — 150+ Free Writing Tools",
  description: "AI writing, grammar, paraphrasing, summarizing and content tools. 150+ free writing tools in your browser. No signup required.",
  authors: [{ name: "Racira" }],
  openGraph: {
    title: "Racira Writing — Free Writing Tools",
    description: "150+ free writing tools in your browser. No signup required.",
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@Racira",
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
      </>
    
  );
}
