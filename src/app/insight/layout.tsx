import type { Metadata } from "next";
import { Providers } from "@/components/insight/Providers";

export const metadata: Metadata = {
  title: "Racira Data & Charts — 128 Free Data Visualization Tools",
  description: "Build charts, clean data, run statistics, and design dashboards. 128 free data & chart tools in your browser. No signup required.",
  openGraph: {
    title: "Racira Data & Charts",
    description: "128 free data & chart tools in your browser. No signup required.",
    type: "website"
  }
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
