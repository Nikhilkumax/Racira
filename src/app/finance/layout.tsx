import { ThemeProvider } from "@/domains/finance/blog/theme-provider";
import { QueryProvider } from "@/domains/finance/blog/query-provider";
import { site as FINANCE_SITE } from "@/domains/finance/site";
import { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#059669",
};

export const metadata: Metadata = {
  title: FINANCE_SITE.title,
  description: FINANCE_SITE.description,
  authors: [{ name: FINANCE_SITE.copyrightName }],
  openGraph: {
    siteName: FINANCE_SITE.copyrightName,
    title: FINANCE_SITE.title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@raciraco",
    title: FINANCE_SITE.title,
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
