"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface LtvResult {
  value: number;
  loan: number;
  ltv: number;
  equity: number;
  downPayment: number;
  maxLoan80: number;
  pmi: boolean;
  pmiExtra: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt$(v: number): string {
  return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function fmtPct(v: number, d = 1): string {
  return `${v.toFixed(d)}%`;
}

function calcLtv(value: number, loan: number): LtvResult {
  const ltv = value > 0 ? (loan / value) * 100 : 0;
  const equity = Math.max(0, value - loan);
  const downPayment = Math.max(0, value - loan);
  const maxLoan80 = value * 0.8;
  const pmi = ltv > 80;
  const pmiExtra = pmi ? value * 0.0035 / 12 : 0; // typical 0.35% annual PMI on the loan
  const breakdown = [
    { label: "Property Value", value: fmt$(value) },
    { label: "Loan Amount", value: fmt$(loan) },
    { label: "Down Payment / Equity", value: fmt$(downPayment) },
    { label: "Loan-to-Value Ratio", value: fmtPct(ltv) },
    { label: "Equity Share", value: `${fmtPct(100 - ltv)}` },
    { label: "Max Loan at 80% LTV", value: fmt$(maxLoan80) },
    { label: "PMI Required", value: pmi ? `Yes — ~${fmt$(pmiExtra)}/month` : "No — LTV at or below 80%" },
    { label: "Room to 80% LTV", value: ltv > 80 ? `${fmt$(loan - maxLoan80)} over` : `${fmt$(maxLoan80 - loan)} below` },
  ];
  const summaryStats = [
    { label: "LTV", value: fmtPct(ltv) },
    { label: "Equity", value: fmt$(equity) },
    { label: "Loan Amount", value: fmt$(loan) },
    { label: "Property Value", value: fmt$(value) },
    { label: "PMI", value: pmi ? `Yes (~${fmt$(pmiExtra)}/mo)` : "No" },
    { label: "Down Payment %", value: fmtPct(100 - ltv) },
    { label: "Max Loan (80%)", value: fmt$(maxLoan80) },
    { label: "Equity Share", value: fmtPct(100 - ltv) },
  ];
  const chartData = [
    { name: "Loan", value: Math.round(loan), fill: "hsl(var(--primary))" },
    { name: "Equity", value: Math.max(0, Math.round(value - loan)), fill: "#10b981" },
  ];
  return { value, loan, ltv, equity, downPayment, maxLoan80, pmi, pmiExtra, breakdown, summaryStats, chartData };
}

const DEFAULTS = { value: "400000", loan: "300000" };

export default function LtvCalculator() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [loan, setLoan] = useState(DEFAULTS.loan);
  const [result, setResult] = useState<LtvResult | null>(null);

  const v = parseFloat(value) || 0;
  const l = parseFloat(loan) || 0;
  const errs: string[] = [];
  if (v <= 0 || l <= 0) errs.push("Property value and loan amount must both be greater than 0.");
  if (l > v) errs.push("Loan amount exceeds property value — LTV above 100% is not a standard mortgage.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcLtv(v, l)); };
  const reset = () => {
    setValue(DEFAULTS.value); setLoan(DEFAULTS.loan);
    setResult(calcLtv(400000, 300000));
  };
  useEffect(() => { setResult(calcLtv(400000, 300000)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the loan-to-value ratio?", answer: "LTV is the loan amount divided by the property's appraised value, expressed as a percentage. A $300,000 loan on a $400,000 home is 75% LTV — the higher the LTV, the less equity you hold and the riskier the loan for the lender." },
    { question: "When is PMI required?", answer: "Conventional lenders generally require private mortgage insurance when LTV exceeds 80%, because the borrower has less than 20% equity. PMI protects the lender and typically costs about 0.3-0.5% of the loan per year until LTV falls to 80%." },
    { question: "How can I remove PMI?", answer: "Pay the loan down until LTV reaches 80%, wait for home appreciation to push LTV below 80% and request removal, or refinance. Recent federal rules also allow automatic PMI cancellation once LTV hits 78% of the original value." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "LTV Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">LTV Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Property Value</label>
                <div className={inp}><input type="number" value={value} onChange={e => setValue(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
              </div>
              <div>
                <label className={lbl}>Loan Amount</label>
                <div className={inp}><input type="number" value={loan} onChange={e => setLoan(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">$</span></div>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Loan-to-Value Ratio</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmtPct(result.ltv)}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.pmi ? "Above 80% — private mortgage insurance applies" : "At or below 80% — no PMI required"}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Equity`, fmt$(result.equity)], ["Down Payment %", fmtPct(100 - result.ltv)], ["PMI", result.pmi ? `~${fmt$(result.pmiExtra)}/mo` : "None"]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Property Ownership Split</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmt$(v), ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Loan vs equity share of the property value</p>
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
            <h2 className="text-2xl font-bold mb-3">The LTV Formula</h2>
            <p>This <strong>LTV calculator</strong> divides the loan amount by the property's appraised value: a $300,000 loan on a $400,000 home is 75% LTV. The complement — 100% minus LTV — is your equity share, which grows as you pay down the loan or the home appreciates.</p>
            <h2 className="text-2xl font-bold mb-3">The 80% Threshold</h2>
            <p>Crossing 80% LTV is the critical line: below it you have 20% equity and no PMI; above it, conventional lenders require private mortgage insurance. The calculator flags the threshold and estimates the monthly PMI cost at a typical 0.35% annual rate.</p>
            <h2 className="text-2xl font-bold mb-3">Why Lenders Care</h2>
            <p>Higher LTV means more leverage and less cushion if prices fall, so lenders price in the risk with PMI, higher rates, or stricter terms. Knowing your LTV — before buying or refinancing — tells you what kind of deal you can expect.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ltv-calculator" />
          <PopularCalculators exclude="/calculator/ltv-calculator" />
        </div>
      </div>
    </>
  );
}
