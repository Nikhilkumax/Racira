"use client";

import React, { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

/** Fixed-decimal formatting (readouts keep trailing zeros). */
export function fmt(n: number, d = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(d);
}

/** Fixed-decimal formatting with trailing zeros trimmed (1.500 → "1.5"). */
export function fmtTrim(n: number, d = 3): string {
  if (!Number.isFinite(n)) return "—";
  return String(+n.toFixed(d));
}

/** Clamp + round to a sensible step. */
export function round(n: number, d = 2): number {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card p-4 sm:p-5 ${className}`}>{children}</div>;
}

export function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">{children}</h2>;
}

/** Label-left / control-right field row; stacks below `sm`. */
export function Row({
  label,
  unit,
  children,
  testid,
  controlWidth = "sm:w-56",
  className = "",
}: {
  label: string;
  unit?: string;
  children: React.ReactNode;
  testid?: string;
  controlWidth?: string;
  className?: string;
}) {
  return (
    <div
      data-testid={testid}
      className={`flex flex-col gap-1 py-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${className}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:shrink-0">
        {label}
        {unit && (
          <span className="ml-1.5 font-mono text-[10px] normal-case tracking-normal text-muted-foreground/70">{unit}</span>
        )}
      </span>
      <div className={`w-full ${controlWidth}`}>{children}</div>
    </div>
  );
}

export function NumField({
  name,
  value,
  onChange,
  step,
  disabled,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <input
      data-testid={`in-${name}`}
      type="number"
      inputMode="decimal"
      step={step ?? "any"}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}

export function Num({
  name,
  label,
  value,
  onChange,
  unit,
  step,
  inline,
  disabled,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  step?: number;
  inline?: boolean;
  disabled?: boolean;
}) {
  if (inline) {
    return (
      <Row label={label} unit={unit} testid={`row-${name}`} className={disabled ? "opacity-60" : ""}>
        <NumField name={name} value={value} onChange={onChange} step={step} disabled={disabled} />
      </Row>
    );
  }
  return (
    <label className={`block ${disabled ? "opacity-60" : ""}`}>
      <span className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {unit && <span className="font-mono text-[10px] normal-case tracking-normal text-muted-foreground/70">{unit}</span>}
      </span>
      <NumField name={name} value={value} onChange={onChange} step={step} disabled={disabled} />
    </label>
  );
}

/** Slider + number pair bound to one value: drag for sweeps, type for precision. */
export function SliderNum({
  name,
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step,
  inline,
  disabled,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  min: number;
  max: number;
  step: number;
  inline?: boolean;
  disabled?: boolean;
}) {
  const num = parseFloat(value);
  const clamped = Number.isFinite(num) ? Math.min(max, Math.max(min, num)) : min;
  const slider = (
    <input
      data-testid={`slider-${name}`}
      aria-label={`${label} slider`}
      type="range"
      min={min}
      max={max}
      step={step}
      value={clamped}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full accent-primary disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
  if (inline) {
    return (
      <Row label={label} unit={unit} testid={`row-${name}`} controlWidth="sm:w-72" className={disabled ? "opacity-70" : ""}>
        <NumField name={name} value={value} onChange={onChange} disabled={disabled} />
        <div className="mt-1">{slider}</div>
      </Row>
    );
  }
  return (
    <div className={disabled ? "opacity-70" : ""}>
      <Num name={name} label={label} value={value} onChange={onChange} unit={unit} disabled={disabled} />
      <div className="mt-1">{slider}</div>
    </div>
  );
}

export function Sel({
  name,
  label,
  value,
  onChange,
  options,
  inline,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  inline?: boolean;
}) {
  const select = (
    <select
      data-testid={`in-${name}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
  if (inline) {
    return (
      <Row label={label} testid={`row-${name}`}>
        {select}
      </Row>
    );
  }
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {select}
    </label>
  );
}

export function TextInput({
  name,
  label,
  value,
  onChange,
  placeholder,
  unit,
  inline,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  unit?: string;
  inline?: boolean;
}) {
  const input = (
    <input
      data-testid={`in-${name}`}
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
    />
  );
  if (inline) {
    return (
      <Row label={label} unit={unit} testid={`row-${name}`} controlWidth="sm:w-64">
        {input}
      </Row>
    );
  }
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {unit && <span className="font-mono text-[10px] normal-case tracking-normal text-muted-foreground/70">{unit}</span>}
      </span>
      {input}
    </label>
  );
}

export function TextArea({
  name,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <textarea
        data-testid={`in-${name}`}
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}

/** Inline radio group — short option sets stay visible instead of hiding in a select. */
export function Radios({
  name,
  value,
  onChange,
  options,
  ariaLabel,
  testidPrefix,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
  testidPrefix?: string;
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => (
        <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            data-testid={`${testidPrefix ?? "radio"}-${name}-${o.value}`}
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="accent-primary"
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  disabled,
  kind = "primary",
  testid,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  kind?: "primary" | "ghost";
  testid?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const kindCls =
    kind === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border bg-background text-foreground hover:bg-accent";
  return (
    <button type="button" data-testid={testid} onClick={onClick} disabled={disabled} className={`${base} ${kindCls}`}>
      {children}
    </button>
  );
}

/** Copy-to-clipboard button with a transient confirmation state. */
export function CopyBtn({ text, label = "Copy", testid }: { text: string; label?: string; testid?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Btn
      kind="ghost"
      testid={testid}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(
          () => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          },
          () => {},
        );
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </Btn>
  );
}

/** Monospace code/output surface with a copy affordance. */
export function CodeOut({
  code,
  title,
  testid,
  language = "css",
}: {
  code: string;
  title?: string;
  testid?: string;
  language?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/40">
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {title ?? `${language} output`}
        </span>
        <CopyBtn text={code} testid={testid ? `${testid}-copy` : undefined} />
      </div>
      <pre
        data-testid={testid}
        className="overflow-x-auto px-4 py-3 text-xs leading-relaxed text-foreground"
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function Res({ label, value, name }: { label: string; value: string; name?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span data-testid={name ? `res-${name}` : undefined} className="text-right font-mono text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

export function ResBox({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-border/60 rounded-xl border border-border bg-card/40 px-4 py-1.5">{children}</div>;
}

/** Two-column calculator layout: form left, results right. */
export function CalcLayout({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">{children}</div>;
}

export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

/** Full-width preview surface used by the type-preview tools. */
export function PreviewCard({
  children,
  label,
  className = "",
  style,
  testid,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  testid?: string;
}) {
  return (
    <div className={`rounded-xl border border-border bg-card/40 p-4 sm:p-6 ${className}`} data-testid={testid}>
      {label && (
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{label}</div>
      )}
      {children}
    </div>
  );
}

/** Generic searchable table for reference lists (Unicode blocks, symbols…). */
export function RefTable({
  title,
  cols,
  rows,
  search,
  note,
  minWidth = 420,
}: {
  title?: string;
  cols: string[];
  rows: React.ReactNode[][];
  search?: boolean;
  note?: React.ReactNode;
  minWidth?: number;
}) {
  const [q, setQ] = useState("");
  const visible = useMemo(() => {
    if (!q.trim()) return rows;
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => r.some((c) => typeof c === "string" && c.toLowerCase().includes(needle)));
  }, [q, rows]);

  return (
    <div>
      {title && <PanelTitle>{title}</PanelTitle>}
      {search && (
        <div className="mb-3">
          <input
            data-testid="ref-search"
            type="text"
            value={q}
            placeholder={`Search ${rows.length} entries…`}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
          />
        </div>
      )}
      <div className="rounded-xl border border-border">
        <div className="scroll-shadow-x overflow-x-auto">
          <table style={{ minWidth }} className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {cols.map((c, i) => (
                  <th key={i} className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((r, ri) => (
                <tr key={ri} className="border-b border-border/50 odd:bg-card/30 last:border-0">
                  {r.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 align-top text-xs text-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={cols.length} className="px-3 py-4 text-center text-xs text-muted-foreground">
                    No matches for “{q}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {note && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{note}</p>}
    </div>
  );
}
