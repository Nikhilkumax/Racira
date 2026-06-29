"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ShieldCheck, Lock, KeyRound, Hash, Binary, EyeOff, Network, UserCheck, ClipboardCheck, Bug, Scale, Wrench, ArrowRight } from "lucide-react";
import { Layout } from "@/components/security/Layout";
import { categories, tools, toolsByCategory, totalTools, type ToolCategory } from "@/lib/security/tools";
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
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-10 text-center">
        <Badge variant="secondary" className="mb-6 bg-secondary text-primary">
          <ShieldCheck className="mr-1 h-3 w-3" /> {totalTools} security & privacy tools
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          All Security Tools You Need — <span className="gradient-text">Private, Fast & Free</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Generate, encrypt, hash, decode, audit. {totalTools} free privacy & security tools running entirely in your browser. No signup, no servers.
        </p>
        <div className="mt-8 max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools (e.g. SHA-256, JWT, password)…"
            className="pl-9 h-12"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 space-y-12">
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
            className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-secondary text-primary">
                <Icon className="h-4 w-4" />
              </div>
              {!t.live && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </div>
            <h3 className="mt-4 font-semibold text-foreground">{t.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.description}</p>
            <div className="mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              Open <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
