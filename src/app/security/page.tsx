"use client";

import Link from "next/link";
import { CategorySearch } from "@/components/CategorySearch";
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
          <CategorySearch categorySlug="security" placeholder="Search 170+ security tools..." registry={(tools || []).map((t: any) => ({ name: (t as any).name, description: (t as any).description || '', slug: (t as any).slug, href: ((t as any).slug || '').startsWith('/') ? (t as any).slug : `/security/tools/${(t as any).slug}`, category: (t as any).category, isBuilt: (t as any).built !== false }))} />
        </div>
      </section>

      <section className="racira-page-container pb-20 space-y-12">
          {categories.map((cat) => {
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
          })}
      </section>
    </Layout>
  );
}

function ToolGrid({ items }: { items: typeof tools }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((t) => {
        const Icon = ICONS[(t as any).category as ToolCategory];
        return (
          <Link
            key={(t as any).slug}
            href={`/tool/${(t as any).slug}`}
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
            <h3 className="font-semibold text-foreground leading-snug">{(t as any).name}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{(t as any).description}</p>
          </Link>
        );
      })}
    </div>
  );
}
