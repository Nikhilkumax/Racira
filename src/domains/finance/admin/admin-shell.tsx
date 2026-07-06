"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, FolderTree, Tag, Image, LogOut, ExternalLink } from "lucide-react";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/posts", label: "Posts", icon: FileText, exact: false },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, exact: false },
  { to: "/admin/tags", label: "Tags", icon: Tag, exact: false },
  { to: "/admin/media", label: "Media", icon: Image, exact: false },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 flex-col border-r border-border/60 bg-card md:flex">
        <div className="border-b border-border/60 p-5">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-md" style={{ background: "var(--gradient-primary)" }}>
              <span className="text-sm font-bold text-primary-foreground">R</span>
            </span>
            Racira Admin
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname?.startsWith(n.to) && (pathname === n.to || pathname[n.to.length] === '/');
            return (
              <Link
                key={n.to}
                href={n.to}
                className={
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                  (active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")
                }
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/60 p-3">
          <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <ExternalLink className="h-4 w-4" /> View site
          </Link>
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => { try { localStorage.removeItem("racira-admin"); location.href = "/"; } catch {} }}>
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <div className="flex-1 overflow-x-hidden">
        <nav className="flex gap-3 overflow-x-auto border-b border-border/60 bg-card px-4 py-3 text-sm md:hidden">
          {nav.map((n) => (
            <Link key={n.to} href={n.to} className="rounded-md px-2.5 py-1 text-muted-foreground">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}