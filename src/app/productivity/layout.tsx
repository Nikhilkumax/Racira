import type { Metadata } from "next";
import { Providers } from "./providers";
import { LegalLinks } from "@/components/LegalLinks";

export const metadata: Metadata = {
  title: "Racira Productivity Tools — 69 free focus & planning tools",
  description:
    "Racira is a library of 69 free, no-login productivity tools for deep work, time blocking, habits, projects, writing, and creators.",
  openGraph: {
    siteName: "Racira Productivity Tools",
    type: "website",
  },
  twitter: {
    card: "summary",
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
