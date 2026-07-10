"use client";
import { CategorySearch } from "@/components/CategorySearch";

import Link from "next/link";
import Header from "@/components/Header";
import { useMemo, useState } from "react";
import { Search, ArrowRight, Wallet, Send, FileCode, Lock, Coins, Image, BarChart3, GraduationCap, Wrench } from "lucide-react";

import { TOOLS, CATEGORIES, SEARCH_REGISTRY } from "@/domains/crypto/registry";

const CATEGORY_ICONS: Record<string, typeof Wallet> = {
  "Wallet & Address": Wallet,
  "Transaction": Send,
  "Smart Contract": FileCode,
  "Cryptography": Lock,
  "DeFi": Coins,
  "NFT": Image,
  "Portfolio": BarChart3,
  "Education": GraduationCap,
  "Utilities": Wrench,
};

export default function Index() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return TOOLS;
    return TOOLS.filter((t) => (t as any).name.toLowerCase().includes(term) || (t as any).desc.toLowerCase().includes(term));
  }, [q]);

  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Crypto" />
      <main className="racira-page-container">
        {/* Hero */}
              <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            100+ Free Crypto Tools —{" "}
            <span className="hero-gradient-text">Convert, Hash & Track</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Essential utilities for crypto conversion, hashing, and blockchain tracking. No signup required.
          </p>
          <CategorySearch categorySlug="crypto" placeholder="Search 100+ crypto tools..." registry={SEARCH_REGISTRY} />
        </div>
      </section>

        {/* Categories */}
        {CATEGORIES.map((cat) => {
          const items = filtered.filter((t) => (t as any).category === cat);
          if (!items.length) return null;
          const Icon = CATEGORY_ICONS[cat] ?? Wrench;
          return (
            <section key={cat} className="mb-12">
              <div className="mb-4 flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {cat} <span className="ml-1 text-muted-foreground/70">({items.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((t) => (
                  <Link
                    key={(t as any).slug}
                    href={`/tool/${(t as any).slug}`}
                    className="tool-card group hover:-translate-y-[3px] hover:border-primary/40 hover:shadow-[0_8px_24px_hsl(var(--ring)/0.1)]"
                  >
                    {!t.implemented && (
                      <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Soon
                      </span>
                    )}
                    <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug">
                      {(t as any).name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{(t as any).desc}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Racira Crypto — 170 free crypto & blockchain tools. Runs entirely in your browser.
      </footer>
    </div>
  );
}
