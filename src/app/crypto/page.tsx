"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useMemo, useState } from "react";
import { Search, ArrowRight, Wallet, Send, FileCode, Lock, Coins, Image, BarChart3, GraduationCap, Wrench } from "lucide-react";

import { TOOLS, CATEGORIES } from "@/lib/crypto/tools";

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
    return TOOLS.filter((t) => t.name.toLowerCase().includes(term) || t.desc.toLowerCase().includes(term));
  }, [q]);

  return (
    <div className="min-h-screen bg-background">
      <Header mode="category" categoryName="Crypto" />
      <main className="racira-page-container">
        {/* Hero */}
        <section className="py-16 text-center md:py-24">
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-foreground md:text-7xl">
            All Crypto Tools You Need —{" "}
            <span className="text-primary">Fast, Simple & Free</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            Validate addresses, decode ABIs, convert units, plan portfolios.
            170 free crypto & blockchain tools in your browser. No signup required.
          </p>
          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search 170 crypto tools…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </section>

        {/* Categories */}
        {CATEGORIES.map((cat) => {
          const items = filtered.filter((t) => t.category === cat);
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
                    key={t.slug}
                    href={`/tool/${t.slug}`}
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
                      {t.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.desc}</p>
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
