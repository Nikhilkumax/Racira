import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";
import { PDF_SITE } from "@/domains/pdf/site";

// Identity strings derive from the domain's site-identity module (PDF_SITE) —
// never hand-type brand strings here.
export const metadata: Metadata = {
  title: PDF_SITE.title,
  description: "PDF tools",
  openGraph: {
    title: PDF_SITE.title,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <>
        <ClientLayout>{children}</ClientLayout>
      </>
    
  
);
}
