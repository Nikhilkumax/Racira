import type { Metadata } from "next";
import Header from "@/components/Header";
import { Providers } from "@/components/colors/providers";


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
            <Header mode="category" categoryName="Colors" />
            {children}
          </div>
        </Providers>
      </>
    
  );
}
