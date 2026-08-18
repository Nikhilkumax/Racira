"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface RoceInput {
  ebit: number;
  totalAssets: number;
  currentLiabilities: number;
  wacc: number;
}

interface RoceResult {
  roce: number;
  capitalEmployed: number;
  status: string;
  statusColor: string;
  spreadVsWacc: number;
  chartData: { name: string; roce: number; highlight: boolean }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const BENCHMARKS = [
  { name: "You", roce: 0, highlight: true },
  { name: "Technology", roce: 28, highlight: false },
  { name: "Healthcare", roce: 18, highlight: false },
  { name: "Retail", roce: 15, highlight: false },
  { name: "Manufacturing", roce: 12, highlight: false },
  { name: "Utilities", roce: 8, highlight: false },
];

function calcRoce(input: RoceInput): RoceResult {
  const capitalEmployed = Math.max(0, input.totalAssets - input.currentLiabilities);
  const roce = capitalEmployed > 0 ? (input.ebit / capitalEmployed) * 100 : 0;
  const status = roce >= 20 ? "Excellent" : roce >= 12 ? "Good" : roce >= 8 ? "Adequate" : "Poor";
  const statusColor = roce >= 15 ? "text-emerald-600" : roce >= 8 ? "text-amber-500" : "text-red-500";
  const spreadVsWacc = roce - input.wacc;
  const chartData = BENCHMARKS.map((b) => ({ ...b, roce: b.highlight ? Number(roce.toFixed(1)) : b.roce }));

  const breakdown = [
    { label: "EBIT", value: `$${input.ebit.toLocaleString()}` },
    { label: "Total Assets", value: `$${input.totalAssets.toLocaleString()}` },
    { label: "Current Liabilities", value: `$${input.currentLiabilities.toLocaleString()}` },
    { label: "Capital Employed", value: `$${capitalEmployed.toLocaleString()}` },
    { label: "ROCE", value: `${roce.toFixed(1)}%` },
    { label: "WACC (Cost of Capital)", value: `${input.wacc.toFixed(1)}%` },
    { label: "Value Spread (ROCE − WACC)", value: `${spreadVsWacc > 0 ? "+" : ""}${spreadVsWacc.toFixed(1)}%` },
    { label: "Performance", value: status },
  ];

  const summaryStats = [
    { label: "ROCE", value: `${roce.toFixed(1)}%` },
    { label: "Capital Employed", value: `$${capitalEmployed.toLocaleString()}` },
    { label: "Status", value: status },
    { label: "EBIT", value: `$${input.ebit.toLocaleString()}` },
    { label: "Spread vs WACC", value: `${spreadVsWacc > 0 ? "+" : ""}${spreadVsWacc.toFixed(1)}%` },
    { label: "Capital Turnover", value: `${(roce / 100).toFixed(3)}×` },
  ];

  return { roce, capitalEmployed, status, statusColor, spreadVsWacc, chartData, breakdown, summaryStats };
}

const DEFAULTS: RoceInput = { ebit: 420000, totalAssets: 3500000, currentLiabilities: 800000, wacc: 9 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function ReturnOnCapitalEmployedCalculator() {
  const [ebit, setEbit] = useState(String(DEFAULTS.ebit));
  const [assets, setAssets] = useState(String(DEFAULTS.totalAssets));
  const [liabilities, setLiabilities] = useState(String(DEFAULTS.currentLiabilities));
  const [wacc, setWacc] = useState(String(DEFAULTS.wacc));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [result, setResult] = useState<RoceResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcRoce({ ebit: parse(ebit, DEFAULTS.ebit), totalAssets: parse(assets, DEFAULTS.totalAssets), currentLiabilities: parse(liabilities, DEFAULTS.currentLiabilities), wacc: parse(wacc, DEFAULTS.wacc) }));
  const reset = () => {
    setEbit(String(DEFAULTS.ebit));
    setAssets(String(DEFAULTS.totalAssets));
    setLiabilities(String(DEFAULTS.currentLiabilities));
    setWacc(String(DEFAULTS.wacc));
    setResult(calcRoce(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcRoce(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is ROCE?", answer: "Return on Capital Employed (ROCE) = EBIT ÷ Capital Employed × 100%, where Capital Employed = Total Assets − Current Liabilities. It measures how efficiently a company generates operating profit from its long-term funding base — equity plus long-term debt." },
    { question: "Why exclude current liabilities?", answer: "Current liabilities (accounts payable, accrued expenses, short-term debt) are operational financing that fluctuates with day-to-day activity. Excluding them focuses the ratio on the permanent capital for which management is accountable — the funds investors and lenders have committed long-term." },
    { question: "What is a good ROCE?", answer: "A strong benchmark: ROCE should exceed the company's weighted average cost of capital (WACC), typically 8–12%. ROCE of 15–20%+ is generally considered strong. Asset-light industries like technology often reach 20–40%, while capital-intensive utilities may run 5–10% and still create value above their cost of capital." },
    { question: "How does ROCE differ from ROA?", answer: "ROA = Net Income ÷ Total Assets and includes financing effects. ROCE uses EBIT (pre-interest, pre-tax) and capital employed, removing the influence of debt structure. ROCE is preferred for comparing firms with different capital structures." },
    { question: "What is the ROCE vs WACC spread?", answer: "The spread (ROCE − WACC) is the ultimate test of value creation. A positive spread means each dollar of capital earns more than it costs to fund — value is created. A negative spread means operations destroy value even when the company reports a profit." },
    { question: "How is ROCE different from ROIC?", answer: "ROCE uses EBIT as the numerator; ROIC uses NOPAT (net operating profit after tax). ROIC is more rigorous but ROCE is simpler and widely used for quick cross-sector comparisons. Both exclude the effect of financial leverage." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Return on Capital Employed Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Return on Capital Employed Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">EBIT (Operating Profit)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={ebit} onChange={(e) => setEbit(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Total Assets</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={assets} onChange={(e) => setAssets(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Current Liabilities</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={liabilities} onChange={(e) => setLiabilities(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">WACC (Cost of Capital)</label>
                <div className={inp}><input type="number" value={wacc} onChange={(e) => setWacc(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Return on Capital Employed</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${result.statusColor}`}>{result.roce.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground mt-1">Capital Employed: ${result.capitalEmployed.toLocaleString()} · Status: {result.status}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["ROCE", `${result.roce.toFixed(1)}%`], ["Capital Employed", `$${result.capitalEmployed.toLocaleString()}`], ["Spread vs WACC", `${result.spreadVsWacc > 0 ? "+" : ""}${result.spreadVsWacc.toFixed(1)}%`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">ROCE Analysis</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">ROCE vs Industry Benchmarks</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, "ROCE"]} />
                      <Bar dataKey="roce" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.highlight ? "hsl(var(--primary))" : "#94a3b8"} />)}
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
            <h2 className="text-2xl font-bold mb-3">What Is Return on Capital Employed?</h2>
            <p>Return on Capital Employed (ROCE) measures how efficiently a business generates operating profit from its long-term funding base. ROCE = EBIT ÷ Capital Employed × 100%, where Capital Employed equals Total Assets minus Current Liabilities — the equity and long-term debt permanently committed to the business.</p>
            <h2 className="text-2xl font-bold mb-3">Why the WACC Comparison Matters</h2>
            <p>The most powerful interpretation of ROCE compares it to the weighted average cost of capital. If ROCE consistently exceeds WACC, every dollar of capital deployed creates shareholder value. If ROCE falls below WACC, the company is economically destroying value even while reporting accounting profits. This spread is the foundation of EVA (economic value added) analysis and a favorite metric of value investors like Warren Buffett.</p>
            <h2 className="text-2xl font-bold mb-3">Benchmarks by Industry</h2>
            <p>Asset-light technology businesses frequently achieve ROCE of 20–40%. Healthcare and retail typically range 15–18%. Manufacturing runs around 12%, while utilities and real estate often settle at 5–10%. Always compare within an industry, and weight consistency over multiple years more heavily than any single year's figure.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/return-on-capital-employed-calculator" />
          <PopularCalculators exclude="/calculator/return-on-capital-employed-calculator" />
        </div>
      </div>
    </>
  );
}
