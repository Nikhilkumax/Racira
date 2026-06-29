import type { Metadata } from "next";
import { Providers } from "@/components/fitness/Providers";

export const metadata: Metadata = {
  title: "Racira Fitness — 128 free fitness & nutrition tools",
  description: "Plan workouts, track progress, calculate macros and more. 128 free fitness tools in your browser. No signup required.",
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
