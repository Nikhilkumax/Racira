"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Download,
  Copy,
  Check,
  Trash2,
  Target,
  ListChecks,
  Clock,
} from "lucide-react";

import { SiteFooter } from "@/components/productivity/SiteFooter";
import { TOTAL_TOOLS } from "@/data/productivity/tools";

type Preset = { id: string; label: string; work: number; brk: number };
const PRESETS: Preset[] = [
  { id: "pomodoro", label: "Classic Pomodoro 25/5", work: 25, brk: 5 },
  { id: "50-10", label: "Focus 50/10", work: 50, brk: 10 },
  { id: "90-15", label: "Ultradian 90/15", work: 90, brk: 15 },
  { id: "120-20", label: "Deep 120/20", work: 120, brk: 20 },
];

const DEFAULT_CHECKLIST = [
  "Phone on Do Not Disturb",
  "Close email & chat",
  "Close unrelated browser tabs",
  "Water nearby",
  "Restroom break before starting",
  "Define a clear stopping point",
];

type Settings = {
  goal: string;
  presetId: string;
  workMin: number;
  breakMin: number;
  blocks: number;
  startAt: string;
  checklist: { text: string; done: boolean }[];
};

type LogEntry = {
  id: string;
  date: string;
  goal: string;
  workMin: number;
  blocks: number;
  rating: number;
  notes: string;
};

const STORAGE_KEY = "racira.deepwork.settings.v1";
const LOG_KEY = "racira.deepwork.log.v1";

function loadSettings(): Settings {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch {}
  return defaults();
}

function defaults(): Settings {
  return {
    goal: "",
    presetId: "90-15",
    workMin: 90,
    breakMin: 15,
    blocks: 2,
    startAt: "09:00",
    checklist: DEFAULT_CHECKLIST.map((t) => ({ text: t, done: false })),
  };
}

function loadLog(): LogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function fmtTime(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function addMinutes(hhmm: string, mins: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor((total / 60) % 24);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export default function DeepWorkPlanner() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setLog(loadLog());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(LOG_KEY, JSON.stringify(log));
  }, [log, hydrated]);

  // Plan preview
  const plan = useMemo(() => {
    const items: { type: "work" | "break"; label: string; start: string; end: string; mins: number }[] = [];
    let cursor = settings.startAt || "09:00";
    for (let i = 0; i < settings.blocks; i++) {
      const start = cursor;
      const end = addMinutes(start, settings.workMin);
      items.push({ type: "work", label: `Block ${i + 1}`, start, end, mins: settings.workMin });
      cursor = end;
      if (i < settings.blocks - 1) {
        const bStart = cursor;
        const bEnd = addMinutes(bStart, settings.breakMin);
        items.push({ type: "break", label: "Break", start: bStart, end: bEnd, mins: settings.breakMin });
        cursor = bEnd;
      }
    }
    return items;
  }, [settings]);

  // Timer
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [secLeft, setSecLeft] = useState(settings.workMin * 60);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      const m = plan[stepIdx]?.mins ?? settings.workMin;
      setSecLeft(m * 60);
    }
  }, [stepIdx, plan, settings.workMin, running]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSecLeft((s) => {
        if (s <= 1) {
          // advance
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.frequency.value = 660;
            g.gain.value = 0.15;
            o.start();
            setTimeout(() => {
              o.stop();
              ctx.close();
            }, 350);
          } catch {}
          setStepIdx((i) => {
            const next = i + 1;
            if (next >= plan.length) {
              setRunning(false);
              return i;
            }
            return next;
          });
          return (plan[stepIdx + 1]?.mins ?? settings.workMin) * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, plan, stepIdx, settings.workMin]);

  const current = plan[stepIdx];
  const totalSec = (current?.mins ?? settings.workMin) * 60;
  const progress = totalSec > 0 ? 1 - secLeft / totalSec : 0;

  // Log form
  const [rating, setRating] = useState(4);
  const [notes, setNotes] = useState("");
  const sessionDone = stepIdx >= plan.length - 1 && !running && secLeft === 0;

  function saveSession() {
    if (!settings.goal.trim() && !notes.trim()) return;
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      goal: settings.goal,
      workMin: settings.workMin * settings.blocks,
      blocks: settings.blocks,
      rating,
      notes,
    };
    setLog((l) => [entry, ...l].slice(0, 50));
    setNotes("");
    setRating(4);
    setStepIdx(0);
    setSecLeft(settings.workMin * 60);
  }

  // Export
  const [copied, setCopied] = useState(false);
  const planText = useMemo(() => {
    const lines = [
      `DEEP WORK SESSION — ${new Date().toLocaleDateString()}`,
      `Goal: ${settings.goal || "(not set)"}`,
      `Structure: ${settings.workMin}min work / ${settings.breakMin}min break × ${settings.blocks} blocks`,
      "",
      "PLAN",
    ];
    plan.forEach((p) => {
      lines.push(`  ${p.start} – ${p.end}   ${p.type === "work" ? "🟢" : "⏸ "} ${p.label} (${p.mins}min)`);
    });
    lines.push("", "CHECKLIST");
    settings.checklist.forEach((c) => lines.push(`  [${c.done ? "x" : " "}] ${c.text}`));
    return lines.join("\n");
  }, [plan, settings]);

  function copyPlan() {
    navigator.clipboard.writeText(planText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  function downloadPlan() {
    const blob = new Blob([planText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deep-work-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const checklistCompletion = settings.checklist.filter((c) => c.done).length;

  return (
    <div className="min-h-screen">
      <Header mode="category" categoryName="Productivity" />

      <main className="racira-page-container py-10">
        <Link
          href="/productivity"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> All tools
        </Link>

        <header className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            Focus & Time Management
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tighter">
            Deep Work Session Planner
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Set an intention, pick a block structure, prep your environment, then run a
            distraction-free timer. Everything stays on your device.
          </p>
        </header>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left column: settings */}
          <div className="lg:col-span-3 space-y-6">
            {/* Goal */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-bold">1. Your intention</h2>
              </div>
              <textarea
                value={settings.goal}
                onChange={(e) => setSettings({ ...settings, goal: e.target.value })}
                placeholder="What's the one thing you'll finish in this session?"
                rows={3}
                className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </section>

            {/* Structure */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-bold">2. Block structure</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                {PRESETS.map((p) => {
                  const active = settings.presetId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() =>
                        setSettings({ ...settings, presetId: p.id, workMin: p.work, breakMin: p.brk })
                      }
                      className={`rounded-xl border p-3 text-left text-xs font-semibold transition-all ${
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      <div className="text-base font-bold tabular-nums">
                        {p.work}/{p.brk}
                      </div>
                      <div className="text-muted-foreground mt-0.5 font-medium normal-case">
                        {p.label.split(" ")[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Work (min)">
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={settings.workMin}
                    onChange={(e) =>
                      setSettings({ ...settings, workMin: Math.max(5, Number(e.target.value) || 0), presetId: "custom" })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Break (min)">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={settings.breakMin}
                    onChange={(e) =>
                      setSettings({ ...settings, breakMin: Math.max(0, Number(e.target.value) || 0), presetId: "custom" })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Blocks">
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={settings.blocks}
                    onChange={(e) =>
                      setSettings({ ...settings, blocks: Math.min(8, Math.max(1, Number(e.target.value) || 1)) })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums outline-none focus:border-primary"
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Start at">
                  <input
                    type="time"
                    value={settings.startAt}
                    onChange={(e) => setSettings({ ...settings, startAt: e.target.value })}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </Field>
              </div>
            </section>

            {/* Checklist */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-primary" />
                  <h2 className="font-display text-lg font-bold">3. Pre-flight checklist</h2>
                </div>
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  {checklistCompletion}/{settings.checklist.length}
                </span>
              </div>
              <ul className="space-y-1.5">
                {settings.checklist.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 group">
                    <label className="flex items-center gap-3 flex-1 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-muted">
                      <input
                        type="checkbox"
                        checked={c.done}
                        onChange={(e) => {
                          const next = [...settings.checklist];
                          next[i] = { ...c, done: e.target.checked };
                          setSettings({ ...settings, checklist: next });
                        }}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-[var(--color-primary)]"
                      />
                      <span className={`text-sm ${c.done ? "line-through text-muted-foreground" : ""}`}>
                        {c.text}
                      </span>
                    </label>
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          checklist: settings.checklist.filter((_, j) => j !== i),
                        })
                      }
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <AddItem
                onAdd={(text) =>
                  setSettings({
                    ...settings,
                    checklist: [...settings.checklist, { text, done: false }],
                  })
                }
              />
            </section>
          </div>

          {/* Right column: timer + plan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer */}
            <section className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-card p-6 lg:sticky lg:top-20">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {current ? (current.type === "work" ? `Working · ${current.label}` : "Break") : "Ready"}
              </div>
              <div className="text-xs text-muted-foreground mb-4 tabular-nums">
                Step {Math.min(stepIdx + 1, plan.length)} of {plan.length}
              </div>

              <div className="relative aspect-square max-w-[260px] mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-muted)" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress)}`}
                    className="transition-[stroke-dashoffset] duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="font-display text-5xl font-bold tabular-nums tracking-tighter">
                    {fmtTime(secLeft)}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setRunning((r) => !r)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:scale-[1.03] transition-transform"
                >
                  {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {running ? "Pause" : "Start"}
                </button>
                <button
                  onClick={() => {
                    setRunning(false);
                    setStepIdx((i) => Math.min(i + 1, plan.length - 1));
                    setSecLeft((plan[stepIdx + 1]?.mins ?? settings.workMin) * 60);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2.5 text-sm font-semibold hover:bg-muted"
                  aria-label="Skip"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setRunning(false);
                    setStepIdx(0);
                    setSecLeft(settings.workMin * 60);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2.5 text-sm font-semibold hover:bg-muted"
                  aria-label="Reset"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </section>

            {/* Plan preview */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold mb-3">Plan preview</h2>
              <ol className="space-y-1.5">
                {plan.map((p, i) => (
                  <li
                    key={i}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                      i === stepIdx ? "bg-primary/15 ring-1 ring-primary/40" : "bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          p.type === "work" ? "bg-primary" : "bg-muted-foreground/50"
                        }`}
                      />
                      <span className="font-semibold">{p.label}</span>
                    </div>
                    <span className="tabular-nums text-muted-foreground text-xs">
                      {p.start}–{p.end}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={copyPlan}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={downloadPlan}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  <Download className="h-3.5 w-3.5" />
                  .txt
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Session log */}
        <section className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold mb-1">Session log</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Capture what you accomplished and how focused you felt. Stored locally.
          </p>
          <div className="grid sm:grid-cols-[1fr_auto] gap-3 mb-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={sessionDone ? "What did you finish?" : "Notes from your last session…"}
              rows={2}
              className="rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="flex sm:flex-col gap-3 items-center sm:items-stretch">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`h-8 w-8 rounded-lg text-sm font-bold transition-all ${
                      rating >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                    aria-label={`Focus rating ${n}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                onClick={saveSession}
                className="rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background hover:opacity-90"
              >
                Log session
              </button>
            </div>
          </div>

          {log.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
              No sessions logged yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {log.map((entry) => (
                <li key={entry.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="tabular-nums">
                        {new Date(entry.date).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      <span>·</span>
                      <span>
                        {entry.workMin}min · {entry.blocks} blocks
                      </span>
                      <span>·</span>
                      <span className="text-primary font-semibold">★ {entry.rating}/5</span>
                    </div>
                    {entry.goal && (
                      <p className="text-sm font-semibold mt-0.5 truncate">{entry.goal}</p>
                    )}
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground mt-0.5">{entry.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setLog((l) => l.filter((e) => e.id !== entry.id))}
                    className="text-muted-foreground hover:text-destructive p-1"
                    aria-label="Delete entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* About / SEO content */}
        <section className="mt-12 prose prose-sm max-w-3xl">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            How to run a great deep work session
          </h2>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Deep work is the ability to focus without distraction on a cognitively demanding task. To
            make it repeatable, pair a clear <strong>intention</strong> with a fixed{" "}
            <strong>block structure</strong> (we recommend 90 minutes of focus followed by a 15 minute
            break, aligned to your body's natural ultradian rhythm). Use the pre-flight checklist to
            remove friction <em>before</em> the timer starts — every choice you make mid-session is a
            chance for your attention to drift.
          </p>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            This planner is one of {" "}
            <Link href="/productivity" className="text-primary underline-offset-2 hover:underline">
              Racira's {TOTAL_TOOLS} free productivity tools
            </Link>
            . No account, no tracking — everything you enter lives in your browser only.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function AddItem({ onAdd }: { onAdd: (text: string) => void }) {
  const [v, setV] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (v.trim()) {
          onAdd(v.trim());
          setV("");
        }
      }}
      className="mt-3 flex gap-2"
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Add checklist item…"
        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        className="rounded-lg bg-foreground text-background px-3 py-2 text-sm font-semibold hover:opacity-90"
      >
        Add
      </button>
    </form>
  );
}
