"use client";

import React, { useMemo, useState } from "react";

/** Fixed-decimal formatting (engineering readouts keep trailing zeros). */
export function fmt(n: number, d = 3): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(d);
}

/** Fixed-decimal formatting with trailing zeros trimmed (1:50 → "50"). */
export function fmtTrim(n: number, d = 3): string {
  if (!Number.isFinite(n)) return "—";
  return String(+n.toFixed(d));
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card p-4 sm:p-5 ${className}`}>{children}</div>;
}

export function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">{children}</h2>;
}

/**
 * Card header = tinted icon chip + label. Mirrors the icon+title sub-card
 * header treatment (32px chip, primary-tinted background, single glyph).
 * The chip is intentionally part of the header so panels read as one unit.
 */
export function CardHeader({
  icon,
  children,
  title,
  subtitle,
  right,
}: {
  icon: React.ReactNode;
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base text-primary">
          {icon}
        </span>
        <div className="flex flex-col">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
            {children ?? title}
          </h2>
          {subtitle && (
            <span className="mt-0.5 text-[10px] leading-tight text-muted-foreground/80">{subtitle}</span>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}

/**
 * Hero callout — the solved-for value promoted to a large readout inside a
 * primary-tinted box with a left accent bar, optional subtitle line, and an
 * optional top-right action (e.g. a print button).
 */
export function HeroStatCard({
  label,
  value,
  subtitle,
  action,
}: {
  label: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative mb-3 overflow-hidden rounded-lg border-l-4 border-primary bg-primary/10 p-5 text-center">
      {action && (
        <div className="absolute right-3 top-3 flex justify-end">{action}</div>
      )}
      {/* Label gets right padding on narrow widths so it never runs under the
          absolutely-positioned action chip. */}
      <div className="mb-1 px-14 text-[13px] font-bold uppercase tracking-wider text-primary sm:px-16">
        {label}
      </div>
      <div className="mb-1 break-words font-mono text-4xl font-extrabold tracking-tight text-foreground">
        {value}
      </div>
      {subtitle && <div className="text-sm font-medium text-muted-foreground">{subtitle}</div>}
    </div>
  );
}

/** One mini-stat cell: small gray caps label above a bold value. */
export function MiniStat({
  label,
  value,
  title,
}: {
  label: string;
  value: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <span
        title={title}
        className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </span>
      <span className="truncate font-extrabold text-foreground">{value}</span>
    </div>
  );
}

/**
 * Equal-width stat strip with hairline dividers between cells — the sibling
 * of the hero callout that carries the secondary readouts.
 */
export function MiniStatRow({
  stats,
}: {
  stats: { label: string; value: React.ReactNode; title?: string }[];
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          {i > 0 && <div className="h-8 w-px shrink-0 bg-border" />}
          <MiniStat label={s.label} value={s.value} title={s.title} />
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Reference table with an optional highlighted (amber) row. Used for the
 * "active row" affordance — the row matching the user's current selection.
 */
export function HighlightTable({
  head,
  rows,
  minWidth = 360,
  testid,
}: {
  head: string[];
  rows: { cells: React.ReactNode[]; highlight?: boolean; testid?: string }[];
  minWidth?: number;
  testid?: string;
}) {
  return (
    <div className="scroll-shadow-x overflow-x-auto rounded-lg border border-border bg-card">
      <table data-testid={testid} className="w-full border-collapse text-left text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {head.map((h, i) => (
              <th key={i} className={`p-2.5 ${i === 0 ? "pl-3" : ""} ${i === head.length - 1 ? "pr-3 text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {rows.map((r, ri) => (
            <tr
              key={ri}
              data-testid={r.testid}
              className={`transition-colors ${
                r.highlight ? "bg-amber-500/10" : "hover:bg-muted/30"
              }`}
            >
              {r.cells.map((cell, ci) => (
                <td
                  key={ci}
                  className={`p-2.5 align-middle text-xs ${ci === 0 ? "pl-3 font-semibold" : ""} ${
                    ci === r.cells.length - 1 ? "pr-3 text-right" : ""
                  } ${
                    r.highlight
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-foreground"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Label-left / control-right field row — the reference's form pattern.
 * Collapses to label-above-control below `sm` so narrow viewports keep
 * full-width controls (and never cause horizontal overflow).
 */
export function Row({
  label, unit, children, testid, controlWidth = "sm:w-56", className = "",
}: {
  label: string; unit?: string; children: React.ReactNode; testid?: string;
  controlWidth?: string; className?: string;
}) {
  return (
    <div
      data-testid={testid}
      className={`flex flex-col gap-1 py-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${className}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:shrink-0">
        {label}
        {unit && <span className="ml-1.5 font-mono text-[10px] normal-case tracking-normal text-muted-foreground/70">{unit}</span>}
      </span>
      <div className={`w-full ${controlWidth}`}>{children}</div>
    </div>
  );
}

/** Inline radio group (spelled-out choices, no dropdown) — used wherever the
 *  option set is short enough to show in full, so the current choice is always
 *  visible instead of hidden behind a closed `<select>`. */
export function Radios({
  name, value, onChange, options, ariaLabel, testidPrefix,
}: {
  name: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; ariaLabel: string; testidPrefix?: string;
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => (
        <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
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

/** Bare numeric input — the control half of a `Row`, with no label of its own
 *  (the row supplies the label). */
export function NumField({
  name, value, onChange, step, disabled, invalid,
}: {
  name: string; value: string; onChange: (v: string) => void; step?: number; disabled?: boolean; invalid?: boolean;
}) {
  return (
    <input
      data-testid={`in-${name}`}
      type="number"
      inputMode="decimal"
      step={step ?? "any"}
      value={value}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors disabled:cursor-not-allowed ${
        invalid ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"
      }`}
    />
  );
}

export function Num({
  name, label, value, onChange, unit, step, disabled, inline,
}: {
  name: string; label: string; value: string; onChange: (v: string) => void; unit?: string; step?: number; disabled?: boolean; inline?: boolean;
}) {
  // `inline` renders the row pattern (label left, number box right) instead of
  // the stacked label-above-field default used by the other CAD tools.
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

/**
 * Slider + number input pair bound to ONE value — the reference interaction
 * pattern for geometry fields: drag for quick sweeps, type for precision.
 * Both controls render together and stay in sync because they share `value`;
 * the number box accepts anything (including out-of-slider-range values)
 * and the slider simply pins to its bounds until the value returns inside.
 */
export function SliderNum({
  name, label, value, onChange, unit, min, max, step, inline, disabled,
}: {
  name: string; label: string; value: string; onChange: (v: string) => void;
  unit?: string; min: number; max: number; step: number; inline?: boolean; disabled?: boolean;
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
      <Row label={label} unit={unit} testid={`row-${name}`} controlWidth="sm:w-72"
        className={disabled ? "opacity-70" : ""}>
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
  name, label, value, onChange, options,
}: {
  name: string; label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <select
        data-testid={`in-${name}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export function TextInput({
  name, label, value, onChange, placeholder, unit,
}: {
  name: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; unit?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {unit && <span className="font-mono text-[10px] normal-case tracking-normal text-muted-foreground/70">{unit}</span>}
      </span>
      <input
        data-testid={`in-${name}`}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}

export function TextArea({
  name, label, value, onChange, placeholder, rows = 4,
}: {
  name: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
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

/** Two-column calculator layout: form left, results right.
 *  Children get min-w-0 so wide content (e.g. RefTable's 520px min-width
 *  tables) shrinks to the column and scrolls internally instead of blowing
 *  the grid track out on narrow screens (grid items default to
 *  min-width:auto → content-based minimum). */
export function CalcLayout({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">{children}</div>;
}

export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function Btn({
  children, onClick, disabled, kind = "primary", testid,
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; kind?: "primary" | "ghost"; testid?: string;
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

/** Generic searchable reference table. Cells may be strings or React nodes. */
export function RefTable({
  title, cols, rows, search, note,
}: {
  title?: string; cols: string[]; rows: React.ReactNode[][]; search?: boolean; note?: React.ReactNode;
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
      <div className="scroll-shadow-x rounded-xl border border-border">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
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
              <tr key={ri} className="border-b border-border/50 last:border-0 odd:bg-card/30">
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
      {note && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{note}</p>}
    </div>
  );
}

/** Interactive grouped checklist with progress. */
export function Checklist({
  title, groups, testid,
}: {
  title?: string;
  groups: { name: string; items: string[] }[];
  testid?: string;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const all = groups.flatMap((g) => g.items);
  const done = all.filter((i) => checked[i]).length;

  return (
    <div data-testid={testid}>
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">{title}</h2>
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {done}/{all.length} checked
          </span>
        </div>
      )}
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: all.length ? `${(done / all.length) * 100}%` : "0%" }}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((g) => (
          <div key={g.name} className="rounded-xl border border-border bg-card/40 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{g.name}</h3>
            <ul className="space-y-1.5">
              {g.items.map((item) => (
                <li key={item}>
                  <label className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={!!checked[item]}
                      onChange={(e) => setChecked((c) => ({ ...c, [item]: e.target.checked }))}
                      className="mt-0.5 h-3.5 w-3.5 accent-primary"
                    />
                    <span className={checked[item] ? "text-muted-foreground line-through" : ""}>{item}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
