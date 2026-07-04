import { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 " +
        (props.className ?? "")
      }
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 " +
        (props.className ?? "")
      }
    />
  );
}

export function Result({ label, value, ok }: { label: string; value: ReactNode; ok?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={
          "mt-1 break-all font-mono text-sm " +
          (ok === true ? "text-primary" : ok === false ? "text-destructive" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}
