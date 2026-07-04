import Link from "next/link";
import { Cloud, ArrowRight } from "lucide-react";
import type { Tool } from "@/domains/pdf/registry/tools";

const ACTIVE_TOOLS = [
  { name: "Merge PDF", slug: "merge-pdf" },
  { name: "Split PDF", slug: "split-pdf" },
  { name: "Compress PDF", slug: "compress-pdf" },
  { name: "Rotate PDF", slug: "rotate-pdf" },
  { name: "Remove Pages", slug: "remove-pages" },
  { name: "JPG to PDF", slug: "jpg-to-pdf" },
  { name: "PDF to JPG", slug: "pdf-to-jpg" },
];

const ServerToolNotice = ({ tool }: { tool: Tool }) => {
  const Icon = tool.icon;

  return (
    <main className="container py-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">{tool.name}</span>
      </nav>

      {/* Tool Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-muted text-muted-foreground mb-4">
          <Icon className="h-7 w-7" />
        </div>
        <h1 className="font-bold text-foreground text-2xl sm:text-3xl">{tool.name}</h1>
        <span className="inline-flex items-center mt-3 rounded-full bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Coming Soon
        </span>
      </div>

      {/* Notice card */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5" style={{ boxShadow: "var(--card-shadow)" }}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Cloud className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">This Tool Requires Cloud Processing</h2>
            <p className="text-sm text-muted-foreground mt-1">
              This feature requires advanced server-side conversion technology. Racira PDF currently runs fully in your browser for maximum privacy. This cloud-powered tool will be available in a future update.
            </p>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Available tools */}
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">What You Can Use Now</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ACTIVE_TOOLS.map((t) => (
              <Link
                key={t.slug}
                href={`/pdf/${t.slug}`}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors group"
              >
                <span className="text-muted-foreground group-hover:text-primary transition-colors">{t.name}</span>
                <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trust line */}
      <p className="text-center text-[11px] text-muted-foreground mt-4">
        🔒 Your files never leave your browser. Some advanced conversions require cloud infrastructure and are currently unavailable.
      </p>
    </main>
  );
};

export default ServerToolNotice;
