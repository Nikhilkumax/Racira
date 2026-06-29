import type { Metadata } from "next";
import { Providers } from "@/components/animator/providers";
import Link from "next/link";
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

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          <span className="text-gradient-pink">Racira</span> <span className="text-foreground">Animation</span>
        </Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">All tools</Link>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    
      <>
        <Providers>
          <Header />
          {children}
          <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
            Built with <span className="text-gradient-pink font-semibold">Racira Animation</span> · 106 tools · no signup
          </footer>
        </Providers>
      </>
    
  );
}
