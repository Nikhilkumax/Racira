import type { Metadata } from "next";
import { Providers } from "@/components/education/providers";

export const metadata: Metadata = {
  title: "Racira Education — 132 Free Learning Tools",
  description: "Interactive math, science, language, and quiz tools. 132 free education tools in your browser. No signup required.",
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
