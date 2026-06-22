"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmtVal = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const fmtRatio = (n: number) => `${n.toFixed(2)}x`;

const INDUSTRY_TURNOVER = [
  { sector: "Grocery / Supermarket", median: 14.5 },
  { sector: "Automotive Retail", median: 3.2 },
  { sector: "Clothing & Apparel", median: 4.8 },
  { sector: "Consumer Electronics", median: 6.2 },
  { sector: "Wholesale Distribution", median: 8.5 },
  { sector: "Manufacturing", median: 5.0 },
];

export default function InventoryTurnoverCalculator() {
  const [cogs, setCogs] = useState("500000");
  const [beginInv, setBeginInv] = useState("45000");
  const [endInv, setEndInv] = useState("55000");
  const [periodDays, setPeriodDays] = useState("365");
  const [sector, setSector] = useState("Clothing & Apparel");

  const [res, setRes] = useState<{
    avgInv: number;
    turnover: number;
    dio: number;
    ratingLabel: string;
    benchmark: number;
  } | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const c = parseFloat(cogs) || 0;
    const bi = parseFloat(beginInv) || 0;
    const ei = parseFloat(endInv) || 0;
    const days = parseFloat(periodDays) || 365;

    const avgInv = (bi + ei) / 2;
    const turnover = avgInv > 0 ? c / avgInv : 0;
    const dio = turnover > 0 ? days / turnover : 0;

    const bench = INDUSTRY_TURNOVER.find(s => s.sector === sector)?.median || 5;
    let ratingLabel = "Average";
    if (turnover >= bench * 1.3) {
      ratingLabel = "Excellent / Highly Efficient";
    } else if (turnover >= bench * 0.9) {
      ratingLabel = "Good (Industry Standard)";
    } else if (turnover >= bench * 0.6) {
      ratingLabel = "Sub-Optimal / Slow-moving";
    } else {
      ratingLabel = "Caution (Risk of Obsolescence)";
    }

    setRes({ avgInv, turnover, dio, ratingLabel, benchmark: bench });
  };

  const reset = () => {
    setCogs("500000");
    setBeginInv("45000");
    setEndInv("55000");
    setPeriodDays("365");
    setSector("Clothing & Apparel");
  };

  const ratingColor = (r: string) => {
    if (r.startsWith("Excellent")) return "text-emerald-600";
    if (r.startsWith("Good")) return "text-primary";
    if (r.startsWith("Sub-Optimal")) return "text-amber-600";
    return "text-red-600";
  };

  const faqs = [
    { question: "What is Inventory Turnover?", answer: "Inventory Turnover is an efficiency ratio that measures how many times a company sells and replaces its inventory over a specific period. It is calculated by dividing Cost of Goods Sold (COGS) by Average Inventory." },
    { question: "What is Days Inventory Outstanding (DIO)?", answer: "Days Inventory Outstanding (DIO), also known as Days Sales of Inventory (DSI), measures the average number of days it takes for a company to convert its inventory into sales. The formula is: DIO = Period Days (typically 365) ÷ Inventory Turnover. A lower DIO is generally preferred." },
    { question: "What is a good inventory turnover ratio?", answer: "A healthy inventory turnover ratio varies greatly by sector. Grocery stores have very high turnover (12x to 15x+ per year) because products are perishable. High-value luxury retailers or car dealerships have much lower turnover (2x to 4x per year). The ratio should be compared against historical company figures and industry averages." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Inventory Turnover Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Inventory Turnover Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Inventory details</h2>
            <CompactInput id="cogs" label="Cost of Goods Sold (COGS)" value={cogs} onChange={setCogs} prefix="$" />
            <CompactInput id="bi" label="Beginning Inventory" value={beginInv} onChange={setBeginInv} prefix="$" />
            <CompactInput id="ei" label="Ending Inventory" value={endInv} onChange={setEndInv} prefix="$" />
            <CompactInput id="pd" label="Period Duration" value={periodDays} onChange={setPeriodDays} suffix="Days" />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Industry Sector</label>
              <select value={sector} onChange={e => setSector(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                {INDUSTRY_TURNOVER.map(s => <option key={s.sector} value={s.sector}>{s.sector} (Median: {s.median}x)</option>)}
              </select>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate Turnover
              </button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold text-foreground">Inventory Performance</h2>
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                    <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Inventory Turnover Ratio</div>
                    <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtRatio(res.turnover)}</div>
                    <div className={`text-sm font-bold ${ratingColor(res.ratingLabel)}`}>{res.ratingLabel}</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 text-center">
                    <div className="text-[13px] font-bold text-emerald-600 mb-1 uppercase tracking-wider">Days Inventory Outstanding (DIO)</div>
                    <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{res.dio.toFixed(1)} Days</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Cost of Goods Sold (COGS)", value: fmtVal(parseFloat(cogs) || 0) },
                        { label: "Average Inventory Balance", value: fmtVal(res.avgInv) },
                        { label: "Inventory Turnover Ratio", value: fmtRatio(res.turnover), bold: true },
                        { label: "Days Inventory Outstanding", value: `${res.dio.toFixed(1)} Days`, bold: true },
                        { label: "Sector Median Benchmark", value: fmtRatio(res.benchmark) },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Turnover Ratio vs Sector Medians</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={INDUSTRY_TURNOVER.map(s => ({ name: s.sector, median: s.median }))} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}x`} />
                        <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}x`, "Median Turnover"]} />
                        <ReferenceLine y={res.turnover} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Your Ratio: ${res.turnover.toFixed(1)}x`, position: "right", fontSize: 10, fill: "#f59e0b" }} />
                        <Bar dataKey="median" fill="hsl(var(--primary) / 0.5)" name="Industry Median" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Inventory Turnover</h2>
            <p>Inventory turnover is a fundamental efficiency ratio that measures how many times a business sells and replaces its physical inventory over a given period (usually a year). It acts as an indicator of product demand and warehouse supply-chain efficiency. A high turnover ratio suggests strong customer demand and optimal inventory levels, while a low ratio warns of excess stock, slow-moving items, or obsolescence.</p>
            
            <h2>Why Inventory Turnover Differs by Sector</h2>
            <p>Because businesses operate on different business models, turnover benchmarks vary dramatically. Grocery stores operate on narrow margins with highly perishable stock, meaning they must turn over inventory 15 to 20 times a year to remain profitable. Conversely, an auto retailer or high-end watch store sells fewer products at much higher gross margins, yielding a low turnover ratio (2x to 4x) but generating high dollars of gross profit per transaction.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/inventory-turnover-calculator" />
          <PopularCalculators exclude="/calculator/inventory-turnover-calculator" />
        </div>
      </div>
    </>
  );
}
