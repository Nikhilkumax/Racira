import { ThemeProvider } from "@/components/finance/theme-provider";
import { QueryProvider } from "@/components/finance/query-provider";
import { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#059669",
};

export const metadata: Metadata = {
  title: "Racira Finance — Clear-eyed writing on money & markets",
  description: "Long-form analysis on investing, personal finance, markets, and the economy — written by former practitioners.",
  authors: [{ name: "Racira Finance" }],
  openGraph: {
    siteName: "Racira Finance",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@raciraco",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      
      <>
        <QueryProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </QueryProvider>
      </>
    
  );
}
