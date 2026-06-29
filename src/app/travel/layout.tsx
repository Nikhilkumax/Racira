import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Racira Travel — 112 Free Travel Tools",
  description: "Plan, pack, budget and explore with 112 free travel tools. Fast, simple, no signup.",
  openGraph: {
    title: "Racira Travel — 112 Free Travel Tools",
    description: "Plan, pack, budget and explore with 112 free travel tools.",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      <>
        {children}
      </>
    
  );
}
