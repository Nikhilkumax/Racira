import type { Metadata } from "next";
import { Providers } from "./providers";
import { THREE_D_SITE } from "@/domains/3d/site";

export const metadata: Metadata = {
  title: THREE_D_SITE.title,
  description: "Free browser tools for 3D modeling, printing, and print design.",
  openGraph: {
    title: THREE_D_SITE.title,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      <>
        <Providers>{children}</Providers>
      </>
    
  );
}
