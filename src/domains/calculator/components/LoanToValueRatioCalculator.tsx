"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface LtvInputs {
  propertyValue: number;
  downPayment: number;
  loanType: "conventional" | "fha" | "va" | "usda";
}

interface LtvResult {
  ltv: number;
  loanAmount: number;
  downPaymentPct: number;
  equityPct: number;
  pmiRequired: boolean;
  tier: string;
  maxNoPmiLtv: number;
  chartData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

const MAX_NO_PMI: Record<LtvInputs["loanType"], number> = {
  conventional: 80,
  fha: 96.5,
  va: 100,
  usda: 100,
};

function ltvTier(ltv: number): string {
  if (ltv <= 60) return "Excellent";
  if (ltv <= 80) return "Good";
  if (ltv <= 90) return "Fair";
  if (ltv <= 95) return "High";
  return "Very High";
}

function calcLtv(inputs: LtvInputs): LtvResult {
  const loanAmount = Math.max(0, inputs.propertyValue - inputs.downPayment);
  const ltv = inputs.propertyValue > 0 ? (loanAmount / inputs.propertyValue) * 100 : 0;
  const downPaymentPct = inputs.propertyValue > 0 ? (inputs.downPayment / inputs.propertyValue) * 100 : 0;
  const equityPct = 100 - ltv;
  const maxNoPmiLtv = MAX_NO_PMI[inputs.loanType];
  const pmiRequired = inputs.loanType === "conventional" ? ltv > maxNoPmiLtv : inputs.loanType === "fha" ? false : false;

  const chartData = [
    { name: "Loan Amount", value: loanAmount, color: "hsl(var(--primary))" },
    { name: "Your Equity", value: Math.max(0, inputs.downPayment), color: "#10b981" },
  ].filter((d) => d.value > 0);

  const breakdown: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Property Value", value: `$${inputs.propertyValue.toLocaleString()}` },
    { label: "Down Payment", value: `$${inputs.downPayment.toLocaleString()}` },
    { label: "Down Payment %", value: `${downPaymentPct.toFixed(1)}%` },
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString()}` },
    { label: "Loan-to-Value Ratio", value: `${ltv.toFixed(1)}%`, highlight: true },
    { label: "Equity Stake", value: `${equityPct.toFixed(1)}%` },
    { label: "LTV Tier", value: ltvTier(ltv) },
    { label: "PMI Required", value: pmiRequired ? "Yes" : "No", highlight: true },
  ];

  const summaryStats = [
    { label: "Loan-to-Value Ratio", value: `${ltv.toFixed(1)}%` },
    { label: "Loan Amount", value: `$${loanAmount.toLocaleString()}` },
    { label: "Down Payment %", value: `${downPaymentPct.toFixed(1)}%` },
    { label: "Equity Stake", value: `${equityPct.toFixed(1)}%` },
    { label: "LTV Tier", value: ltvTier(ltv) },
    { label: "PMI Required", value: pmiRequired ? "Yes" : "No" },
  ];

  return { ltv, loanAmount, downPaymentPct, equityPct, pmiRequired, tier: ltvTier(ltv), maxNoPmiLtv, chartData, breakdown, summaryStats };
}

const DEFAULTS: LtvInputs = { propertyValue: 400000, downPayment: 80000, loanType: "conventional" };

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

export default function LoanToValueRatioCalculator() {
  const [propertyValue, setPropertyValue] = useState("400000");
  const [downPayment, setDownPayment] = useState("80000");
  const [loanType, setLoanType] = useState<LtvInputs["loanType"]>("conventional");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<LtvResult | null>(null);

  const calculate = () =>
    setResult(calcLtv({
      propertyValue: parseFloat(propertyValue) || 0,
      downPayment: parseFloat(downPayment) || 0,
      loanType,
    }));
  const reset = () => { setPropertyValue(DEFAULTS.propertyValue.toString()); setDownPayment(DEFAULTS.downPayment.toString()); setLoanType(DEFAULTS.loanType); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const faqs = [
    { question: "What is loan-to-value ratio?", answer: "Loan-to-value (LTV) is the size of your mortgage compared to the property's value, expressed as a percentage. It is calculated by dividing the loan amount by the property value. A $320,000 loan on a $400,000 home is an 80% LTV. Lower LTV means more equity and less risk for the lender." },
    { question: "What is a good LTV for a mortgage?", answer: "80% or lower is the benchmark most buyers aim for, because it means no private mortgage insurance (PMI) on a conventional loan. LTV above 80% requires PMI, and 95%+ is generally considered high risk, usually limited to first-time buyer programs." },
    { question: "How does LTV affect my interest rate?", answer: "Lenders price risk into rates: higher LTV loans typically carry higher rates because the borrower has less equity at stake and default risk is higher. Improving your LTV by increasing your down payment can unlock meaningfully better rates." },
    { question: "What is the difference between LTV and CLTV?", answer: "LTV only considers your first mortgage. Combined loan-to-value (CLTV) adds any other liens, like a HELOC or second mortgage, divided by the property value. Lenders use CLTV when you borrow against equity on top of an existing mortgage." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Loan-to-Value Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan-to-Value Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="property-value" label="Property Value" value={propertyValue} onChange={setPropertyValue} prefix="$" />
              <CompactInput id="down-payment" label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Loan Type</label>
                    <select value={loanType} onChange={(e) => setLoanType(e.target.value as LtvInputs["loanType"])} className="w-full h-10 px-3 text-base border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="conventional">Conventional (PMI above 80%)</option>
                      <option value="fha">FHA (MIP, up to 96.5%)</option>
                      <option value="va">VA (up to 100%)</option>
                      <option value="usda">USDA (up to 100%)</option>
                    </select>
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
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Loan-to-Value Ratio</div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">{result.ltv.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground font-medium">Tier: {result.tier} · PMI {result.pmiRequired ? "required" : "not required"} on a {loanType} loan</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Loan Amount", `$${result.loanAmount.toLocaleString()}`], ["Down Payment %", `${result.downPaymentPct.toFixed(1)}%`], ["Equity Stake", `${result.equityPct.toFixed(1)}%`]].map(([l, v], i) => (
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
                <h3 className="text-base font-bold mb-2 w-full text-left">Property Ownership Split</h3>
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
            <h2 className="text-2xl font-bold mb-3">Understanding Loan-to-Value</h2>
            <p>Loan-to-value is one of the first numbers a lender calculates. It expresses your mortgage as a percentage of the property's value and directly determines whether you need private mortgage insurance, what interest rate you are offered, and how much equity you start with. This <strong>LTV calculator</strong> computes all of it instantly.</p>
            <h2 className="text-2xl font-bold mb-3">The 80% Rule</h2>
            <p>On a conventional loan, an LTV of 80% or less means no PMI. Put down 20% on a $400,000 home and your $320,000 loan sits exactly at the 80% line. Below 80% LTV you not only avoid PMI, you typically qualify for the lender's best rate tier — a double saving that can add up to tens of thousands of dollars over a 30-year term.</p>
            <h2 className="text-2xl font-bold mb-3">LTV Tiers at a Glance</h2>
            <p>Up to 60% LTV is considered excellent, 61–80% good, 81–90% fair, 91–95% high, and above 95% very high. The higher your tier, the more conservative lenders become and the more programs (like FHA at 96.5% or VA at 100%) matter as alternatives.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-to-value-ratio-calculator" />
          <PopularCalculators exclude="/calculator/loan-to-value-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
