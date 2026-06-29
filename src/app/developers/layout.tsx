import type { Metadata } from "next";
import { SiteNavbar } from "@/components/developers/site-navbar";
import { SiteFooter } from "@/components/developers/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DevForge — Browser-based developer tools",
  description: "Dev Hub Toolkit is a modern, browser-based platform offering a suite of fast, premium developer tools.",
  openGraph: {
    siteName: "DevForge",
    type: "website",
    title: "DevForge — Browser-based developer tools",
    description: "Dev Hub Toolkit is a modern, browser-based platform offering a suite of fast, premium developer tools.",
    images: ["https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3d6acb61-5ab9-44bb-980e-f706f05b5e49/id-preview-172b6b81--76697a02-8529-4c5c-9507-856b38fdc7e7.lovable.app-1780755912910.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevForge — Browser-based developer tools",
    description: "Dev Hub Toolkit is a modern, browser-based platform offering a suite of fast, premium developer tools.",
    images: ["https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3d6acb61-5ab9-44bb-980e-f706f05b5e49/id-preview-172b6b81--76697a02-8529-4c5c-9507-856b38fdc7e7.lovable.app-1780755912910.png"],
  }
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("devforge-theme")||"light";var r=document.documentElement;if(t==="dark"){r.classList.add("dark");r.classList.remove("light");}else{r.classList.add("light");r.classList.remove("dark");}}catch(e){document.documentElement.classList.add("light");}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      
      <>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteNavbar />
            <main className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
          <Toaster position="bottom-right" />
        </Providers>
      </>
    
  );
}
