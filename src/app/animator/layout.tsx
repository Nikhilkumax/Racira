import type { Metadata } from "next";
import { Providers } from "@/domains/animator/components/providers";
import Header from "@/components/Header";
import { type ReactNode } from "react";

export const metadata: Metadata = {
  title: "Racira Animation — 106 free animation tools",
  description: "All animation tools you need — fast, simple & free. 106 browser-based animation tools. No signup required.",
  openGraph: {
    title: "Racira Animation — 106 free animation tools",
    description: "All animation tools you need — fast, simple & free.",
    type: "website",
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
            Built with <span className="text-gradient-pink font-semibold">Racira Animation</span> · 106 tools · no signup
          </footer>
        </Providers>
      </>
    
  );
}
