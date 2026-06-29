import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Racira Audio — All Audio Tools You Need, Fast, Simple & Free",
  description: "Racira Audio offers 230+ free online audio tools — convert, trim, record, clean, analyze and generate audio right in your browser.",
  openGraph: {
    siteName: "Racira Audio",
    title: "Racira Audio — All Audio Tools You Need",
    description: "230+ free in-browser audio tools: converters, editors, effects, analyzers and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Racira Audio — All Audio Tools You Need",
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
