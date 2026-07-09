"use client";

import Header from "@/components/Header";
import { type ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header mode="category" categoryName="Security" />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-8">
        <div className="racira-page-container text-center text-sm text-muted-foreground">
          Racira Security & Privacy — 175 free tools, all running in your browser.
        </div>
      </footer>
    </div>
  );
}
