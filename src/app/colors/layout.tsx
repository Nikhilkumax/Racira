import type { Metadata } from "next";
import { Providers } from "@/components/colors/providers";
import { SiteHeader } from "@/components/colors/site-header";

export const metadata: Metadata = {
  title: "Racira Colors",
  description: "Racira Color Studio is a comprehensive application for color extraction, manipulation, and analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      <>
        <Providers>
          <div className="min-h-screen bg-background text-foreground">
            <SiteHeader />
            {children}
          </div>
        </Providers>
      </>
    
  );
}
