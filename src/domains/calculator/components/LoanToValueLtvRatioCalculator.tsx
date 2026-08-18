"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface RefiLtvInputs {
  homeValue: number;
  mortgageBalance: number;
  otherLiens: number;
}

interface RefiLtvResult {
  ltv: number;
  cltv: number;
  equity: number;
  equityPct: number;
  availableEquity: number;
  maxCashOut: number;
  tier: string;
  chartData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function ltvTier(ltv: number): string {
  if (ltv <= 60) return "Excellent";
  if (ltv <= 80) return "Good";
  if (ltv <= 90) return "Fair";
  if (ltv <= 95) return "High";
  return "Very High";
}

function calcRefiLtv(inputs: RefiLtvInputs): RefiLtvResult {
  const totalDebt = inputs.mortgageBalance + inputs.otherLiens;
  const ltv = inputs.homeValue > 0 ? (inputs.mortgageBalance / inputs.homeValue) * 100 : 0;
  const cltv = inputs.homeValue > 0 ? (totalDebt / inputs.homeValue) * 100 : 0;
  const equity = Math.max(0, inputs.homeValue - inputs.mortgageBalance);
  const equityPct = inputs.homeValue > 0 ? (equity / inputs.homeValue) * 100 : 0;
  const availableEquity = Math.max(0, inputs.homeValue * 0.8 - totalDebt);
  const maxCashOut = Math.max(0, inputs.homeValue * 0.8 - inputs.mortgageBalance - inputs.otherLiens);

  const chartData = [
    { name: "Mortgage Debt", value: inputs.mortgageBalance, color: "hsl(var(--primary))" },
    { name: "Other Liens", value: inputs.otherLiens, color: "#f59e0b" },
    { name: "Home Equity", value: equity, color: "#10b981" },
  ].filter((d) => d.value > 0);

  const breakdown: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Current Home Value", value: `$${inputs.homeValue.toLocaleString()}` },
    { label: "Outstanding Mortgage Balance", value: `$${inputs.mortgageBalance.toLocaleString()}` },
    { label: "Other Liens (HELOC, etc.)", value: `$${inputs.otherLiens.toLocaleString()}` },
    { label: "Current LTV", value: `${ltv.toFixed(1)}%`, highlight: true },
    { label: "Combined LTV (CLTV)", value: `${cltv.toFixed(1)}%` },
    { label: "Home Equity", value: `$${equity.toLocaleString()} (${equityPct.toFixed(1)}%)` },
    { label: "Available Equity (80% CLTV)", value: `$${availableEquity.toLocaleString()}` },
    { label: "Max Cash-Out Refinance", value: `$${maxCashOut.toLocaleString()}`, highlight: true },
  ];

  const summaryStats = [
    { label: "Current LTV", value: `${ltv.toFixed(1)}%` },
    { label: "Combined LTV (CLTV)", value: `${cltv.toFixed(1)}%` },
    { label: "Home Equity", value: `$${equity.toLocaleString()}` },
    { label: "Equity Stake", value: `${equityPct.toFixed(1)}%` },
    { label: "Available Equity (80% CLTV)", value: `$${availableEquity.toLocaleString()}` },
    { label: "LTV Tier", value: ltvTier(ltv) },
  ];

  return { ltv, cltv, equity, equityPct, availableEquity, maxCashOut, tier: ltvTier(ltv), chartData, breakdown, summaryStats };
}

const DEFAULTS: RefiLtvInputs = { homeValue: 450000, mortgageBalance: 300000, otherLiens: 0 };

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
  </div>
) : null;

export default function LoanToValueLtvRatioCalculator() {
  const [homeValue, setHomeValue] = useState("450000");
  const [mortgageBalance, setMortgageBalance] = useState("300000");
  const [otherLiens, setOtherLiens] = useState("0");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<RefiLtvResult | null>(null);

  const calculate = () =>
    setResult(calcRefiLtv({
      homeValue: parseFloat(homeValue) || 0,
      mortgageBalance: parseFloat(mortgageBalance) || 0,
      otherLiens: parseFloat(otherLiens) || 0,
    }));
  const reset = () => { setHomeValue(DEFAULTS.homeValue.toString()); setMortgageBalance(DEFAULTS.mortgageBalance.toString()); setOtherLiens(DEFAULTS.otherLiens.toString()); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const faqs = [
    { question: "What is the LTV ratio for refinancing?", answer: "For a refinance, LTV is your outstanding mortgage balance divided by the current appraised value of the home. Unlike a purchase, the value is what the home is worth today, not what you paid. If your balance is $300,000 on a $450,000 home, your LTV is 66.7%." },
    { question: "What LTV do I need to refinance?", answer: "Most lenders require an LTV of 80% or lower for a rate-and-term refinance to avoid mortgage insurance, and the same 80% cap applies to cash-out refinances with conventional loans. FHA and VA programs allow higher LTVs but may add mortgage insurance premiums." },
    { question: "What is CLTV and why does it matter?", answer: "Combined loan-to-value (CLTV) includes every lien against the property — your first mortgage plus any HELOC or second mortgage. Lenders cap CLTV (usually at 80–90%) when you want to borrow against your equity, so existing liens reduce how much you can take out." },
    { question: "How much equity can I cash out?", answer: "If your home is worth $450,000 and your total debt is $300,000, you have $150,000 of equity. At the conventional 80% CLTV cap you can carry up to $360,000 in total debt, so roughly $60,000 of that equity is accessible for a cash-out refinance." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Loan-to-Value (LTV) Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan-to-Value (LTV) Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="home-value" label="Current Home Value" value={homeValue} onChange={setHomeValue} prefix="$" />
              <CompactInput id="mortgage-balance" label="Outstanding Mortgage Balance" value={mortgageBalance} onChange={setMortgageBalance} prefix="$" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Other Liens (HELOC, Second Mortgage)</label>
                    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                      <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">$</span>
                      <input type="number" step="any" value={otherLiens} onChange={(e) => setOtherLiens(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Current LTV</div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{result.ltv.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground font-medium">Tier: {result.tier} · CLTV with liens: {result.cltv.toFixed(1)}%</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Home Equity", `$${result.equity.toLocaleString()}`], ["Equity Stake", `${result.equityPct.toFixed(1)}%`], ["Available Equity (80%)", `$${result.availableEquity.toLocaleString()}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight ? "text-amber-700 font-semibold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center min-h-[280px]">
                <h3 className="text-base font-bold mb-2 w-full text-left">Where Your Home's Value Sits</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie data={result.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                      {result.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 w-full">
                  {result.chartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />{d.name}
                    </div>
                  ))}
                </div>
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
            <h2 className="text-2xl font-bold mb-3">LTV for Existing Homeowners</h2>
            <p>For refinancing and home equity borrowing, LTV is measured against today's home value, not your purchase price. Because values change, your true equity position can be very different from what you put down. This <strong>LTV ratio calculator</strong> uses your current balance and current value to show where you stand right now.</p>
            <h2 className="text-2xl font-bold mb-3">Equity Is Not All Yours to Borrow</h2>
            <p>Lenders rarely let you borrow against 100% of your equity. Conventional cash-out refinances cap total debt at 80% of the home's value, and any existing liens count against that cap. That is why the calculator separates your gross equity from your actually available equity — the difference is what a lender's lien position protects.</p>
            <h2 className="text-2xl font-bold mb-3">Moving Your LTV Down</h2>
            <p>Making extra principal payments or benefiting from market appreciation both lower your LTV over time. Dropping below 80% is a milestone: it removes the need for mortgage insurance on conventional loans and unlocks the best refinance rates.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-to-value-ltv-ratio-calculator" />
          <PopularCalculators exclude="/calculator/loan-to-value-ltv-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
