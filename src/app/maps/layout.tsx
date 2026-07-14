import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Racira Maps & GIS — 165+ Free Online Map & Geospatial Tools",
  description: "165+ free Maps & GIS tools. Convert coordinates, measure distances, view geodata, build maps, run spatial analysis — all in your browser.",
  openGraph: {
    title: "Racira Maps & GIS",
    description: "Free online Maps & GIS toolkit — 165+ tools for coordinates, geocoding, routing, geodata viewers and more.",
  },
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
