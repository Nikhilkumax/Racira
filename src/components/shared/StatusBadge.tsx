import { ToolStatus } from "@/domains/_types";

interface StatusBadgeProps {
  status: ToolStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "live") {
    return null;
  }

  return (
    <span className="absolute top-3 right-3 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      Soon
    </span>
  );
}
