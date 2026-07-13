"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

export default function DebtServiceCoverageCalculator() {
  const [grossIncome, setGrossIncome] = useState("180000");
  const [opex, setOpex] = useState("45000");
  const [principal, setPrincipal] = useState("50000");
  const [interest, setInterest] = useState("40000");

  const [res, setRes] = useState<{
    noi: number;
    debtService: number;
    dscr: number;
    ratingLabel: string;
    chartData: { name: string; value: number }[];
  } | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const gi = parseFloat(grossIncome) || 0;
    const op = parseFloat(opex) || 0;
    const pr = parseFloat(principal) || 0;
    const intr = parseFloat(interest) || 0;

    const noi = Math.max(0, gi - op);
    const debtService = pr + intr;
    const dscr = debtService > 0 ? noi / debtService : 0;

    let ratingLabel = "Strong";
    if (dscr < 1.0) {
      ratingLabel = "Negative Cash Flow (Unacceptable)";
    } else if (dscr < 1.2) {
      ratingLabel = "Marginal / Risky";
    } else if (dscr < 1.4) {
      ratingLabel = "Good (Standard)";
    } else {
      ratingLabel = "Strong (Excellent)";
    }

    const chartData = [
      { name: "Net Operating Income (NOI)", value: noi },
      { name: "Total Debt Service", value: debtService },
    ];

    setRes({ noi, debtService, dscr, ratingLabel, chartData });
  };

  const reset = () => {
    setGrossIncome("180000");
    setOpex("45000");
    setPrincipal("50000");
    setInterest("40000");
  };

  const ratingColor = (r: string) => {
    if (r.startsWith("Negative")) return "text-red-600";
    if (r.startsWith("Marginal")) return "text-amber-600";
    if (r.startsWith("Good")) return "text-primary";
    return "text-emerald-600";
  };

  const faqs = [
    { question: "What is Debt Service Coverage Ratio (DSCR)?", answer: "The Debt Service Coverage Ratio (DSCR) is a financial metric used to evaluate a business's or property's ability to produce enough income to cover its debt obligations (including principal and interest). Lenders use DSCR to assess risk before approving commercial loans or mortgages." },
    { question: "How is DSCR calculated?", answer: "DSCR is calculated using the formula: DSCR = Net Operating Income (NOI) ÷ Total Debt Service. NOI is Gross Rental/Operating Revenues minus Operating Expenses. Total Debt Service is the sum of all annual principal and interest payments." },
    { question: "What is a good DSCR ratio?", answer: "A DSCR of 1.0 means cash flow is exactly enough to cover debt payments, with zero buffer. Lenders typically require a minimum DSCR of 1.20 to 1.25 to provide a safety margin against unexpected vacancy, rent defaults, or expense hikes. A DSCR below 1.0 indicates a cash-flow negative investment." },
    { question: "How can I improve my DSCR?", answer: "You can improve your DSCR by either increasing your Net Operating Income (raising rents, filling vacancies, or cutting operating expenses) or by decreasing your debt service payments (making a larger down payment, refinancing at a lower interest rate, or extending the loan amortization period)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "DSCR Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Debt Service Coverage Ratio (DSCR) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Operating Income & Debt</h2>
            <CompactInput id="gi" label="Gross Operating Income (Annual)" value={grossIncome} onChange={setGrossIncome} prefix="$" />
            <CompactInput id="op" label="Operating Expenses (Annual)" value={opex} onChange={setOpex} prefix="$" />
            
            <div className="border-t border-border pt-4 flex flex-col gap-3">
              <span className="text-sm font-semibold text-foreground">Annual Debt Service</span>
              <CompactInput id="pr" label="Annual Principal Payments" value={principal} onChange={setPrincipal} prefix="$" />
              <CompactInput id="intr" label="Annual Interest Payments" value={interest} onChange={setInterest} prefix="$" />
            </div>

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
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
                  <h2 className="text-2xl font-bold mb-3">Debt Coverage Summary</h2>
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Debt Service Coverage Ratio</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtRatio(res.dscr)}</div>
                  <div className={`text-sm font-bold ${ratingColor(res.ratingLabel)}`}>{res.ratingLabel}</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Financial Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Net Operating Income (NOI)", value: fmtVal(res.noi), bold: true },
                        { label: "Total Debt Service", value: fmtVal(res.debtService), bold: true },
                        { label: "Debt Service Coverage Ratio", value: fmtRatio(res.dscr) },
                        { label: "Lender Rating", value: res.ratingLabel },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className={`p-2.5 pr-3 text-right font-bold ${r.label === "Lender Rating" ? ratingColor(res.ratingLabel) : "text-foreground"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Operating Income vs Debt Service</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={res.chartData} layout="vertical" margin={{ top: 4, right: 8, left: 64, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: any) => fmtVal(v)} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
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

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding DSCR</h2>
            <p>For commercial real estate lenders and investors, the Debt Service Coverage Ratio (DSCR) is the gold standard for measuring leverage risk. It tells you whether an asset generates enough income to cover its debt obligations. Unlike residential mortgages where loan approval is based on a borrower's personal income, commercial real estate loans rely directly on the property's ability to cover its own debts via DSCR.</p>
            
            <h2 className="text-2xl font-bold mb-3">What is Net Operating Income (NOI)?</h2>
            <p>Net Operating Income (NOI) represents all the revenues generated by the property (rental payments, parking fees, laundry services) minus all necessary operating expenses (property taxes, insurance, maintenance, property management fees). Crucially, NOI is calculated *before* subtracting interest and taxes.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-service-coverage-ratio-calculator" />
          <PopularCalculators exclude="/calculator/debt-service-coverage-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
