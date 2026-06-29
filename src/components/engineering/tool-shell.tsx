import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import type { ReactNode } from "react";
import type { Tool } from "@/lib/engineering/tools";

export function ToolShell({
  tool,
  children,
}: {
  tool: Tool;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> All tools
      </Link>
      <div className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight">{tool.name}</h1>
        <p className="mt-2 text-muted-foreground">{tool.description}</p>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}

export function ComingSoon({ name }: { name: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Construction className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-semibold">Coming soon</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{name}</span> is on the
        roadmap. We're crafting it with care — check back shortly.
      </p>
    </div>
  );
}

export function Field({
  label,
  unit,
  value,
  onChange,
  placeholder,
  type = "number",
}: {
  label: string;
  unit?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <div className="relative">
        <input
          type={type}
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </label>
  );
}

export function ResultCard({
  rows,
}: {
  rows: { label: string; value: string; unit?: string }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Results
      </h3>
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5">
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="font-mono text-base font-semibold text-foreground">
              {row.value}
              {row.unit && <span className="ml-1 text-xs text-muted-foreground">{row.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function fmt(value: number, digits = 4): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e6 || abs < 1e-3) return value.toExponential(digits);
  return Number(value.toPrecision(digits)).toString();
}
