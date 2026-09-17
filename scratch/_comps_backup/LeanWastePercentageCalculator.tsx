"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface WasteInput {
  totalHours: number;
  wastedHours: number;
  hourlyRate: number;
}

interface WasteResult {
  wastePct: number;
  productivePct: number;
  productiveHours: number;
  monthlyWasteCost: number;
  annualWasteCost: number;
  halfReductionSavings: number;
  donutData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcWaste(input: WasteInput): WasteResult {
  const total = Math.max(0, input.totalHours);
  const wasted = Math.min(Math.max(0, input.wastedHours), total);
  const productiveHours = total - wasted;
  const wastePct = total > 0 ? (wasted / total) * 100 : 0;
  const productivePct = 100 - wastePct;
  const monthlyWasteCost = wasted * input.hourlyRate;
  const annualWasteCost = monthlyWasteCost * 12;
  const halfReductionSavings = annualWasteCost * 0.5;

  const donutData = [
    { name: "Productive Time", value: Number(productivePct.toFixed(1)), color: "#10b981" },
    { name: "Wasted Time", value: Number(wastePct.toFixed(1)), color: "#ef4444" },
  ];

  const breakdown = [
    { label: "Total Production Hours / Month", value: `${total.toLocaleString()} hrs` },
    { label: "Wasted Hours / Month", value: `${wasted.toLocaleString()} hrs` },
    { label: "Productive Hours / Month", value: `${productiveHours.toLocaleString()} hrs` },
    { label: "Waste Percentage", value: `${wastePct.toFixed(1)}%` },
    { label: "Productive Percentage", value: `${productivePct.toFixed(1)}%` },
    { label: "Monthly Cost of Waste", value: `$${monthlyWasteCost.toLocaleString()}` },
    { label: "Annual Cost of Waste", value: `$${annualWasteCost.toLocaleString()}` },
    { label: "Potential Savings (50% Cut)", value: `$${halfReductionSavings.toLocaleString()}/yr` },
  ];

  const summaryStats = [
    { label: "Waste Percentage", value: `${wastePct.toFixed(1)}%` },
    { label: "Productive Percentage", value: `${productivePct.toFixed(1)}%` },
    { label: "Wasted Hours / Month", value: `${wasted.toLocaleString()}` },
    { label: "Productive Hours / Month", value: `${productiveHours.toLocaleString()}` },
    { label: "Annual Waste Cost", value: `$${annualWasteCost.toLocaleString()}` },
    { label: "Monthly Waste Cost", value: `$${monthlyWasteCost.toLocaleString()}` },
  ];

  return { wastePct, productivePct, productiveHours, monthlyWasteCost, annualWasteCost, halfReductionSavings, donutData, breakdown, summaryStats };
}

const DEFAULTS: WasteInput = { totalHours: 800, wastedHours: 120, hourlyRate: 45 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function LeanWastePercentageCalculator() {
  const [totalHours, setTotalHours] = useState(String(DEFAULTS.totalHours));
  const [wastedHours, setWastedHours] = useState(String(DEFAULTS.wastedHours));
  const [hourlyRate, setHourlyRate] = useState(String(DEFAULTS.hourlyRate));
  const [result, setResult] = useState<WasteResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcWaste({ totalHours: parse(totalHours, DEFAULTS.totalHours), wastedHours: parse(wastedHours, DEFAULTS.wastedHours), hourlyRate: parse(hourlyRate, DEFAULTS.hourlyRate) }));
  const reset = () => {
    setTotalHours(String(DEFAULTS.totalHours));
    setWastedHours(String(DEFAULTS.wastedHours));
    setHourlyRate(String(DEFAULTS.hourlyRate));
    setResult(calcWaste(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcWaste(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is lean waste?", answer: "Lean waste is any activity that consumes time, resources, or effort without adding value for the customer. The classic seven wastes of lean manufacturing are overproduction, waiting, transport, over-processing, excess inventory, unnecessary motion, and defects — often summarized as TIMWOOD." },
    { question: "How do I measure waste percentage?", answer: "Waste Percentage = Wasted Hours ÷ Total Process Hours × 100. Track a process over a representative period, categorize each hour as value-adding or non-value-adding, and divide. World-class lean operations run below 5% waste; typical organizations see 15–30%." },
    { question: "What is the cost of waste?", answer: "The cost of waste = wasted hours × fully loaded hourly cost. 'Fully loaded' includes wages, benefits, overhead, and equipment time. For a $45/hour operation with 120 wasted hours per month, waste costs $5,400 monthly — $64,800 annually." },
    { question: "What are the seven wastes (TIMWOOD)?", answer: "Transport (unnecessary movement of materials), Inventory (excess stock), Motion (unnecessary movement of people), Waiting (idle time), Overproduction (making more than demanded), Over-processing (more work than the customer values), and Defects (rework and scrap)." },
    { question: "How can I reduce process waste?", answer: "Map the value stream, apply 5S to organize the workplace, implement pull-based kanban systems, reduce batch sizes, use single-minute exchange of die (SMED) to cut changeover time, and build quality in with poka-yoke mistake-proofing so defects never reach the next step." },
    { question: "Is waste percentage the same as efficiency?", answer: "They are related but different. Efficiency compares actual output to standard output. Waste percentage measures the share of time spent on non-value-adding activity. A process can be highly 'efficient' at producing output while still wasting 20% of its time — the waste metric targets that gap directly." },
  ];

  const costColor = result && result.annualWasteCost > 0 ? "text-red-500" : "text-muted-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Lean Waste Percentage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Lean Waste Percentage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Total Production Hours / Month</label>
                <div className={inp}><input type="number" value={totalHours} onChange={(e) => setTotalHours(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">hrs</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Wasted Hours / Month</label>
                <div className={inp}><input type="number" value={wastedHours} onChange={(e) => setWastedHours(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">hrs</span></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Fully Loaded Hourly Cost</label>
              <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className={ci} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Waste Percentage</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${result.wastePct > 15 ? "text-red-500" : result.wastePct > 5 ? "text-amber-500" : "text-emerald-600"}`}>{result.wastePct.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground mt-1">Productive time: {result.productivePct.toFixed(1)}% · Annual waste cost: ${result.annualWasteCost.toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Waste", `${result.wastePct.toFixed(1)}%`], ["Productive", `${result.productivePct.toFixed(1)}%`], ["Annual Waste Cost", `$${result.annualWasteCost.toLocaleString()}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Waste Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Time Utilization</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {result.donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className={`font-semibold ${s.label === "Annual Waste Cost" ? costColor : ""}`}>{s.value}</span></div>
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
            <h2 className="text-2xl font-bold mb-3">What Is Lean Waste?</h2>
            <p>In lean manufacturing, waste (muda) is any activity that consumes resources without creating value for the customer. Measuring your waste percentage — the share of production hours spent on non-value-adding activity — is the first step of any continuous improvement program. Most organizations discover 15–30% of their time is waste.</p>
            <h2 className="text-2xl font-bold mb-3">The Seven Wastes</h2>
            <p>TIMWOOD stands for Transport, Inventory, Motion, Waiting, Overproduction, Over-processing, and Defects. Each category represents a specific, measurable drain on throughput. Attack the largest categories first: waiting and overproduction typically dominate, followed by defects which force costly rework.</p>
            <h2 className="text-2xl font-bold mb-3">From Measurement to Savings</h2>
            <p>Once waste is measured in hours and dollars, set a reduction target. A realistic first-year goal is cutting waste 25–50% through 5S, kanban pull systems, and poka-yoke mistake-proofing. Every percentage point of waste eliminated converts directly into recovered capacity and bottom-line savings.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lean-waste-percentage-calculator" />
          <PopularCalculators exclude="/calculator/lean-waste-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
