import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Racira CAD",
  description: "108+ free CAD tools in your browser. No signup required.",
  openGraph: {
    title: "Racira CAD",
    description: "108+ free CAD tools in your browser.",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <>
        <Providers>{children}</Providers>
      </>
    
  );
}
