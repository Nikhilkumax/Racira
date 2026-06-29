import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Racira PDF Suite",
  description: "PDF tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <>
        <ClientLayout>{children}</ClientLayout>
      </>
    
  );
}
