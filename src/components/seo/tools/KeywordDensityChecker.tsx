"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

const STOP_WORDS = new Set(
  "a an the and or but if then else for of to in on at by with from as is are was were be been being have has had do does did will would could should may might must can this that these those it its i you he she we they them us our your his her their not no so than such too very".split(
    " "
  )
);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function ngrams(tokens: string[], n: number) {
  const out: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    const slice = tokens.slice(i, i + n);
    if (slice.some((t) => STOP_WORDS.has(t))) continue;
    out.push(slice.join(" "));
  }
  return out;
}

function topCounts(items: string[], limit = 10) {
  const map = new Map<string, number>();
  for (const it of items) map.set(it, (map.get(it) ?? 0) + 1);
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

const SAMPLE = `Search engine optimization (SEO) is the process of improving the quality and quantity of website traffic to a website or a web page from search engines. SEO targets unpaid traffic rather than direct traffic or paid traffic. Effective SEO strategy focuses on content quality, technical SEO, link building, and user experience.`;

export function KeywordDensityChecker() {
  const [text, setText] = useState(SAMPLE);
  const [focus, setFocus] = useState("seo");

  const stats = useMemo(() => {
    const tokens = tokenize(text);
    const filtered = tokens.filter((t) => !STOP_WORDS.has(t) && t.length > 1);
    const total = tokens.length;

    const one = topCounts(filtered, 12);
    const two = topCounts(ngrams(tokens, 2), 10);
    const three = topCounts(ngrams(tokens, 3), 8);

    const focusToken = focus.trim().toLowerCase();
    const focusCount = focusToken
      ? tokens.filter((t) => t === focusToken).length ||
        (text.toLowerCase().match(
          new RegExp(`\\b${focusToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g")
        ) || []).length
      : 0;
    const focusDensity = total ? (focusCount / total) * 100 : 0;

    return { tokens, total, one, two, three, focusCount, focusDensity };
  }, [text, focus]);

  const verdict = (() => {
    if (!focus.trim()) return null;
    const d = stats.focusDensity;
    if (d === 0)
      return { tone: "warn", icon: AlertTriangle, msg: `“${focus}” doesn't appear in the content.` };
    if (d > 3)
      return {
        tone: "warn",
        icon: AlertTriangle,
        msg: `Density is ${d.toFixed(2)}%. That risks keyword stuffing — aim for 0.5–2.5%.`,
      };
    if (d < 0.3)
      return {
        tone: "info",
        icon: Info,
        msg: `Density is ${d.toFixed(2)}%. A bit low — consider naturally working “${focus}” in a few more times.`,
      };
    return {
      tone: "ok",
      icon: CheckCircle2,
      msg: `Density is ${d.toFixed(2)}%. Right in the healthy SEO range.`,
    };
  })();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* Input */}
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <label className="text-xs font-medium text-muted-foreground">Focus keyword</label>
        <input
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="e.g. seo"
          className="mt-1 h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary"
        />

        <label className="mt-5 block text-xs font-medium text-muted-foreground">
          Content or HTML
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          className="mt-1 w-full resize-y rounded-xl border border-border/60 bg-background p-3 text-sm leading-relaxed outline-none focus:border-primary"
        />

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Stat label="Words" value={stats.total} />
          <Stat label={`"${focus || "—"}"`} value={stats.focusCount} />
          <Stat label="Density" value={`${stats.focusDensity.toFixed(2)}%`} />
        </div>

        {verdict && (
          <div
            className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${
              verdict.tone === "ok"
                ? "border-success/30 bg-success/10 text-success"
                : verdict.tone === "warn"
                ? "border-warning/30 bg-warning/10 text-warning"
                : "border-border/60 bg-muted/40 text-muted-foreground"
            }`}
          >
            <verdict.icon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{verdict.msg}</span>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <DensityTable title="Top keywords (1-gram)" rows={stats.one} total={stats.total} />
        <DensityTable title="Top phrases (2-gram)" rows={stats.two} total={stats.total} />
        <DensityTable title="Top phrases (3-gram)" rows={stats.three} total={stats.total} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-3">
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function DensityTable({
  title,
  rows,
  total,
}: {
  title: string;
  rows: [string, number][];
  total: number;
}) {
  const max = rows[0]?.[1] ?? 1;
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">Not enough content.</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map(([term, count]) => {
            const pct = total ? (count / total) * 100 : 0;
            return (
              <li key={term} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="truncate font-medium">{term}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {count} · {pct.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
