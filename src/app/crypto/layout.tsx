import type { Metadata } from "next";
import { Providers } from "@/components/crypto/Providers";

export const metadata: Metadata = {
  title: "Racira Crypto & Blockchain — 170 Free Tools",
  description: "170 free crypto & blockchain tools in your browser. No signup required.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <>
        <Providers>
          {children}
        </Providers>
      </>
    
  );
}
