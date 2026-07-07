"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ShieldCheck, Lock, KeyRound, Hash, Binary, EyeOff, Network, UserCheck, ClipboardCheck, Bug, Scale, Wrench, ArrowRight } from "lucide-react";
import { Layout } from "@/domains/security/components/Layout";
import { categories, tools, toolsByCategory, totalTools, type ToolCategory } from "@/domains/security/registry";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const ICONS: Record<ToolCategory, React.ComponentType<{ className?: string }>> = {
  "Password Tools": KeyRound,
  "Cryptography": Lock,
  "Hashing Tools": Hash,
  "Encoding & Obfuscation": Binary,
  "Steganography": EyeOff,
  "Network & Web Security": Network,
  "Privacy Tools": UserCheck,
  "Security Auditing": ClipboardCheck,
  "Penetration Testing Reference": Bug,
  "Accessibility & Compliance": Scale,
  "Security Utilities": Wrench,
};

export default function Home() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const filtered = useMemo(
    () => query ? tools.filter(t => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)) : null,
    [query]
  );

  return (
    <Layout>
            <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            170+ Free Security Tools —{" "}
            <span className="hero-gradient-text">Passwords, Hashes & Keys</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Generate secure passwords, hash data, and manage keys safely in your browser. No signup required.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="text"
                placeholder="Search 170+ security tools..."
                className="w-full h-11 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
                aria-label="Search Security Tools"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>

      <section className="racira-page-container pb-20 space-y-12">
        {filtered ? (
          <div>
            <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </div>
            <ToolGrid items={filtered} />
          </div>
        ) : (
          categories.map((cat) => {
            const Icon = ICONS[cat];
            const items = toolsByCategory(cat);
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="h-4 w-4 text-primary" />
                  <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {cat}
                  </h2>
                  <span className="text-xs text-muted-foreground">· {items.length}</span>
                </div>
                <ToolGrid items={items} />
              </div>
            );
          })
        )}
      </section>
    </Layout>
  );
}

function ToolGrid({ items }: { items: typeof tools }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((t) => {
        const Icon = ICONS[t.category];
        return (
          <Link
            key={t.slug}
            href={`/tool/${t.slug}`}
            className="tool-card group hover:-translate-y-[3px] hover:border-primary/40 hover:shadow-[0_8px_24px_hsl(var(--ring)/0.1)]"
          >
            {!t.live && (
              <span className="absolute right-3 top-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Soon
              </span>
            )}
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground leading-snug">{t.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
