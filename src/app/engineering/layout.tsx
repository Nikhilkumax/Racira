import type { Metadata } from "next";
import { Providers } from "@/components/engineering/Providers";

export const metadata: Metadata = {
  title: "Racira Engineering — Free Engineering Tools",
  description: "Engineering calculators and tools in your browser.",
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
