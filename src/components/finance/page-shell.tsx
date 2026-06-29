import { Toaster } from "sonner";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}