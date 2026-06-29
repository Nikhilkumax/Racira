import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Racira Image — Free Image Tools",
  description: "Image conversion, editing and processing tools in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      <>{children}</>
    
  );
}
