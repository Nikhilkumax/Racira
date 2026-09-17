"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface DscrInputs {
  grossRent: number;
  operatingExpenses: number;
  mortgagePayment: number;
  propertyType: "residential" | "commercial";
}

interface DscrResult {
  noi: number;
  debtService: number;
  dscr: number;
  threshold: number;
  status: "Pass" | "Fail";
  maxSupportablePayment: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

const THRESHOLDS: Record<DscrInputs["propertyType"], number> = {
  residential: 1.25,
  commercial: 1.3,
};

function calcDscr(inputs: DscrInputs): DscrResult {
  const noi = Math.max(0, inputs.grossRent - inputs.operatingExpenses) * 12;
  const debtService = inputs.mortgagePayment * 12;
  const dscr = debtService > 0 ? noi / debtService : 0;
  const threshold = THRESHOLDS[inputs.propertyType];
  const status: DscrResult["status"] = dscr >= threshold ? "Pass" : "Fail";
  const maxSupportablePayment = noi / 12;

  const chartData = [
    { name: "Net Operating Income", value: noi, fill: "hsl(var(--primary))" },
    { name: "Annual Debt Service", value: debtService, fill: dscr >= threshold ? "#10b981" : "#ef4444" },
  ];

  const breakdown: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Gross Monthly Rent", value: `$${inputs.grossRent.toLocaleString()}` },
    { label: "Monthly Operating Expenses", value: `$${inputs.operatingExpenses.toLocaleString()}` },
    { label: "Net Operating Income (Annual)", value: `$${noi.toLocaleString()}`, highlight: true },
    { label: "Monthly Mortgage Payment", value: `$${inputs.mortgagePayment.toLocaleString()}` },
    { label: "Annual Debt Service", value: `$${debtService.toLocaleString()}` },
    { label: "Debt Coverage Ratio (DSCR)", value: `${dscr.toFixed(2)}`, highlight: true },
    { label: `Lender Minimum (${inputs.propertyType})`, value: `${threshold.toFixed(2)}` },
    { label: "Underwriting Result", value: status === "Pass" ? "Pass — meets lender minimum" : "Fail — below lender minimum", highlight: true },
  ];

  const summaryStats = [
    { label: "Debt Coverage Ratio", value: dscr.toFixed(2) },
    { label: "Net Operating Income", value: `$${noi.toLocaleString()}` },
    { label: "Annual Debt Service", value: `$${debtService.toLocaleString()}` },
    { label: "Max Supportable Monthly Payment", value: `$${maxSupportablePayment.toLocaleString()}` },
    { label: "Lender Minimum", value: threshold.toFixed(2) },
    { label: "Underwriting Result", value: status },
  ];

  return { noi, debtService, dscr, threshold, status, maxSupportablePayment, chartData, breakdown, summaryStats };
}

const DEFAULTS: DscrInputs = { grossRent: 7500, operatingExpenses: 2000, mortgagePayment: 3000, propertyType: "residential" };

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

const CustomTooltip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{label}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
  </div>
) : null;

export default function DebtCoverageRatioMortgageCalculator() {
  const [grossRent, setGrossRent] = useState("7500");
  const [operatingExpenses, setOperatingExpenses] = useState("2000");
  const [mortgagePayment, setMortgagePayment] = useState("3000");
  const [propertyType, setPropertyType] = useState<DscrInputs["propertyType"]>("residential");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<DscrResult | null>(null);

  const calculate = () =>
    setResult(calcDscr({
      grossRent: parseFloat(grossRent) || 0,
      operatingExpenses: parseFloat(operatingExpenses) || 0,
      mortgagePayment: parseFloat(mortgagePayment) || 0,
      propertyType,
    }));
  const reset = () => { setGrossRent(DEFAULTS.grossRent.toString()); setOperatingExpenses(DEFAULTS.operatingExpenses.toString()); setMortgagePayment(DEFAULTS.mortgagePayment.toString()); setPropertyType(DEFAULTS.propertyType); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const faqs = [
    { question: "What is the debt coverage ratio for a mortgage?", answer: "The debt coverage ratio (DSCR) compares a property's net operating income to its annual mortgage payments. It is calculated as NOI divided by total debt service. A DSCR of 1.25 means the property generates 25% more income than its annual loan payments require." },
    { question: "What DSCR do lenders require?", answer: "Residential investment property lenders typically require a minimum DSCR of 1.25, while commercial lenders often want 1.30 or higher. Some programs accept 1.0–1.15 with compensating factors like larger down payments or strong borrower credit." },
    { question: "How is net operating income calculated?", answer: "NOI is gross rental income minus operating expenses such as property management, maintenance, insurance, utilities, and property taxes. It excludes mortgage payments — those are the 'debt service' side of the ratio. Using NOI keeps the comparison consistent across lenders." },
    { question: "Can I still get a loan with a DSCR below 1.25?", answer: "Yes, but usually with a larger down payment, a higher interest rate, or a debt-service-coverage rider. A DSCR below 1.0 means the property does not cover its own payments, and most lenders will require strong personal income or reserves to offset that risk." },
  ];

  const statusColor = result?.status === "Pass" ? "text-emerald-600" : "text-red-500";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Debt Coverage Ratio Mortgage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Debt Coverage Ratio Mortgage Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="gross-rent" label="Gross Monthly Rent" value={grossRent} onChange={setGrossRent} prefix="$" />
              <CompactInput id="op-expenses" label="Monthly Operating Expenses" value={operatingExpenses} onChange={setOperatingExpenses} prefix="$" />
            </div>
            <CompactInput id="mortgage-payment" label="Monthly Mortgage Payment (P&I)" value={mortgagePayment} onChange={setMortgagePayment} prefix="$" />

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Property Type</label>
                    <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as DscrInputs["propertyType"])} className="w-full h-10 px-3 text-base border border-input rounded-md bg-background outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="residential">Residential (1.25 minimum)</option>
                      <option value="commercial">Commercial (1.30 minimum)</option>
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
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Debt Coverage Ratio (DSCR)</div>
                <div className={`text-4xl font-extrabold mb-1 tracking-tight ${statusColor}`}>{result.dscr.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground font-medium">{result.status === "Pass" ? "Pass" : "Fail"} — {result.dscr >= result.threshold ? "meets" : "below"} the {propertyType} minimum of {result.threshold.toFixed(2)}</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Net Operating Income", `$${result.noi.toLocaleString()}`], ["Annual Debt Service", `$${result.debtService.toLocaleString()}`], ["Underwriting", result.status]].map(([l, v], i) => (
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

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Income vs. Debt Service</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                    <ReferenceLine y={result.noi} stroke="#f59e0b" strokeDasharray="4 4" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-2">Dashed line: NOI level. Debt service must stay below it to keep DSCR above 1.0.</p>
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
            <h2 className="text-2xl font-bold mb-3">What Is DSCR?</h2>
            <p>Debt service coverage ratio tells an investment-property lender whether a building's income can comfortably pay for its own mortgage. The formula is simple: net operating income divided by annual debt service. A ratio of 1.25 means the property throws off $1.25 of income for every $1.00 of loan payment — the industry-standard cushion for residential rentals.</p>
            <h2 className="text-2xl font-bold mb-3">Why Lenders Insist on Coverage</h2>
            <p>A property with a DSCR below 1.0 cannot pay its mortgage from its own rents, which means the owner must subsidize it from personal income. Lenders treat that as elevated risk, so they set minimums — usually 1.25 residential and 1.30 commercial — to ensure a realistic buffer for vacancies, repairs, and rate increases.</p>
            <h2 className="text-2xl font-bold mb-3">What the Max Payment Tells You</h2>
            <p>The calculator also shows the maximum mortgage payment your NOI can support at the lender minimum. If your target payment exceeds that number, you will need a smaller loan, a lower rate, or a larger down payment to keep the property self-sustaining.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-coverage-ratio-mortgage-calculator" />
          <PopularCalculators exclude="/calculator/debt-coverage-ratio-mortgage-calculator" />
        </div>
      </div>
    </>
  );
}
