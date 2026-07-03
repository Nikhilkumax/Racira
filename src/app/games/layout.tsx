import type { Metadata } from "next";
import Header from "@/components/Header";

import { Footer } from "@/components/games/Footer";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Racira Games — 450+ Free Browser Games, No Signup",
  description: "Play 450+ free browser games — puzzles, word, arcade, card, board, trivia and more. No signup, no downloads, 100% client-side.",
  authors: [{ name: "Racira Games" }],
  openGraph: {
    title: "Racira Games — 450+ Free Browser Games",
    description: "Puzzles, word, arcade, card, board, trivia and more. Free, no signup, in your browser.",
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@Racira",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <>
        <div className="flex min-h-screen flex-col">
          <Header mode="category" categoryName="Games" />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
      </>
    
  );
}
