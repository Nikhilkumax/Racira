import type { Metadata } from "next";
import { Providers } from "@/components/presentation/Providers";

export const metadata: Metadata = {
  title: "Racira Presentation Tools",
  description: "Free browser-based tools to build, design, and share presentations.",
  openGraph: {
    title: "Racira Presentation Tools",
    description: "Free browser-based tools to build, design, and share presentations.",
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
      </>
    
  );
}
