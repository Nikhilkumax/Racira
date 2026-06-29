import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/music/providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Racira Music — Free Music Creation Tools",
  description: "130+ free in-browser music tools — beats, chords, scales, notation, mixing.",
  openGraph: {
    title: "Racira Music",
    description: "130+ free in-browser music tools.",
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
        <Providers>
          {children}
        </Providers>
      </>
    
  );
}
