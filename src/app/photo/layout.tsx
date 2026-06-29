import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Racira Photography — 112 free photography tools",
  description: "112 free photography tools: RAW processing, exposure, color grading, composition, lens math, EXIF, printing and forensics. Fast, simple, in-browser.",
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
