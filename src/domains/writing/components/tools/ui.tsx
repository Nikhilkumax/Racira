"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared UI primitives for Writing tool components.
 *
 * Layout contract for every tool: render one `<ToolLayout>` (a responsive
 * two-column grid that collapses to a single column on mobile), put inputs on
 * the left and derived output on the right. The page shell owns the page
 * container margins and the single `<h1>`; components own their own panels.
 * Nothing here renders an `<h1>`.
 *
 * Test ids follow the CAD/PDF convention: `in-<name>` for inputs and
 * `res-<name>` for derived values, so e2e tests can assert real numbers.
 */

/** Debounced mirror of a value — the default 250 ms suits text-heavy inputs. */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** localStorage-backed state; SSR-safe (reads after mount). */
export function useStoredState<T>(
  key: string,
  initial: T,
): [T, (value: T | ((previous: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // Ignore unreadable/corrupt storage — the tool still works in memory.
    }
    setHydrated(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((previous: T) => T)) => {
      setValue((previous) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(previous) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage full or blocked (private mode) — keep the in-memory value.
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated];
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card p-4 sm:p-5 ${className}`}>{children}</div>;
}

export function PanelTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">{children}</h2>
      {right}
    </div>
  );
}

/** Two-column tool layout: controls left, results right; one column on mobile. */
export function ToolLayout({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">{children}</div>;
}

/** Full-width layout for tools whose output is a document, not a keypad. */
export function StackLayout({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

export function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      <span>{label}</span>
      {hint && <span className="font-mono text-[10px] normal-case tracking-normal text-muted-foreground/70">{hint}</span>}
    </span>
  );
}

export function TextArea({
  name,
  label,
  value,
  onChange,
  placeholder,
  rows = 6,
  hint,
  dir,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
  dir?: "ltr" | "rtl" | "auto";
}) {
  return (
    <label className="block">
      <FieldLabel label={label} hint={hint} />
      <textarea
        data-testid={`in-${name}`}
        aria-label={label}
        dir={dir}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}

export function TextInput({
  name,
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
  dir,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  type?: "text" | "number" | "datetime-local";
  dir?: "ltr" | "rtl" | "auto";
}) {
  return (
    <label className="block">
      <FieldLabel label={label} hint={hint} />
      <input
        data-testid={`in-${name}`}
        aria-label={label}
        type={type}
        dir={dir}
        inputMode={type === "number" ? "decimal" : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}

export function Select({
  name,
  label,
  value,
  onChange,
  options,
  hint,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <label className="block">
      <FieldLabel label={label} hint={hint} />
      <select
        data-testid={`in-${name}`}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Checkbox({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
      <input
        data-testid={`in-${name}`}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}

export function Btn({
  children,
  onClick,
  kind = "primary",
  testid,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  kind?: "primary" | "ghost";
  testid?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const kindClass =
    kind === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border bg-background text-foreground hover:bg-accent";
  return (
    <button type={type} data-testid={testid} onClick={onClick} disabled={disabled} className={`${base} ${kindClass}`}>
      {children}
    </button>
  );
}

/** Copy-to-clipboard with a real fallback and a visible status. */
export function CopyButton({ text, label = "Copy", testid }: { text: string; label?: string; testid?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = useCallback(async () => {
    const done = (next: "copied" | "failed") => {
      setState(next);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("idle"), 1600);
    };
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        done("copied");
        return;
      }
      throw new Error("clipboard unavailable");
    } catch {
      // Fallback for insecure contexts / older browsers.
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(area);
        done(ok ? "copied" : "failed");
      } catch {
        done("failed");
      }
    }
  }, [text]);

  return (
    <Btn kind="ghost" onClick={copy} testid={testid ?? "copy"} disabled={text.length === 0}>
      {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}
    </Btn>
  );
}

/** Download the text as a file (client-side blob only). */
export function DownloadButton({
  text,
  filename,
  mime = "text/plain;charset=utf-8",
  label = "Download",
  testid,
}: {
  text: string;
  filename: string;
  mime?: string;
  label?: string;
  testid?: string;
}) {
  const download = useCallback(() => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [text, filename, mime]);

  return (
    <Btn kind="ghost" onClick={download} testid={testid ?? "download"} disabled={text.length === 0}>
      {label}
    </Btn>
  );
}

export function ResultRow({
  name,
  label,
  value,
}: {
  name?: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span data-testid={name ? `res-${name}` : undefined} className="text-right font-mono text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

export function ResultBox({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-border/60 rounded-xl border border-border bg-card/40 px-4 py-1.5">{children}</div>;
}

/** Large primary readout for the headline number of a tool. */
export function HeroStat({
  label,
  value,
  sub,
  testid,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  testid?: string;
}) {
  return (
    <div className="mb-3 rounded-lg border-l-4 border-primary bg-primary/10 px-5 py-4 text-center">
      <div className="text-[11px] font-bold uppercase tracking-wider text-primary">{label}</div>
      <div data-testid={testid} className="break-words font-mono text-4xl font-extrabold tracking-tight text-foreground">
        {value}
      </div>
      {sub && <div className="mt-1 text-sm text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>;
}

export function Stat({
  label,
  value,
  testid,
}: {
  label: string;
  value: React.ReactNode;
  testid?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/40 px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div data-testid={testid} className="font-mono text-lg font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}

export function Notice({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "warn" | "error";
}) {
  const toneClass =
    tone === "error"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : tone === "warn"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : "border-border bg-muted/30 text-muted-foreground";
  return <p className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${toneClass}`}>{children}</p>;
}

/** Shown whenever a tool has no usable input yet. */
export function EmptyState({ children }: { children?: React.ReactNode }) {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">
      {children ?? "Start typing above — the results update as you write."}
    </p>
  );
}

export function OutputBlock({
  name,
  value,
  maxHeight = 380,
  mono = true,
}: {
  name: string;
  value: string;
  maxHeight?: number;
  mono?: boolean;
}) {
  return (
    <pre
      data-testid={`res-${name}`}
      style={{ maxHeight }}
      className={`overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground ${
        mono ? "font-mono" : ""
      }`}
    >
      {value}
    </pre>
  );
}

/** Simple horizontal bar used by the counters and timers. */
export function ProgressBar({ value, testid }: { value: number; testid?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div data-testid={testid} className="h-2 overflow-hidden rounded-full bg-muted" role="presentation">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${clamped}%` }} />
    </div>
  );
}

/** mm:ss / h:mm:ss clock text. */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${pad(minutes)}:${pad(rest)}`;
}
