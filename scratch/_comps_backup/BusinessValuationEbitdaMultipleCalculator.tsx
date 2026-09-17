"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// ── 1. TypeScript interfaces — no 'any' ──────────────────────────────────
interface EbitdaValuationInputs {
  ebitda: number;
  multiple: number;
  netDebt: number;
  cash: number;
}

interface ValuationResult {
  enterpriseValue: number;
  equityValue: number;
  netDebtNet: number;
  chartData: { name: string; value: number; color: string; pct: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summary: { label: string; value: string }[];
}

// ── 2. Pure calculation function — zero React, fully typed ───────────────
function calculateEbitdaValuation(inputs: EbitdaValuationInputs): ValuationResult {
  const { ebitda, multiple, netDebt, cash } = inputs;
  const enterpriseValue = ebitda * multiple;
  const netDebtNet = netDebt - cash;
  const equityValue = Math.max(0, enterpriseValue - netDebtNet);

  const fmt0 = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const ev = enterpriseValue;

  const rawPcts = [ev > 0 ? (equityValue / ev) * 100 : 0, ev > 0 ? (Math.max(0, netDebtNet) / ev) * 100 : 0];
  const rounded = rawPcts.map((p) => Math.round(p * 10) / 10);
  const sum = rounded.reduce((a, b) => a + b, 0);
  if (ev > 0 && sum !== 100) {
    const diff = Math.round((100 - sum) * 10) / 10;
    const maxIdx = rounded[0] >= rounded[1] ? 0 : 1;
    rounded[maxIdx] = Math.round((rounded[maxIdx] + diff) * 10) / 10;
  }

  const chartData = [
    { name: "Equity Value", value: Math.max(0, equityValue), color: "hsl(var(--primary))", pct: rounded[0] },
    { name: "Net Debt", value: Math.max(0, netDebtNet), color: "#f59e0b", pct: rounded[1] },
  ].filter((d) => d.value > 0);

  const breakdown = [
    { label: "EBITDA", value: `$${fmt0(ebitda)}` },
    { label: "Valuation Multiple", value: `${multiple.toFixed(1)}x`, highlight: true },
    { label: "Enterprise Value", value: `$${fmt0(enterpriseValue)}`, highlight: true },
    { label: "Total Debt", value: `$${fmt0(netDebt)}` },
    { label: "Cash", value: `$${fmt0(cash)}` },
    { label: "Net Debt (Debt − Cash)", value: `$${fmt0(netDebtNet)}` },
    { label: "Equity Value", value: `$${fmt0(equityValue)}`, isTotal: true },
  ];

  const summary = [
    { label: "EBITDA", value: `$${fmt0(ebitda)}` },
    { label: "Multiple", value: `${multiple.toFixed(1)}x` },
    { label: "Enterprise Value", value: `$${fmt0(enterpriseValue)}` },
    { label: "Total Debt", value: `$${fmt0(netDebt)}` },
    { label: "Cash", value: `$${fmt0(cash)}` },
    { label: "Net Debt", value: `$${fmt0(netDebtNet)}` },
    { label: "Equity Value", value: `$${fmt0(equityValue)}` },
  ];

  return { enterpriseValue, equityValue, netDebtNet, chartData, breakdown, summary };
}

// ── 3. DEFAULTS object — realistic values ────────────────────────────────
const DEFAULTS: EbitdaValuationInputs = { ebitda: 500000, multiple: 6, netDebt: 200000, cash: 50000 };

// ── Shared UI helpers (typed, no 'any') ──────────────────────────────────
interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  min?: string;
  error?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, min, error }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${error ? "border-red-500" : "border-input"}`}>
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input
        id={id}
        type="number"
        min={min}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
    {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}
  </div>
);

interface ChartTooltipProps {
  active?: boolean;
  payload?: { name?: string | number; value?: number | string }[];
}

const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  return (
    <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
      <p className="font-bold text-muted-foreground mb-0.5">{String(p.name)}</p>
      <p className="text-primary font-extrabold text-sm">{typeof p.value === "number" ? `$${p.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : String(p.value)}</p>
    </div>
  );
};

// ── 4. Component ─────────────────────────────────────────────────────────
export default function BusinessValuationEbitdaMultipleCalculator() {
  const [ebitda, setEbitda] = useState(String(DEFAULTS.ebitda));
  const [multiple, setMultiple] = useState(String(DEFAULTS.multiple));
  const [netDebt, setNetDebt] = useState(String(DEFAULTS.netDebt));
  const [cash, setCash] = useState(String(DEFAULTS.cash));
  const [results, setResults] = useState<ValuationResult>(() => calculateEbitdaValuation(DEFAULTS));

  const getInputs = (): EbitdaValuationInputs => ({
    ebitda: parseFloat(ebitda) || 0,
    multiple: parseFloat(multiple) || 0,
    netDebt: parseFloat(netDebt) || 0,
    cash: parseFloat(cash) || 0,
  });

  useEffect(() => {
    setResults(calculateEbitdaValuation(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valErrors: Record<string, string> = {};
  if ((parseFloat(ebitda) || 0) <= 0) valErrors.ebitda = "EBITDA must be greater than 0";
  if ((parseFloat(multiple) || 0) <= 0 || (parseFloat(multiple) || 0) > 50) valErrors.multiple = "Multiple must be 0–50x";
  if ((parseFloat(netDebt) || 0) < 0) valErrors.netDebt = "Debt must be ≥ 0";
  if ((parseFloat(cash) || 0) < 0) valErrors.cash = "Cash must be ≥ 0";
  const hasErrors = Object.keys(valErrors).length > 0;

  const calc = () => {
    if (hasErrors) return;
    setResults(calculateEbitdaValuation(getInputs()));
  };

  const reset = () => {
    setEbitda(String(DEFAULTS.ebitda));
    setMultiple(String(DEFAULTS.multiple));
    setNetDebt(String(DEFAULTS.netDebt));
    setCash(String(DEFAULTS.cash));
    setResults(calculateEbitdaValuation(DEFAULTS));
  };

  const handlePrint = () => window.print();

  const faqs = [
    {
      question: "What is an EBITDA multiple valuation?",
      answer: "It values a business by multiplying its EBITDA (earnings before interest, taxes, depreciation, and amortization) by a market-derived multiple. The result is the enterprise value — the value of the whole business, debt included. Subtract net debt to arrive at the equity value, which is what an owner actually receives from a sale.",
    },
    {
      question: "What is a typical EBITDA multiple for a small business?",
      answer: "Private small-to-mid-sized businesses commonly trade at 3–6x EBITDA, while larger or faster-growing companies in hot sectors can command 8–15x or more. The right multiple depends on industry, growth, customer concentration, margins, and recent comparable transactions — this calculator lets you test a range of multiples to bracket a fair value.",
    },
    {
      question: "Why subtract net debt from enterprise value?",
      answer: "A buyer takes over the company's debt along with its operations, so the cash they pay the seller is reduced by the debt assumed. Net debt is total debt minus cash on hand. If the business has $500,000 of EBITDA, trades at 6x, and carries $150,000 of net debt, the equity value is $2,850,000, not $3,000,000.",
    },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator/business" }, { label: "Business Valuation (EBITDA Multiple) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Business Valuation (EBITDA Multiple) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="ebitda" label="EBITDA" value={ebitda} onChange={setEbitda} prefix="$" error={valErrors.ebitda} />
              <CompactInput id="multiple" label="Valuation Multiple" value={multiple} onChange={setMultiple} suffix="x" min="0.5" error={valErrors.multiple} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="net-debt" label="Total Debt" value={netDebt} onChange={setNetDebt} prefix="$" min="0" error={valErrors.netDebt} />
              <CompactInput id="cash" label="Cash on Hand" value={cash} onChange={setCash} prefix="$" min="0" error={valErrors.cash} />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calc}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"}`}
              >Calculate</button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {hasErrors && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                ⚠️ Please fix the errors above before calculating.
              </div>
            )}
          </div>

          {/* RIGHT — RESULTS */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Equity Value</div>
              <div className="text-4xl font-bold text-primary tracking-tight">${results.equityValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                Enterprise value ${results.enterpriseValue.toLocaleString("en-US", { maximumFractionDigits: 0 })} less net debt ${results.netDebtNet.toLocaleString("en-US", { maximumFractionDigits: 0 })}.
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Enterprise Value</span>
                <span className="font-extrabold text-foreground">${results.enterpriseValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Multiple Applied</span>
                <span className="font-extrabold text-foreground">{(parseFloat(multiple) || 0).toFixed(1)}x</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Debt</span>
                <span className={`font-extrabold ${results.netDebtNet > 0 ? "text-red-600" : "text-emerald-600"}`}>${results.netDebtNet.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-right w-[180px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.breakdown.map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${row.isTotal ? "font-bold bg-secondary/30 border-t-2 border-border" : row.highlight ? "bg-amber-500/10" : "hover:bg-secondary/20"}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right ${row.highlight ? "text-amber-700 font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center">
              <h3 className="text-base font-bold mb-2 w-full text-left">Enterprise Value Composition</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RechartsPieChart>
                  <Pie data={results.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name">
                    {results.chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                {results.chartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                    {d.name} — {d.pct}%
                  </div>
                ))}
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-3 text-foreground">Summary</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {results.summary.map((row, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{row.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an EBITDA Multiple Valuation Calculator?</h2>
            <p>An EBITDA multiple valuation is the standard way buyers, sellers, and advisors price a private business. It starts with the company's EBITDA — a proxy for operating cash generation — and applies a multiple derived from comparable sales in the same industry. The result is enterprise value; subtracting net debt converts it into the equity value an owner would actually receive.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Enterprise value equals EBITDA times the multiple. Net debt is total debt minus cash on hand, and equity value is enterprise value minus net debt. The donut chart shows how enterprise value splits between equity and debt, and the breakdown table walks every step so the headline figure can be verified line by line.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary number is equity value — what the owner walks away with. The three-stat bar shows enterprise value, the multiple applied, and net debt. Run several multiples (for example 4x, 6x, and 8x) to build a valuation range, and adjust cash and debt to reflect the balance sheet as of the valuation date. The summary block mirrors the breakdown table exactly, so the numbers always reconcile.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/business-valuation-ebitda-multiple-calculator" />
          <PopularCalculators exclude="/calculator/business-valuation-ebitda-multiple-calculator" />
        </div>
      </div>
    </>
  );
}
