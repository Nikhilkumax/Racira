"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type DepMethod = "straight" | "ddb" | "db150";

interface DepResult {
  method: DepMethod;
  annualDep: number;
  totalDep: number;
  bookValue: number;
  yearRows: { year: number; beginning: number; depreciation: number; ending: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { year: number; bookValue: number }[];
}

const METHOD_LABELS: Record<DepMethod, string> = { straight: "Straight-Line", ddb: "Double-Declining (200%)", db150: "Declining Balance (150%)" };

function calcDep(cost: number, salvage: number, life: number, method: DepMethod): DepResult {
  const yearRows: DepResult["yearRows"] = [];
  let book = cost;
  let totalDep = 0;
  const straightRate = (cost - salvage) / life;
  const dbRate = method === "ddb" ? 2 / life : 1.5 / life;
  for (let y = 1; y <= life; y++) {
    const beginning = book;
    let dep: number;
    if (method === "straight") dep = straightRate;
    else {
      dep = book * dbRate;
      // In the final year, depreciate down to salvage value
      if (y === life) dep = Math.max(0, book - salvage);
      else if (book - dep < salvage) dep = Math.max(0, book - salvage);
    }
    book = Math.max(salvage, book - dep);
    totalDep += dep;
    yearRows.push({ year: y, beginning, depreciation: dep, ending: book });
  }
  const annualDep = method === "straight" ? straightRate : yearRows[0].depreciation;

  const fmt = (v: number) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  const breakdown = [
    { label: "Asset Cost", value: fmt(cost) },
    { label: "Salvage Value", value: fmt(salvage) },
    { label: "Useful Life", value: `${life} years` },
    { label: "Method", value: METHOD_LABELS[method] },
    { label: "First-Year Depreciation", value: fmt(annualDep) },
    { label: "Total Depreciation", value: fmt(totalDep) },
    { label: "End Book Value", value: fmt(book) },
  ];
  const summaryStats = [
    { label: "First-Year Dep", value: fmt(annualDep) },
    { label: "Total Depreciation", value: fmt(totalDep) },
    { label: "End Book Value", value: fmt(book) },
    { label: "Annual (SL eq.)", value: fmt(straightRate) },
    { label: "Method", value: METHOD_LABELS[method] },
    { label: "Cost", value: fmt(cost) },
    { label: "Salvage", value: fmt(salvage) },
    { label: "Life", value: `${life} years` },
  ];
  const chartData = yearRows.map(r => ({ year: r.year, bookValue: Math.round(r.ending) }));
  return { method, annualDep, totalDep, bookValue: book, yearRows, breakdown, summaryStats, chartData };
}

const DEFAULTS = { cost: "10000", salvage: "1000", life: "5", method: "straight" as DepMethod };

export default function DepreciationCalculator() {
  const [cost, setCost] = useState(DEFAULTS.cost);
  const [salvage, setSalvage] = useState(DEFAULTS.salvage);
  const [life, setLife] = useState(DEFAULTS.life);
  const [method, setMethod] = useState<DepMethod>("straight");
  const [result, setResult] = useState<DepResult | null>(null);

  const c = parseFloat(cost) || 0;
  const s = parseFloat(salvage) || 0;
  const l = parseInt(life) || 0;
  const errs: string[] = [];
  if (c <= 0) errs.push("Asset cost must be greater than 0.");
  if (s < 0) errs.push("Salvage value cannot be negative.");
  if (s >= c) errs.push("Salvage value must be less than asset cost.");
  if (l < 1 || l > 50) errs.push("Useful life must be 1–50 years.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcDep(c, s, l, method)); };
  const reset = () => {
    setCost(DEFAULTS.cost); setSalvage(DEFAULTS.salvage); setLife(DEFAULTS.life); setMethod("straight");
    setResult(calcDep(10000, 1000, 5, "straight"));
  };
  useEffect(() => { setResult(calcDep(10000, 1000, 5, "straight")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is depreciation?", answer: "Depreciation spreads an asset's cost over its useful life, matching the expense to the years it generates value. Straight-line takes an equal amount each year: (Cost − Salvage) ÷ Life. Declining-balance methods accelerate the expense into early years." },
    { question: "What is double-declining balance?", answer: "DDB applies twice the straight-line rate (2 ÷ life) to the remaining book value each year, so depreciation is largest in year one and shrinks over time. It is popular for assets that lose value fastest early — vehicles, electronics, and equipment." },
    { question: "What is salvage value?", answer: "Salvage (residual) value is what the asset will be worth at the end of its useful life. Depreciation stops at salvage — you never write an asset below what you could sell it for. The IRS uses zero salvage value for MACRS tax depreciation." },
    { question: "Straight-line or accelerated — which should I use?", answer: "For financial statements, match the pattern of economic benefit — vehicles and tech lose value fast, favoring accelerated methods. For taxes, follow the required system (e.g., MACRS in the US). Accounting for tax deductions is a separate calculation from book depreciation." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Depreciation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Depreciation Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Asset Cost</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={cost} onChange={e => setCost(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Salvage Value</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={salvage} onChange={e => setSalvage(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Useful Life</label>
                <div className={inp}><input type="number" value={life} onChange={e => setLife(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
              </div>
              <div>
                <label className={lbl}>Method</label>
                <select value={method} onChange={e => setMethod(e.target.value as DepMethod)} className={sel}>
                  <option value="straight">Straight-Line</option>
                  <option value="ddb">Double-Declining (200%)</option>
                  <option value="db150">Declining Balance (150%)</option>
                </select>
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">First-Year Depreciation</div>
                <div className="text-4xl font-extrabold tracking-tight">${result.annualDep.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1">{METHOD_LABELS[result.method]} · total ${result.totalDep.toLocaleString("en-US", { maximumFractionDigits: 2 })} over {life} years</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Annual (SL)", `$${(parseFloat(cost) - parseFloat(salvage)) / parseInt(life || "1") !== Infinity ? ((parseFloat(cost) - parseFloat(salvage)) / parseInt(life || "1")).toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—"}`], ["Total Dep", `$${result.totalDep.toLocaleString("en-US", { maximumFractionDigits: 2 })}`], ["End Value", `$${result.bookValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Yearly Schedule</h3>
                <table className="w-full text-base"><tbody>
                  {result.yearRows.map((r, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2.5 text-muted-foreground">Year {r.year}</td>
                      <td className="py-2.5 text-right text-muted-foreground">${r.beginning.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                      <td className="py-2.5 text-right font-semibold text-emerald-600">−${r.depreciation.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                      <td className="py-2.5 text-right font-bold">${r.ending.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                  <tr className="bg-amber-500/10 border-t-2 border-amber-500/40">
                    <td className="py-2.5 text-amber-700 font-bold" colSpan={3}>Total Depreciation</td>
                    <td className="py-2.5 text-right text-amber-700 font-bold">${result.totalDep.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Book Value Over Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v / 1000}K`} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Book Value"]} />
                    <Area type="monotone" dataKey="bookValue" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
                  </AreaChart>
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
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Depreciation Methods</h2>
            <p>This <strong>depreciation calculator</strong> supports straight-line, double-declining balance, and 150% declining balance. Straight-line: (Cost − Salvage) ÷ Life. Declining balance: Book Value × (rate ÷ Life), never falling below salvage — accelerated write-offs that match how assets actually lose value.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing a Method</h2>
            <p>Straight-line suits buildings and stable assets. DDB suits vehicles, electronics, and machinery with heavy early-year value loss. The 150% method is a gentler accelerated option. On financial statements, match the method to the asset's benefit pattern; for tax, follow the mandated system in your jurisdiction.</p>
            <h2 className="text-2xl font-bold mb-3">Depreciation and Cash Flow</h2>
            <p>Depreciation is a non-cash expense — it reduces taxable income without spending cash. It is added back when computing operating cash flow and EBITDA. Higher depreciation in early years defers tax, improving short-term cash flow at the cost of higher taxable income later.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/depreciation-calculator" />
          <PopularCalculators exclude="/calculator/depreciation-calculator" />
        </div>
      </div>
    </>
  );
}
