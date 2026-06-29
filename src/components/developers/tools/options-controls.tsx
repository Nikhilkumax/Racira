"use client";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface OptRowProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function OptRow({ label, children, className }: OptRowProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Label className="text-xs text-muted-foreground min-w-[80px]">{label}</Label>
      {children}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

export function OptSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-8 w-[160px]", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function OptSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <OptRow label={label}>
      <Switch checked={checked} onCheckedChange={onChange} />
    </OptRow>
  );
}

export function OptNumber({
  value,
  onChange,
  label,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  min?: number;
  max?: number;
}) {
  return (
    <OptRow label={label}>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-24"
      />
    </OptRow>
  );
}

export function OptionsBar({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border px-4 py-2.5 sm:px-5 bg-muted/20">
      {children}
    </div>
  );
}
