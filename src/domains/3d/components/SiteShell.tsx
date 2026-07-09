"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { type ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="3D & Print" />
      <main>{children}</main>
      <footer className="border-t border-border py-8 mt-16">
        <div className="racira-page-container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Racira 3D &amp; Print — Free browser tools for 3D and print workflows.
        </div>
      </footer>
    </div>
  );
}
