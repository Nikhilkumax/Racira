"use client";
import type { ReactNode } from "react";

export function ToolShell({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-8">
      {children}
      {note && <p className="mt-6 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="number"
      {...props}
      className={
        "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2 " +
        (props.className ?? "")
      }
    />
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="text"
      {...props}
      className={
        "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2 " +
        (props.className ?? "")
      }
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        "w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2 " +
        (props.className ?? "")
      }
    />
  );
}

export function Result({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border bg-amber-soft/40 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export const SENSORS: Array<{ name: string; coc: number; crop: number; width: number; height: number }> = [
  { name: "Full Frame (36×24)", coc: 0.03, crop: 1, width: 36, height: 24 },
  { name: "APS-C Canon (1.6×)", coc: 0.019, crop: 1.6, width: 22.5, height: 15 },
  { name: "APS-C (1.5×)", coc: 0.02, crop: 1.5, width: 23.6, height: 15.6 },
  { name: "Micro Four Thirds", coc: 0.015, crop: 2, width: 17.3, height: 13 },
  { name: "Medium Format 44×33", coc: 0.04, crop: 0.79, width: 43.8, height: 32.9 },
  { name: '1" Type', coc: 0.011, crop: 2.7, width: 13.2, height: 8.8 },
];
