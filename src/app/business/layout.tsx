import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Racira Business Tools — 53 Free Tools for Operators & Founders",
  description:
    "53 free business tools for HR, strategy, sales, meetings, operations, and startups. SWOT, lean canvas, roadmaps, planners — fast, simple, no signup.",
  openGraph: {
    siteName: "Racira Business Tools",
    type: "website",
    title: "Racira Business Tools",
    description: "53 free tools for business operators and founders.",
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
    
      
      <>{children}</>
    
  );
}
