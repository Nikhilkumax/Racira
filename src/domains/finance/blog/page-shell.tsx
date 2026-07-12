import { Toaster } from "sonner";
import Header from "@/components/Header";
import { SiteFooter } from "./site-footer";
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="theme-finance flex min-h-screen flex-col">
      <Header mode="category" categoryName="Finance" />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}