"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface TypingInputs {
  characters: number;
  minutes: number;
  errors: number;
}

interface ChartPoint {
  name: string;
  wpm: number;
}

interface TypingResults {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  wordsTyped: number;
  errorsPerMinute: number;
  classification: string;
  chartData: ChartPoint[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function classifyWpm(net: number): string {
  if (net < 20) return "Beginner (< 20)";
  if (net < 40) return "Average (20-40)";
  if (net < 60) return "Fast (40-60)";
  if (net < 80) return "Professional (60-80)";
  return "Expert (80+)";
}

function calcTyping(i: TypingInputs): TypingResults {
  const wordsTyped = i.characters / 5;
  const grossWpm = i.minutes > 0 ? wordsTyped / i.minutes : 0;
  const errorsPerMinute = i.minutes > 0 ? i.errors / i.minutes : 0;
  const netWpm = Math.max(0, grossWpm - errorsPerMinute);
  const accuracy = i.characters > 0 ? Math.max(0, ((i.characters - i.errors) / i.characters) * 100) : 0;

  const chartData: ChartPoint[] = [
    { name: "Gross WPM", wpm: grossWpm },
    { name: "Net WPM", wpm: netWpm },
  ];

  const breakdown = [
    { label: "Characters Typed", value: `${i.characters.toLocaleString()}` },
    { label: "Words Typed (5 chars each)", value: `${wordsTyped.toFixed(1)}` },
    { label: "Time", value: `${i.minutes} min` },
    { label: "Errors", value: `${i.errors}` },
    { label: "Gross WPM", value: `${grossWpm.toFixed(1)}` },
    { label: "Errors per Minute", value: `${errorsPerMinute.toFixed(1)}` },
    { label: "Net WPM", value: `${netWpm.toFixed(1)}`, highlight: true },
    { label: "Accuracy", value: `${accuracy.toFixed(1)}%`, isTotal: true },
  ];

  const summaryStats = [
    { label: "Gross WPM", value: grossWpm.toFixed(1) },
    { label: "Net WPM", value: netWpm.toFixed(1) },
    { label: "Accuracy", value: `${accuracy.toFixed(1)}%` },
    { label: "Words Typed", value: wordsTyped.toFixed(1) },
    { label: "Errors", value: `${i.errors}` },
    { label: "Errors per Minute", value: errorsPerMinute.toFixed(1) },
    { label: "Time", value: `${i.minutes} min` },
    { label: "Level", value: classifyWpm(netWpm) },
  ];

  return { grossWpm, netWpm, accuracy, wordsTyped, errorsPerMinute, classification: classifyWpm(netWpm), chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  characters: "300",
  minutes: "2",
  errors: "5",
};

// 4. Component
export default function TypingSpeedCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<TypingResults>(() => calcTyping({ characters: 300, minutes: 2, errors: 5 }));

  useEffect(() => {
    setResult(calcTyping({ characters: 300, minutes: 2, errors: 5 }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(calcTyping({ characters: parseFloat(inputs.characters) || 0, minutes: parseFloat(inputs.minutes) || 0, errors: parseFloat(inputs.errors) || 0 }));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcTyping({ characters: 300, minutes: 2, errors: 5 }));
  };

  // Validation
  const errors: Record<string, string> = {};
  const chars = parseFloat(inputs.characters) || 0;
  const mins = parseFloat(inputs.minutes) || 0;
  const errs = parseFloat(inputs.errors) || 0;
  if (inputs.characters.trim() === "") errors.characters = "Required";
  else if (chars <= 0) errors.characters = "Must be greater than 0";
  if (inputs.minutes.trim() === "") errors.minutes = "Required";
  else if (mins <= 0) errors.minutes = "Must be greater than 0";
  if (errs < 0) errors.errors = "Cannot be negative";
  else if (errs > chars) errors.errors = "Errors cannot exceed characters";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How is WPM calculated?", answer: "One 'word' is standardized as 5 characters, including spaces and punctuation. Gross WPM = (characters typed ÷ 5) ÷ minutes. Net WPM subtracts one word for every error: net = gross − (errors ÷ minutes). This matches standard typing-test scoring." },
    { question: "What is a good typing speed?", answer: "The average typist manages 35-45 WPM. 50-60 WPM is considered good for office work, 60-80 is professional-level (many transcription and data-entry jobs require this), and 80+ WPM is expert territory — fast enough to keep up with live dictation." },
    { question: "How do I improve my WPM?", answer: "Touch typing is the biggest lever: stop looking at the keyboard and use the home row. Practice 10-15 minutes daily with accuracy first — sloppy corrections cost more time than slow, accurate typing. Use proper posture and relax your shoulders to reduce fatigue." },
    { question: "What is the difference between gross and net WPM?", answer: "Gross WPM counts every character typed. Net WPM penalizes errors, which is the fairer measure of usable speed. If you type fast but correct constantly, your net WPM reveals the real bottleneck." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Typing Speed Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Typing Speed Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="chars" className={lbl}>Characters Typed</label>
                <div className={inp}>
                  <input id="chars" type="number" min="1" value={inputs.characters} onChange={(e) => set("characters")(e.target.value)} className={ci} />
                </div>
                {errors.characters && <p className="text-xs text-red-500 font-medium mt-1">{errors.characters}</p>}
              </div>
              <div>
                <label htmlFor="mins" className={lbl}>Time (Minutes)</label>
                <div className={inp}>
                  <input id="mins" type="number" min="0.1" step="0.1" value={inputs.minutes} onChange={(e) => set("minutes")(e.target.value)} className={ci} />
                </div>
                {errors.minutes && <p className="text-xs text-red-500 font-medium mt-1">{errors.minutes}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="errs" className={lbl}>Number of Errors</label>
              <div className={inp}>
                <input id="errs" type="number" min="0" value={inputs.errors} onChange={(e) => set("errors")(e.target.value)} className={ci} />
              </div>
              {errors.errors && <p className="text-xs text-red-500 font-medium mt-1">{errors.errors}</p>}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Net Typing Speed</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.netWpm.toFixed(1)} <span className="text-xl text-muted-foreground">WPM</span></div>
              <div className="text-sm text-muted-foreground mt-1">Gross: {result.grossWpm.toFixed(1)} WPM · Accuracy: {result.accuracy.toFixed(1)}% · {result.classification}</div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Gross WPM", `${result.grossWpm.toFixed(1)}`],
                ["Net WPM", `${result.netWpm.toFixed(1)}`],
                ["Accuracy", `${result.accuracy.toFixed(1)}%`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Speed Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Gross vs Net Speed (WPM)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)} WPM`, "Speed"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="wpm" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((d, idx) => (
                      <Cell key={idx} fill={idx === 0 ? "hsl(var(--muted-foreground) / 0.35)" : "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">The gap between gross and net shows how much time errors cost you.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Measuring Typing Speed</h2>
            <p>Typing speed is measured in words per minute, where one word equals five characters including spaces and punctuation. Gross WPM measures raw output; net WPM subtracts a word for every error, giving the true usable speed. Accuracy is the share of correctly typed characters.</p>
            <h2 className="text-2xl font-bold mb-3">What Your Numbers Mean</h2>
            <p>Most people type 35-45 WPM. Office and administrative roles typically expect 45-60. Transcription and data entry often require 60-80. Programmers and writers benefit most from high accuracy rather than extreme speed — a 5% accuracy gain usually saves more time than a 10 WPM speed gain, because corrections interrupt flow.</p>
            <h2 className="text-2xl font-bold mb-3">Improving Both Metrics</h2>
            <p>Practice touch typing on the home row, use online drills that show errors immediately, and measure net WPM rather than raw speed. Twenty focused minutes a day for a month typically lifts net speed by 10-15 WPM while holding accuracy above 95%.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/typing-speed-calculator" />
          <PopularCalculators exclude="/calculator/typing-speed-calculator" />
        </div>
      </div>
    </>
  );
}
