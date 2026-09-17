"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface SymInput {
  bench: number;
  overheadPress: number;
  row: number;
  deadlift: number;
  bodyWeight: number;
}

interface SymResult {
  pushPullRatio: number;
  pressRatio: number;
  pushPullStatus: string;
  pushPullColor: string;
  pressStatus: string;
  pressColor: string;
  overallStatus: string;
  total: number;
  chartData: { name: string; lift: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function ratioStatus(ratio: number, low: number, high: number): { status: string; color: string } {
  if (ratio >= low && ratio <= high) return { status: "Balanced", color: "text-emerald-600" };
  if (ratio < low) return { status: "Pull-Dominant", color: "text-amber-500" };
  return { status: "Push-Dominant", color: "text-red-500" };
}

function calcSym(input: SymInput): SymResult {
  const pushPullRatio = input.row > 0 ? input.bench / input.row : 0;
  const pressRatio = input.bench > 0 ? input.overheadPress / input.bench : 0;
  const total = input.bench + input.overheadPress + input.row + input.deadlift;

  const pp = ratioStatus(pushPullRatio, 0.9, 1.15);
  const pr = ratioStatus(pressRatio, 0.55, 0.7);
  const overallStatus = pp.status === "Balanced" && pr.status === "Balanced" ? "Well Balanced" : "Imbalance Detected";
  const overallColor = overallStatus === "Well Balanced" ? "text-emerald-600" : "text-amber-500";

  const chartData = [
    { name: "Bench Press", lift: input.bench, fill: "hsl(var(--primary))" },
    { name: "Overhead Press", lift: input.overheadPress, fill: "#3b82f6" },
    { name: "Barbell Row", lift: input.row, fill: "#10b981" },
    { name: "Deadlift", lift: input.deadlift, fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Body Weight", value: `${input.bodyWeight} lb` },
    { label: "Bench Press 1RM", value: `${input.bench} lb` },
    { label: "Overhead Press 1RM", value: `${input.overheadPress} lb` },
    { label: "Barbell Row 1RM", value: `${input.row} lb` },
    { label: "Deadlift 1RM", value: `${input.deadlift} lb` },
    { label: "Push:Pull Ratio (Bench ÷ Row)", value: `${pushPullRatio.toFixed(2)}` },
    { label: "Press Ratio (OHP ÷ Bench)", value: `${pressRatio.toFixed(2)}` },
    { label: "Total 1RM", value: `${total.toLocaleString()} lb` },
    { label: "Overall Assessment", value: overallStatus },
  ];

  const summaryStats = [
    { label: "Push:Pull Ratio", value: `${pushPullRatio.toFixed(2)} (${pp.status})` },
    { label: "Press Ratio", value: `${pressRatio.toFixed(2)} (${pr.status})` },
    { label: "Overall Assessment", value: overallStatus },
    { label: "Total 1RM", value: `${total.toLocaleString()} lb` },
    { label: "Bench ÷ Bodyweight", value: `${(input.bench / input.bodyWeight).toFixed(2)}×` },
    { label: "Deadlift ÷ Bodyweight", value: `${(input.deadlift / input.bodyWeight).toFixed(2)}×` },
  ];

  return { pushPullRatio, pressRatio, pushPullStatus: pp.status, pushPullColor: pp.color, pressStatus: pr.status, pressColor: pr.color, overallStatus, total, chartData, breakdown, summaryStats };
}

const DEFAULTS: SymInput = { bench: 185, overheadPress: 115, row: 185, deadlift: 315, bodyWeight: 175 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SymmetricStrengthCalculator() {
  const [bench, setBench] = useState(String(DEFAULTS.bench));
  const [ohp, setOhp] = useState(String(DEFAULTS.overheadPress));
  const [row, setRow] = useState(String(DEFAULTS.row));
  const [deadlift, setDeadlift] = useState(String(DEFAULTS.deadlift));
  const [bodyWeight, setBodyWeight] = useState(String(DEFAULTS.bodyWeight));
  const [result, setResult] = useState<SymResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcSym({
      bench: parse(bench, DEFAULTS.bench),
      overheadPress: parse(ohp, DEFAULTS.overheadPress),
      row: parse(row, DEFAULTS.row),
      deadlift: parse(deadlift, DEFAULTS.deadlift),
      bodyWeight: parse(bodyWeight, DEFAULTS.bodyWeight),
    }));
  const reset = () => {
    setBench(String(DEFAULTS.bench));
    setOhp(String(DEFAULTS.overheadPress));
    setRow(String(DEFAULTS.row));
    setDeadlift(String(DEFAULTS.deadlift));
    setBodyWeight(String(DEFAULTS.bodyWeight));
    setResult(calcSym(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSym(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is strength symmetry?", answer: "Strength symmetry compares opposing muscle groups — push versus pull, and overhead press versus bench press. Large imbalances between opposing movements increase the risk of shoulder and postural issues and can indicate weak stabilizer muscles." },
    { question: "What is a balanced push:pull ratio?", answer: "A balanced bench press to barbell row ratio is roughly 1:1 (0.9–1.15). If your bench far exceeds your row, your back and rear delts are underdeveloped relative to your chest, which commonly leads to rounded shoulders." },
    { question: "What is a healthy press ratio?", answer: "The overhead press should be roughly 55–70% of your bench press. A lower ratio usually means the front delts dominate and the triceps, upper back, and rear delts are lagging — a common cause of shoulder impingement." },
    { question: "How do I fix an imbalance?", answer: "Prioritize the weaker movement for 4–8 weeks: add an extra set or a dedicated accessory (e.g., rows or face pulls for push-dominant lifters), and keep the stronger movement at maintenance volume until ratios rebalance." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Symmetric Strength Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Symmetric Strength Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Bench Press 1RM</label>
                <div className={inp}><input type="number" value={bench} onChange={(e) => setBench(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">lb</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Overhead Press 1RM</label>
                <div className={inp}><input type="number" value={ohp} onChange={(e) => setOhp(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">lb</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Barbell Row 1RM</label>
                <div className={inp}><input type="number" value={row} onChange={(e) => setRow(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">lb</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Deadlift 1RM</label>
                <div className={inp}><input type="number" value={deadlift} onChange={(e) => setDeadlift(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">lb</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Body Weight</label>
                <div className={inp}><input type="number" value={bodyWeight} onChange={(e) => setBodyWeight(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">lb</span></div>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Overall Strength Balance</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${result.overallStatus === "Well Balanced" ? "text-emerald-600" : "text-amber-500"}`}>{result.overallStatus}</div>
                  <div className="text-sm text-muted-foreground mt-1">Push:Pull {result.pushPullRatio.toFixed(2)} ({result.pushPullStatus}) · Press {result.pressRatio.toFixed(2)} ({result.pressStatus})</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Push:Pull", `${result.pushPullRatio.toFixed(2)}`], ["Press Ratio", `${result.pressRatio.toFixed(2)}`], ["Total 1RM", `${result.total.toLocaleString()} lb`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Lift Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Lift Comparison</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v} lb`, ""]} />
                      <Bar dataKey="lift" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Strength Balance Matters</h2>
            <p>Opposing muscle groups should develop together. When push strength (chest, front delts, triceps) far outstrips pull strength (upper back, rear delts, biceps), posture shifts forward and shoulder injury risk climbs. This calculator compares your horizontal push:pull and your press ratios to flag imbalances early.</p>
            <h2 className="text-2xl font-bold mb-3">The Two Key Ratios</h2>
            <p>Bench press to barbell row should sit near 1:1 (0.9–1.15). Overhead press should be 55–70% of bench. If either ratio falls outside these bands, add volume to the lagging movement for 4–8 weeks while holding the stronger movement at maintenance.</p>
            <h2 className="text-2xl font-bold mb-3">Context and Limitations</h2>
            <p>Ratios vary by training history, body proportions, and technique. Use the assessment as a directional signal, not a diagnosis. If you feel pain, see a physiotherapist — imbalance ratios are a screening tool, not a medical assessment.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/symmetric-strength-calculator" />
          <PopularCalculators exclude="/calculator/symmetric-strength-calculator" />
        </div>
      </div>
    </>
  );
}
