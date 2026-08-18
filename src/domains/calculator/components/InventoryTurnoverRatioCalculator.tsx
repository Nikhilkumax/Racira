"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface InventoryResult {
  cogS: number;
  beginInv: number;
  endInv: number;
  avgInv: number;
  turnover: number;
  dsi: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt$(v: number): string {
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcInventory(cogS: number, beginInv: number, endInv: number): InventoryResult {
  const avgInv = (beginInv + endInv) / 2;
  const turnover = avgInv > 0 ? cogS / avgInv : 0;
  const dsi = turnover > 0 ? 365 / turnover : 0;
  const breakdown = [
    { label: "Cost of Goods Sold (COGS)", value: fmt$(cogS) },
    { label: "Beginning Inventory", value: fmt$(beginInv) },
    { label: "Ending Inventory", value: fmt$(endInv) },
    { label: "Average Inventory", value: fmt$(avgInv) },
    { label: "Inventory Turnover Ratio", value: `${fmt(turnover)}× / year` },
    { label: "Days Sales of Inventory (DSI)", value: `${fmt(dsi, 1)} days` },
  ];
  const summaryStats = [
    { label: "Inventory Turnover", value: `${fmt(turnover)}×` },
    { label: "Days to Sell Inventory", value: `${fmt(dsi, 1)} days` },
    { label: "Average Inventory", value: fmt$(avgInv) },
    { label: "COGS", value: fmt$(cogS) },
    { label: "Beginning Inventory", value: fmt$(beginInv) },
    { label: "Ending Inventory", value: fmt$(endInv) },
  ];
  const chartData = [
    { name: "Beginning Inventory", value: Math.max(0, Math.round(beginInv)), fill: "hsl(var(--primary))" },
    { name: "Ending Inventory", value: Math.max(0, Math.round(endInv)), fill: "#f59e0b" },
  ];
  return { cogS, beginInv, endInv, avgInv, turnover, dsi, breakdown, summaryStats, chartData };
}

const DEFAULTS = { cogS: "500000", begin: "85000", end: "65000" };

export default function InventoryTurnoverRatioCalculator() {
  const [cogS, setCogS] = useState(DEFAULTS.cogS);
  const [begin, setBegin] = useState(DEFAULTS.begin);
  const [end, setEnd] = useState(DEFAULTS.end);
  const [result, setResult] = useState<InventoryResult | null>(null);

  const cog = parseFloat(cogS) || 0;
  const b = parseFloat(begin) || 0;
  const e = parseFloat(end) || 0;
  const errs: string[] = [];
  if (cog <= 0) errs.push("Cost of goods sold must be greater than 0.");
  if (b < 0 || e < 0) errs.push("Inventory balances cannot be negative.");
  if (b + e === 0) errs.push("Average inventory must be greater than 0.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcInventory(cog, b, e)); };
  const reset = () => {
    setCogS(DEFAULTS.cogS); setBegin(DEFAULTS.begin); setEnd(DEFAULTS.end);
    setResult(calcInventory(500000, 85000, 65000));
  };
  useEffect(() => { setResult(calcInventory(500000, 85000, 65000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What does the inventory turnover ratio measure?", answer: "It shows how many times a business sells and replaces its average inventory over a year — COGS divided by average inventory. Higher turnover means inventory moves faster and less cash is tied up on shelves." },
    { question: "How do I interpret days sales of inventory (DSI)?", answer: "DSI is 365 divided by the turnover ratio. It estimates how many days, on average, an item sits in inventory before it sells. Lower DSI is generally better, though the ideal level depends on the industry." },
    { question: "What is a good turnover ratio?", answer: "It varies widely by industry: grocery stores can exceed 10×, while luxury goods and heavy equipment often run below 2×. Compare against your own industry benchmark rather than a universal number." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Inventory Turnover Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Inventory Turnover Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Cost of Goods Sold (Annual)</label>
                <div className={inp}><input type="number" value={cogS} onChange={e => setCogS(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Beginning Inventory</label>
                <div className={inp}><input type="number" value={begin} onChange={e => setBegin(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Ending Inventory</label>
                <div className={inp}><input type="number" value={end} onChange={e => setEnd(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Inventory Turnover Ratio</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.turnover)}×</div>
                <div className="text-sm text-muted-foreground mt-1">per year on {fmt$(result.avgInv)} average inventory</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Turnover Ratio`, `${fmt(result.turnover)}×`], ["Days to Sell (DSI)", `${fmt(result.dsi, 1)} days`], ["Average Inventory", fmt$(result.avgInv)]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 4 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 4 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Inventory Levels</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmt$(v), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Beginning vs ending inventory for the period</p>
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
            <h2 className="text-2xl font-bold mb-3">The Inventory Turnover Formula</h2>
            <p>This <strong>inventory turnover ratio calculator</strong> divides annual cost of goods sold by average inventory — the midpoint of beginning and ending balances. The result, expressed as a multiple, tells you how many times the business cycles through its stock in a year.</p>
            <h2 className="text-2xl font-bold mb-3">Days Sales of Inventory</h2>
            <p>Dividing 365 by the turnover ratio gives DSI — the average number of days inventory sits before being sold. Pairing the two metrics shows both the velocity of sales and the cash conversion timeline.</p>
            <h2 className="text-2xl font-bold mb-3">What a Healthy Ratio Looks Like</h2>
            <p>High turnover signals efficient selling and lean inventory; extremely high values may mean stockouts and lost sales. Low turnover suggests overstocking or weak demand. Always benchmark against your industry and your own historical trend.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/inventory-turnover-ratio-calculator" />
          <PopularCalculators exclude="/calculator/inventory-turnover-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
