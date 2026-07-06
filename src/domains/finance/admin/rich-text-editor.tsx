"use client";

import { useRef } from "react";
import { Bold, Italic, Code, Heading2, List, Quote, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Lightweight markdown editor with a formatting toolbar.
 * Renders to a textarea — content is stored as markdown.
 * TODO: swap for TipTap or similar WYSIWYG when richer formatting is needed.
 */
export function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (before: string, after = before) => {
    const el = ref.current;
    if (!el) return;
    const [s, e] = [el.selectionStart, el.selectionEnd];
    const sel = value.slice(s, e) || "text";
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };

  const prefix = (p: string) => {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    onChange(value.slice(0, lineStart) + p + value.slice(lineStart));
  };

  return (
    <div className="rounded-lg border border-border/60 bg-background">
      <div className="flex flex-wrap gap-1 border-b border-border/60 p-2">
        <Button type="button" size="sm" variant="ghost" onClick={() => prefix("## ")}><Heading2 className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => wrap("**")}><Bold className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => wrap("*")}><Italic className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => wrap("`")}><Code className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => prefix("- ")}><List className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => prefix("> ")}><Quote className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => wrap("[", "](https://)")}><LinkIcon className="h-4 w-4" /></Button>
        <span className="ml-auto self-center px-2 text-xs text-muted-foreground">Markdown</span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={18}
        className="w-full resize-y rounded-b-lg bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
        placeholder="Write your post in markdown…"
      />
    </div>
  );
}