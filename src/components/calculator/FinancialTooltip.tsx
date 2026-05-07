"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";

const FinancialTooltip = ({ text }: { text: string }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <span className="relative inline-flex ml-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-muted-foreground hover:text-primary transition-colors"
        aria-label="More info"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-card border border-border p-3 text-xs text-muted-foreground shadow-lg z-50">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-border" />
        </div>
      )}
    </span>
  );
};

export default FinancialTooltip;


