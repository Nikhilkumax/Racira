import type { Metadata } from "next";
import Header from "@/components/Header";

import { Footer } from "@/components/video/Footer";
import { VIDEO_SITE } from "@/domains/video/site";

export const metadata: Metadata = {
  title: VIDEO_SITE.copyrightName,
  description: "All-in-one video tools that run in your browser.",
  openGraph: {
    title: VIDEO_SITE.copyrightName,
  },
  twitter: {
    card: "summary",
    title: VIDEO_SITE.copyrightName,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      
      <>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Header mode="category" categoryName="Video" />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </>
    
  );
}
