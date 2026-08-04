import type { Metadata } from "next";
import { Providers } from "./providers";
import { TOTAL_TOOL_COUNT } from "@/domains/audio/registry";

export const metadata: Metadata = {
  title: "Racira Audio — All Audio Tools You Need, Fast, Simple & Free",
  description: `Racira Audio offers ${TOTAL_TOOL_COUNT}+ free online audio tools — convert, trim, record, clean, analyze and generate audio right in your browser.`,
  openGraph: {
    siteName: "Racira Audio",
    title: "Racira Audio — All Audio Tools You Need",
    description: `${TOTAL_TOOL_COUNT}+ free in-browser audio tools: converters, editors, effects, analyzers and more.`,
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
