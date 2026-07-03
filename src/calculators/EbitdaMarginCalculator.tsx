"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface EBITDAResults {
  ebitda: number;
  ebitdaMargin: number;
  ebitMargin: number;
  grossMargin: number;
  netMargin: number;
  daAmount: number;
  evToEbitda: number;
  breakdown: { name: string; value: number; pct: number }[];
}

const CompactInput = ({
  id, label, value, onChange, prefix, suffix, type = "number", ...props
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtM = (n: number) => {
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
};

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "hsl(var(--primary))"];

function calcEBITDA({ revenue, cogs, opex, da, interestExpense, taxes, ev }: {
  revenue: number; cogs: number; opex: number; da: number;
  interestExpense: number; taxes: number; ev: number;
}): EBITDAResults {
  const grossProfit = revenue - cogs;
  const ebit = grossProfit - opex;
  const ebitda = ebit + da;
  const ebt = ebit - interestExpense;
  const netIncome = ebt - taxes;

  const ebitdaMargin = revenue > 0 ? (ebitda / revenue) * 100 : 0;
  const ebitMargin = revenue > 0 ? (ebit / revenue) * 100 : 0;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;
  const evToEbitda = ebitda > 0 && ev > 0 ? ev / ebitda : 0;
  const daAmount = da;

  const breakdown = [
    { name: "Revenue", value: revenue, pct: 100 },
    { name: "Gross Profit", value: grossProfit, pct: grossMargin },
    { name: "EBIT", value: ebit, pct: ebitMargin },
    { name: "EBITDA", value: ebitda, pct: ebitdaMargin },
    { name: "Net Income", value: netIncome, pct: netMargin },
  ];

  return { ebitda, ebitdaMargin, ebitMargin, grossMargin, netMargin, daAmount, evToEbitda, breakdown };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.fill || "hsl(var(--primary))" }} className="font-semibold">{p.name}: {fmtM(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function EbitdaMarginCalculator() {
  const [revenue, setRevenue] = useState("10000000");
  const [cogs, setCogs] = useState("4000000");
  const [opex, setOpex] = useState("2500000");
  const [da, setDa] = useState("800000");
  const [interestExpense, setInterestExpense] = useState("300000");
  const [taxes, setTaxes] = useState("600000");
  const [ev, setEv] = useState("35000000");

  const [results, setResults] = useState<EBITDAResults | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calculate(); }, []);

  const calculate = () => {
    setResults(calcEBITDA({
      revenue: parseFloat(revenue) || 0, cogs: parseFloat(cogs) || 0,
      opex: parseFloat(opex) || 0, da: parseFloat(da) || 0,
      interestExpense: parseFloat(interestExpense) || 0, taxes: parseFloat(taxes) || 0,
      ev: parseFloat(ev) || 0,
    }));
  };

  const reset = () => {
    setRevenue("10000000"); setCogs("4000000"); setOpex("2500000");
    setDa("800000"); setInterestExpense("300000"); setTaxes("600000"); setEv("35000000");
    calculate();
  };

  const faqs = [
    { question: "What is EBITDA Margin?", answer: "EBITDA Margin is EBITDA (Earnings Before Interest, Taxes, Depreciation & Amortization) divided by total revenue, expressed as a percentage. It measures how much operating cash profit a company generates per dollar of revenue, stripping out capital structure, tax, and accounting decisions. Formula: EBITDA Margin = EBITDA / Revenue × 100." },
    { question: "What is a good EBITDA margin?", answer: "It varies significantly by industry. Software/SaaS companies often have 20–40% EBITDA margins. Retailers typically see 3–7%. Healthcare 15–25%. Manufacturing 8–15%. Financial services 30–50%. Compare margins within the same industry for meaningful analysis." },
    { question: "What are the limitations of EBITDA?", answer: "EBITDA has been criticized by Warren Buffett and Charlie Munger as misleading because it ignores capital expenditures (capex), which are real ongoing costs. A capital-intensive business with high depreciation will look better on EBITDA than on free cash flow. Always consider EBITDA alongside capex and free cash flow." },
    { question: "How is EBITDA different from operating income (EBIT)?", answer: "EBIT (Earnings Before Interest and Taxes) = Revenue − COGS − Operating Expenses. EBITDA adds back Depreciation and Amortization to EBIT. The difference between the two is the D&A amount. Companies with heavy capital assets (like utilities or manufacturers) will see a larger gap between EBIT and EBITDA." },
    { question: "What is the EV/EBITDA multiple?", answer: "EV/EBITDA is one of the most important valuation multiples in finance. It compares a company's enterprise value to its EBITDA, providing a capital-structure-neutral P/E equivalent. A company with $35M EV and $3.3M EBITDA trades at 10.6x EV/EBITDA. Lower multiples can indicate undervaluation." },
    { question: "Can EBITDA be negative?", answer: "Yes. A company with negative EBITDA is losing money at the operating level before any financing or tax considerations. Startups and early-stage companies often have negative EBITDA. If EBITDA is negative, the EV/EBITDA multiple is meaningless, and analysts typically use EV/Revenue instead." },
  ];

  return (
    <>
      <Breadcrumb items={[
        { label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" },
        { label: "Financial", href: "/calculator#financial" }, { label: "EBITDA Margin Calculator" }
      ]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">EBITDA Margin Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Income Statement</h2>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="revenue" label="Revenue" value={revenue} onChange={setRevenue} prefix="$" />
              <CompactInput id="cogs" label="Cost of Goods Sold (COGS)" value={cogs} onChange={setCogs} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="opex" label="Operating Expenses (excl. D&A)" value={opex} onChange={setOpex} prefix="$" />
              <CompactInput id="da" label="Depreciation & Amortization" value={da} onChange={setDa} prefix="$" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="interest" label="Interest Expense" value={interestExpense} onChange={setInterestExpense} prefix="$" />
              <CompactInput id="taxes" label="Income Taxes" value={taxes} onChange={setTaxes} prefix="$" />
            </div>
            <CompactInput id="ev" label="Enterprise Value (for EV/EBITDA)" value={ev} onChange={setEv} prefix="$" />

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset}
                className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 transition-colors flex items-center justify-center"
                aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Profitability Analysis</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>

                {/* Component 1: Primary Result */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">EBITDA Margin</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                    {fmt(results.ebitdaMargin)}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    EBITDA: {fmtM(results.ebitda)} · EV/EBITDA: {results.evToEbitda > 0 ? `${fmt(results.evToEbitda)}x` : "N/A"}
                  </div>
                </div>

                {/* Component 2: Breakdown Table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Metric</th>
                        <th className="p-2.5 pr-3 text-right">Amount</th>
                        <th className="p-2.5 pr-3 text-right">Margin %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {results.breakdown.map((row, i) => (
                        <tr key={row.name} className={`hover:bg-secondary/20 ${row.name === "EBITDA" ? "font-bold bg-secondary/30 text-foreground" : "text-muted-foreground"}`}>
                          <td className="p-2.5 pl-3 font-semibold text-foreground">
                            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[i] }} />
                            {row.name}
                          </td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{fmtM(row.value)}</td>
                          <td className="p-2.5 pr-3 text-right text-foreground">{fmt(row.pct)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Component 3: Chart */}
                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Profitability Waterfall (Margin %)</h3>
                  {mounted && (<>

                    <ResponsiveContainer width="100%" height={195}>
                      <BarChart data={results.breakdown.slice(1)} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                        <Tooltip formatter={(v: any) => `${fmt(v)}%`} labelFormatter={l => l} />
                        <Bar dataKey="pct" radius={[4, 4, 0, 0]} name="Margin %">
                          {results.breakdown.slice(1).map((_, i) => (
                            <Cell key={i} fill={COLORS[i + 1]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  
</>)}
                </div>

                {/* Component 4: Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border bg-card">
                  {[
                    { label: "EBITDA", value: fmtM(results.ebitda) },
                    { label: "EBITDA Margin", value: `${fmt(results.ebitdaMargin)}%` },
                    { label: "Gross Margin", value: `${fmt(results.grossMargin)}%` },
                    { label: "EBIT Margin", value: `${fmt(results.ebitMargin)}%` },
                    { label: "Net Margin", value: `${fmt(results.netMargin)}%` },
                    { label: "EV/EBITDA", value: results.evToEbitda > 0 ? `${fmt(results.evToEbitda)}x` : "N/A" },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is EBITDA Margin?</h2>
            <p>EBITDA Margin is one of the most widely used profitability metrics in corporate finance. It measures how much of a company's revenue becomes EBITDA — Earnings Before Interest, Taxes, Depreciation, and Amortization. The formula is: EBITDA Margin = EBITDA / Revenue × 100. This metric allows investors and analysts to compare operational profitability across companies with different capital structures, tax situations, and asset base sizes.</p>
            <p>EBITDA itself is derived by adding back non-cash charges (depreciation and amortization) and non-operating items (interest and taxes) to net income. This produces a measure that closely approximates operating cash flow, which is why private equity firms, investment bankers, and fundamental analysts use it as a primary valuation anchor.</p>

            <h2>How to Calculate EBITDA</h2>
            <p>Starting from the income statement: Revenue − COGS = Gross Profit. Gross Profit − Operating Expenses = EBIT (Earnings Before Interest & Taxes). EBIT + Depreciation + Amortization = EBITDA. Alternatively, start from Net Income: EBITDA = Net Income + Interest Expense + Taxes + Depreciation + Amortization.</p>
            <p>This calculator derives all profitability metrics simultaneously from a single income statement, giving you EBITDA, EBITDA margin, EBIT margin, gross margin, and net margin in one view — along with the EV/EBITDA multiple if you enter the enterprise value.</p>

            <h2>Industry Benchmarks</h2>
            <p>EBITDA margins vary enormously by industry. Software companies (especially SaaS) typically achieve 20–40% EBITDA margins due to low cost of goods sold and scalable business models. Healthcare providers see 15–25%. Industrial manufacturers typically range from 8–15%. Retailers and food service companies often achieve only 3–7% due to thin margins and high cost of goods sold. Telecommunications companies can reach 30–40% due to high infrastructure amortization that boosts EBITDA relative to EBIT.</p>

            <h2>Limitations of EBITDA Margin</h2>
            <p>EBITDA has notable limitations. It ignores capital expenditures — which are real cash costs for maintaining and growing the business. High-capex businesses (airlines, railroads, oil refineries) look more attractive on EBITDA than on free cash flow. Warren Buffett has famously criticized EBITDA as a misleading metric because "does management think the tooth fairy pays for capital expenditures?" Always supplement EBITDA analysis with free cash flow margin for a complete picture.</p>

            <h2>EBITDA in M&A and Private Equity</h2>
            <p>In mergers and acquisitions, EBITDA is the universal valuation language. Leverage buyout (LBO) models are built around EBITDA multiples. When a private equity firm says they're buying a company at "8x," they mean 8x trailing 12-month EBITDA. This is why improving EBITDA margin is a primary value-creation strategy in PE-backed companies — every dollar of EBITDA improvement creates 8–12x that in enterprise value at exit.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ebitda-margin-calculator" />
          <PopularCalculators exclude="/calculator/ebitda-margin-calculator" />
        </div>
      </div>
    </>
  );
}
