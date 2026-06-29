import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Racira Design",
  description: "Racira Design Studio",
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
