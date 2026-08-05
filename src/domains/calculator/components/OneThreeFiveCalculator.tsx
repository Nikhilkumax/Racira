"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Target, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { calculateOneThreeFive, DEFAULTS, type OneThreeFiveInputs, type OneThreeFiveResults } from "./OneThreeFiveLogic";

const fmt = (n: number, dec = 1) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "number",
  min,
  max,
  step,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const PIE_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const OneThreeFiveCalculator = () => {
  const [availableHours, setAvailableHours] = useState(String(DEFAULTS.availableHours));
  const [bigTaskHours, setBigTaskHours] = useState(String(DEFAULTS.bigTaskHours));
  const [mediumTaskHours, setMediumTaskHours] = useState(String(DEFAULTS.mediumTaskHours));
  const [smallTaskHours, setSmallTaskHours] = useState(String(DEFAULTS.smallTaskHours));
  const [showAdv, setShowAdv] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [results, setResults] = useState<OneThreeFiveResults>(() => calculateOneThreeFive(DEFAULTS));

  const getInputs = (): OneThreeFiveInputs => ({
    availableHours: parseFloat(availableHours) || 0,
    bigTaskHours: parseFloat(bigTaskHours) || 0,
    mediumTaskHours: parseFloat(mediumTaskHours) || 0,
    smallTaskHours: parseFloat(smallTaskHours) || 0,
  });

  const handleCalculate = () => {
    const inputs = getInputs();
    setResults(calculateOneThreeFive(inputs));
  };

  const reset = () => {
    setAvailableHours(String(DEFAULTS.availableHours));
    setBigTaskHours(String(DEFAULTS.bigTaskHours));
    setMediumTaskHours(String(DEFAULTS.mediumTaskHours));
    setSmallTaskHours(String(DEFAULTS.smallTaskHours));
    setShowAdv(false);
    setResults(calculateOneThreeFive(DEFAULTS));
  };

  useEffect(() => {
    handleCalculate();
  }, []);

  const valErrors: Record<string, string> = {};
  const avail = parseFloat(availableHours) || 0;
  const bigH = parseFloat(bigTaskHours) || 0;
  const medH = parseFloat(mediumTaskHours) || 0;
  const smallH = parseFloat(smallTaskHours) || 0;
  if (avail <= 0) valErrors.availableHours = "Available hours must be > 0";
  if (bigH <= 0) valErrors.bigTaskHours = "Big task hours must be > 0";
  if (medH <= 0) valErrors.mediumTaskHours = "Medium task hours must be > 0";
  if (smallH <= 0) valErrors.smallTaskHours = "Small task hours must be > 0";
  if (avail > 24) valErrors.availableHours = "Available hours cannot exceed 24";
  const hasValidationErrors = Object.keys(valErrors).length > 0;

  const pieData = [
    { name: "Big Task", value: results.bigTasks, color: PIE_COLORS[0] },
    { name: "Medium Tasks", value: results.mediumTasks, color: PIE_COLORS[1] },
    { name: "Small Tasks", value: results.smallTasks, color: PIE_COLORS[2] },
  ];

  const piePcts = pieData.map(item => {
    const total = pieData.reduce((a, b) => a + b.value, 0);
    if (total <= 0) return 0;
    return Math.round((item.value / total) * 1000) / 10;
  });
  const pieSumPct = piePcts.reduce((a, b) => a + b, 0);
  let pieDataWithPcts = pieData.map((item, i) => ({ ...item, pct: piePcts[i] }));
  if (pieData.reduce((a, b) => a + b.value, 0) > 0 && Math.abs(pieSumPct - 100) > 0.1) {
    const diff = Math.round((100 - pieSumPct) * 10) / 10;
    const maxIdx = piePcts.indexOf(Math.max(...piePcts));
    pieDataWithPcts[maxIdx].pct = Math.round((pieDataWithPcts[maxIdx].pct + diff) * 10) / 10;
  }
  const pieDataFinal = pieDataWithPcts.filter(d => d.value > 0);

  const breakdownRows = [
    { label: "Big Tasks (1)", value: `${results.bigTasks}`, highlight: true },
    { label: "Medium Tasks (3)", value: `${results.mediumTasks}` },
    { label: "Small Tasks (5)", value: `${results.smallTasks}` },
    { label: "Total Tasks", value: `${results.totalTasks}` },
    { label: "Productivity Score", value: `${results.productivityScore}%` },
  ];

  const summaryStats = [
    { label: "Available Hours", value: `${fmt(avail)} hrs` },
    { label: "Big Task Duration", value: `${fmt(bigH)} hrs` },
    { label: "Medium Task Duration", value: `${fmt(medH)} hrs` },
    { label: "Small Task Duration", value: `${fmt(smallH)} hrs` },
    { label: "Remaining Hours", value: `${fmt(results.remainingHours)} hrs` },
    { label: "Productivity Score", value: `${results.productivityScore}%` },
  ];

  const faqs = [
    { question: "What is the 1-3-5 rule?", answer: "The 1-3-5 rule is a time management strategy where you commit to accomplishing 1 big thing, 3 medium things, and 5 small things on any given day, totaling 9 tasks." },
    { question: "How does the 1-3-5 calculator work?", answer: "It calculates your productivity score and daily plan based on your available hours and the estimated hours for big, medium, and small tasks." },
    { question: "Why is the 1-3-5 rule effective?", answer: "It forces you to prioritize your tasks, preventing overwhelm by limiting the number of major commitments while still allowing you to get smaller tasks done." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "1-3-5 Daily Task Prioritization Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">1-3-5 Daily Task Prioritization Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput
                id="available-hours"
                label="Available Hours"
                value={availableHours}
                onChange={setAvailableHours}
                suffix="hrs"
              />
              <CompactInput
                id="big-task-hours"
                label="Big Task Hours"
                value={bigTaskHours}
                onChange={setBigTaskHours}
                suffix="hrs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput
                id="medium-task-hours"
                label="Medium Task Hours"
                value={mediumTaskHours}
                onChange={setMediumTaskHours}
                suffix="hrs"
              />
              <CompactInput
                id="small-task-hours"
                label="Small Task Hours"
                value={smallTaskHours}
                onChange={setSmallTaskHours}
                suffix="hrs"
              />
            </div>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                {showAdv ? <span className="text-xs">▼</span> : <span className="text-xs">▶</span>}
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Task Duration Settings</div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex flex-col">
                        <label htmlFor="big-task-hours-adv" className="text-sm font-semibold text-foreground mb-1">Big Task Hours</label>
                        <div className="relative h-9">
                          <input
                            id="big-task-hours-adv"
                            type="number"
                            value={bigTaskHours}
                            onChange={(e) => setBigTaskHours(e.target.value)}
                            className="w-full h-full pl-3 pr-8 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">hrs</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="medium-task-hours-adv" className="text-sm font-semibold text-foreground mb-1">Medium Task Hours</label>
                        <div className="relative h-9">
                          <input
                            id="medium-task-hours-adv"
                            type="number"
                            value={mediumTaskHours}
                            onChange={(e) => setMediumTaskHours(e.target.value)}
                            className="w-full h-full pl-3 pr-8 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">hrs</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="small-task-hours-adv" className="text-sm font-semibold text-foreground mb-1">Small Task Hours</label>
                        <div className="relative h-9">
                          <input
                            id="small-task-hours-adv"
                            type="number"
                            value={smallTaskHours}
                            onChange={(e) => setSmallTaskHours(e.target.value)}
                            className="w-full h-full pl-3 pr-8 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">hrs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {hasValidationErrors && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                ⚠️ Please fix the errors above before calculating.
              </div>
            )}

            <div className="flex gap-2.5">
              <Button
                type="button"
                disabled={hasValidationErrors}
                onClick={handleCalculate}
                className="flex-1 h-10 text-base font-bold"
              >
                Calculate
              </Button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Daily Task Plan</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.totalTasks} Tasks
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                1 Big | {results.mediumTasks} Medium | {results.smallTasks} Small | {results.remainingHours}h Remaining
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Big Tasks</span>
                <span className="font-extrabold text-foreground">{results.bigTasks}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Medium Tasks</span>
                <span className="font-extrabold text-foreground">{results.mediumTasks}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Small Tasks</span>
                <span className="font-extrabold text-foreground">{results.smallTasks}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Task Type</th>
                    <th className="p-2.5 text-right w-[100px]">Count</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Hours Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors bg-amber-500/10 text-amber-700 font-bold">
                    <td className="p-2.5 pl-3 text-amber-700 font-bold">Big Task</td>
                    <td className="p-2.5 text-right text-amber-700 font-bold">{results.bigTasks}</td>
                    <td className="p-2.5 pr-3 text-right text-amber-700 font-bold">{fmt(results.bigTasks * bigH)} hrs</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Medium Tasks</td>
                    <td className="p-2.5 text-right font-semibold text-foreground">{results.mediumTasks}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(results.mediumTasks * medH)} hrs</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Small Tasks</td>
                    <td className="p-2.5 text-right font-semibold text-foreground">{results.smallTasks}</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(results.smallTasks * smallH)} hrs</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">{results.totalTasks}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(avail - results.remainingHours)} hrs</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DONUT CHART */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border bg-card">
              <div className="shrink-0">
                {mounted && pieDataFinal.length > 0 ? (
                  <div className="w-[160px] h-[160px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pieDataFinal}>
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {pieDataFinal.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value: any) => [typeof value === 'number' ? value.toFixed(1) : value, ""]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="w-[160px] h-[160px] flex items-center justify-center text-muted-foreground text-xs">Loading chart...</div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-primary/10 text-primary font-bold text-xs">📊</span>
                  Task Distribution
                </h4>
                {pieDataFinal.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-bold text-foreground">{typeof item.value === 'number' ? item.value.toFixed(1) : item.value} ({item.pct.toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                {summaryStats.map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <PopularCalculators exclude="/calculator/1-3-5-daily-task-prioritization-calculator" />
        <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/1-3-5-daily-task-prioritization-calculator" />
      </div>
    </>
  );
};

export default OneThreeFiveCalculator;
