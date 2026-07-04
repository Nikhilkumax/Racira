"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Maximize2, Minimize2, Trash2 } from "lucide-react";

const STORAGE_KEY = "racira.dfw.draft";

export function DistractionFreeEditor() {
  const [text, setText] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setText(saved);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => localStorage.setItem(STORAGE_KEY, text), 300);
    return () => clearTimeout(id);
  }, [text]);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const sentences = trimmed
      ? (trimmed.match(/[.!?]+(?:\s|$)/g) || []).length || 1
      : 0;
    const readMin = Math.max(1, Math.round(words / 220));
    return { words, chars, sentences, readMin };
  }, [text]);

  const download = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "draft.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clear = () => {
    if (confirm("Clear the current draft? This cannot be undone.")) {
      setText("");
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col px-5 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Distraction-Free Writing Editor
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Just you and the words. Autosaves locally as you type.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFocusMode((f) => !f)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition hover:border-primary/40"
          >
            {focusMode ? (
              <>
                <Minimize2 className="h-4 w-4" /> Exit focus
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" /> Focus mode
              </>
            )}
          </button>
          <button
            onClick={download}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition hover:border-primary/40"
          >
            <Download className="h-4 w-4" /> Download
          </button>
          <button
            onClick={clear}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        </div>
      </div>

      <div
        className={`relative rounded-2xl border border-border bg-card transition ${
          focusMode
            ? "fixed inset-0 z-50 m-0 rounded-none border-0 bg-background p-0"
            : ""
        }`}
      >
        {focusMode && (
          <button
            onClick={() => setFocusMode(false)}
            className="absolute right-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium"
          >
            <Minimize2 className="h-4 w-4" /> Exit focus
          </button>
        )}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start writing…"
          className={`block w-full resize-none bg-transparent text-lg leading-relaxed outline-none placeholder:text-muted-foreground/60 ${
            focusMode
              ? "mx-auto h-screen max-w-3xl px-6 py-24"
              : "min-h-[60vh] p-8"
          }`}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <Stat label="Words" value={stats.words} />
          <Stat label="Characters" value={stats.chars} />
          <Stat label="Sentences" value={stats.sentences} />
          <Stat label="Read time" value={`${stats.readMin} min`} />
        </div>
        <span className="text-xs">Autosaved locally</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <span>
      <span className="font-semibold text-foreground">{value}</span>{" "}
      <span>{label.toLowerCase()}</span>
    </span>
  );
}
