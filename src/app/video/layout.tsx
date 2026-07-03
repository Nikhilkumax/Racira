import type { Metadata } from "next";
import Header from "@/components/Header";

import { Footer } from "@/components/video/Footer";

export const metadata: Metadata = {
  title: "Racira Video",
  description: "All-in-one video tools that run in your browser.",
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
