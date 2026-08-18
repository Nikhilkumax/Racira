"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface LoveInputs {
  name1: string;
  name2: string;
}

interface LoveResults {
  score: number;
  verdict: string;
  combined: string;
  asciiSum: number;
  moduloScore: number;
  lengthBonus: number;
  name1Len: number;
  name2Len: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function calcLove(i: LoveInputs): LoveResults | null {
  const n1 = i.name1.trim().toLowerCase();
  const n2 = i.name2.trim().toLowerCase();
  if (!n1 || !n2) return null;

  // Deterministic numerology: ASCII sum → prime-modulo score, same names always → same score
  const combined = n1 + "loves" + n2;
  let sum = 0;
  for (let i = 0; i < combined.length; i++) {
    sum += combined.charCodeAt(i);
  }
  const moduloScore = (sum * 73) % 101;
  const lengthBonus = (n1.length * n2.length) % 101;
  const score = (moduloScore + lengthBonus) % 101;

  let verdict: string;
  if (score >= 90) verdict = "A match made in heaven — you two are absolutely perfect for each other.";
  else if (score >= 75) verdict = "Sparks are flying — there is a very strong connection here.";
  else if (score >= 50) verdict = "There is definite potential — with a little effort this could blossom.";
  else if (score >= 25) verdict = "It might take some work — you have different vibes, but opposites can attract.";
  else verdict = "Not the best numerological match — but true love defies all odds.";

  const chartData = [
    { name: "Compatibility", value: score },
    { name: "Remainder", value: 100 - score },
  ];

  const breakdown = [
    { label: "Person 1", value: `${n1.length} letters` },
    { label: "Person 2", value: `${n2.length} letters` },
    { label: "Combined String", value: `"${combined}"` },
    { label: "ASCII Sum", value: `${sum}` },
    { label: "Modulo Step (sum × 73 % 101)", value: `${moduloScore}` },
    { label: "Length Bonus (len₁ × len₂ % 101)", value: `${lengthBonus}` },
    { label: "Compatibility Score", value: `${score}%`, highlight: true, isTotal: true },
    { label: "Verdict", value: verdict },
  ];

  const summaryStats = [
    { label: "Compatibility Score", value: `${score}%` },
    { label: "Verdict", value: verdict },
    { label: "ASCII Sum", value: `${sum}` },
    { label: "Modulo Step", value: `${moduloScore}` },
    { label: "Length Bonus", value: `${lengthBonus}` },
    { label: "Person 1 Length", value: `${n1.length} letters` },
    { label: "Person 2 Length", value: `${n2.length} letters` },
    { label: "Combined Length", value: `${combined.length} characters` },
  ];

  return { score, verdict, combined, asciiSum: sum, moduloScore, lengthBonus, name1Len: n1.length, name2Len: n2.length, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS: LoveInputs = { name1: "Romeo", name2: "Juliet" };

// 4. Component
export default function LoveCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<LoveResults | null>(() => calcLove(DEFAULTS));

  useEffect(() => {
    setResult(calcLove(DEFAULTS));
  }, []);

  const set = (key: keyof LoveInputs) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => setResult(calcLove(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcLove(DEFAULTS));
  };

  const hasErrors = !inputs.name1.trim() || !inputs.name2.trim();

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How does the Love Calculator actually work?", answer: "This calculator uses a deterministic numerology algorithm. It converts the letters of both names into their numerical ASCII values, combines them with a prime-modulo formula, and outputs a percentage. Because it relies on the exact spelling of the names, entering the same two names always yields the exact same score — enter them in either order to compare." },
    { question: "Is this scientifically accurate?", answer: "Absolutely not! This calculator is purely for fun and entertainment. Human relationships are complex, beautiful, and entirely unpredictable. No mathematical algorithm or computer code can dictate who you will fall in love with. If you get a low score with your crush, ignore it and go talk to them!" },
    { question: "Does the order of the names matter?", answer: "Yes. Because the algorithm processes the combined character string, putting 'John' first and 'Jane' second can yield a slightly different score than the reverse. For the best reading, try it both ways!" },
    { question: "Why do we associate the heart symbol with love?", answer: "The modern heart symbol actually looks very little like a biological human heart. Historians believe the symbol originated in antiquity as a representation of the seedpod of the silphium plant, a species of giant fennel that was highly valued as a herbal contraceptive by the ancient Greeks and Romans." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Love Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Love Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="name1" className={lbl}>Person 1</label>
                <div className={inp}>
                  <input id="name1" type="text" value={inputs.name1} onChange={(e) => set("name1")(e.target.value)} className={ci} placeholder="First name" />
                </div>
              </div>
              <div>
                <label htmlFor="name2" className={lbl}>Person 2</label>
                <div className={inp}>
                  <input id="name2" type="text" value={inputs.name2} onChange={(e) => set("name2")(e.target.value)} className={ci} placeholder="First name" />
                </div>
              </div>
            </div>
            {hasErrors && <p className="text-xs text-red-500 font-medium -mt-1">Enter both names to calculate compatibility.</p>}

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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Compatibility Score</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result ? `${result.score}%` : "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {inputs.name1.trim() || "Person 1"} + {inputs.name2.trim() || "Person 2"} · deterministic, same names → same score
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Letters (P1)", result ? `${result.name1Len}` : "—"],
                ["Letters (P2)", result ? `${result.name2Len}` : "—"],
                ["Score Band", result ? (result.score >= 75 ? "Strong" : result.score >= 50 ? "Promising" : "Mixed") : "—"],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">How the Score Is Built</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result?.breakdown.map((r, i) => (
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
              <h3 className="text-base font-bold mb-4">Score out of 100</h3>
              {result ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                        <Cell fill="hsl(var(--primary))" />
                        <Cell fill="hsl(var(--muted-foreground) / 0.2)" />
                      </Pie>
                      <Tooltip formatter={(v: number, n: string) => [n === "Compatibility" ? `${v}%` : `${v}%`, n]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2 text-center">A pure entertainment score — chemistry is measured in person, not in modulo.</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Enter both names to see the breakdown.</p>
              )}
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result?.summaryStats.map((s, i) => (
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
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Romance</h2>
            <p>Can a computer algorithm truly predict love? Since the dawn of the internet, love calculators have been popular tools for friends and couples to test their compatibility. While they are purely for entertainment, the mathematics running behind the scenes are quite interesting.</p>
            <h2 className="text-2xl font-bold mb-3">How Deterministic Algorithms Work</h2>
            <p>If you type "Romeo" and "Juliet" into the calculator, you get a specific score — and you get the exact same score tomorrow. This is because the calculator is not randomly generating a number; it is using a deterministic algorithm. Computers do not natively understand letters; they only understand numbers. Every letter on your keyboard is assigned a numerical ASCII code — a capital 'A' is 65, a lowercase 'a' is 97. The calculator converts every letter of both names into its numerical value, adds them all into a massive sum, then runs that sum through a prime-modulo operation to compress it into a percentage between 0 and 100.</p>
            <h2 className="text-2xl font-bold mb-3">Why Opposites Attract</h2>
            <p>While numerology is fun, human psychology is much more complex. Psychologists have long studied why certain personalities mesh well together — and research suggests the "opposites attract" theory has some backing. A highly organized, structured person often pairs incredibly well with a spontaneous, relaxed one: the structured partner provides stability and planning, while the spontaneous partner introduces excitement and flexibility. So if this calculator gives you a low score because your names are vastly different, take heart — in the real world, differences are often the foundation of the strongest relationships.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/love-calculator" />
          <PopularCalculators exclude="/calculator/love-calculator" />
        </div>
      </div>
    </>
  );
}
