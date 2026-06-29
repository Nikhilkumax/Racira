import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Racira Maps & GIS",
  description: "Free browser-based Maps & GIS toolkit",
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
