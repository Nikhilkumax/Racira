import { CategorySearch } from "@/components/CategorySearch";
import Link from "next/link";
import { CATEGORIES, TOTAL_TOOLS, SEARCH_REGISTRY } from "@/domains/3d/registry";
import { SiteShell } from "@/domains/3d/components/SiteShell";
import {
  Search, Eye, Box, Printer, Layers, Droplet, Wallet, Palette, Film,
  Globe, FileText, Scan, ArrowRight, CheckCircle2,
} from "lucide-react";

const CAT_ICONS: Record<string, typeof Eye> = {
  "3D Viewing & Inspection": Eye,
  "3D Modeling Utilities": Box,
  "3D Print Preparation": Printer,
  "FDM 3D Printing": Layers,
  "SLA & Resin Printing": Droplet,
  "Print Materials & Costs": Wallet,
  "3D Texturing & Materials": Palette,
  "3D Animation (Concept Tools)": Film,
  "Web 3D & Real-Time": Globe,
  "Print Design (Print-on-Paper)": FileText,
  "Specialized 3D": Scan,
};

export default function Index() {
  return (
    <SiteShell>
            <section className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="racira-page-container text-center">
          <h1 className="text-3xl sm:text-[42px] font-extrabold mb-3 leading-tight">
            120+ Free 3D Tools —{" "}
            <span className="hero-gradient-text">Viewers, Converters & Models</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6">
            Browser-based 3D model viewers, format converters, and spatial utilities. No signup required.
          </p>
          <CategorySearch categorySlug="3d" placeholder="Search 120+ 3D tools..." registry={SEARCH_REGISTRY} />
        </div>
      </section>

      <div className="racira-page-container space-y-14 pb-16">
        {CATEGORIES.map((cat) => {
          const Icon = CAT_ICONS[cat.name] ?? Box;
          const id = cat.name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          const builtCount = cat.tools.filter((t) => (t as any).built).length;
          return (
            <section key={cat.name} id={id} className="scroll-mt-20">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {cat.name}
                    </h2>
                    <p className="text-xs text-muted-foreground/70">
                      {cat.tools.length} tools{builtCount > 0 && ` · ${builtCount} live`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {cat.tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tool/${tool.slug}`}
                    className="tool-card group"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      {tool.built ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          Live
                        </span>
                      ) : (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Soon
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </SiteShell>
  );
}
