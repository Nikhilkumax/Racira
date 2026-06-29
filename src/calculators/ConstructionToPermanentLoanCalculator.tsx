"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Search, HardHat, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface C2PResult {
  constructionPhaseMonths: number;
  constructionLoanAmount: number;
  interestOnlyPayment: number;
  totalInterestDuringConstruction: number;
  permanentLoanAmount: number;
  permanentMonthlyPayment: number;
  totalConstructionCost: number;
  chartData: { phase: string; amount: number }[];
  summaryStats: { label: string; value: string }[];
}

function calcC2P(landValue: number, constructionCost: number, constructionMonths: number, constructionRate: number, permanentRate: number, permanentTermYears: number, downPaymentPct: number): C2PResult {
  // Total project cost
  const totalProjectCost = landValue + constructionCost;
  const downPayment = totalProjectCost * (downPaymentPct / 100);
  const constructionLoanAmount = totalProjectCost - downPayment;

  // During construction: interest-only on average ~50% of loan (draw schedule)
  const avgBalance = constructionLoanAmount * 0.6; // average drawn
  const monthlyConstructionRate = constructionRate / 100 / 12;
  const interestOnlyPayment = avgBalance * monthlyConstructionRate;
  const totalInterestDuringConstruction = interestOnlyPayment * constructionMonths;

  // After construction, loan converts to permanent mortgage
  const permanentLoanAmount = constructionLoanAmount; // rolls over
  const r = permanentRate / 100 / 12;
  const n = permanentTermYears * 12;
  const permanentMonthlyPayment = permanentLoanAmount > 0 && n > 0
    ? (r > 0 ? permanentLoanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : permanentLoanAmount / n)
    : 0;

  const totalConstructionCost = downPayment + totalInterestDuringConstruction + permanentMonthlyPayment * n;

  const chartData = [
    { phase: "Land", amount: Math.round(landValue) },
    { phase: "Construction", amount: Math.round(constructionCost) },
    { phase: "Interest (Build)", amount: Math.round(totalInterestDuringConstruction) },
    { phase: "Mortgage Interest", amount: Math.round(permanentMonthlyPayment * n - permanentLoanAmount) },
  ];

  const summaryStats = [
    { label: "Land Value", value: `$${landValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Construction Cost", value: `$${constructionCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Down Payment", value: `$${downPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })} (${downPaymentPct}%)` },
    { label: "Construction Loan", value: `$${constructionLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Interest-Only Payment", value: `~$${interestOnlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo` },
    { label: "Interest During Build", value: `$${totalInterestDuringConstruction.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Permanent Loan", value: `$${permanentLoanAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Permanent Payment", value: `$${permanentMonthlyPayment.toFixed(2)}/mo` },
  ];

  return { constructionPhaseMonths: constructionMonths, constructionLoanAmount, interestOnlyPayment, totalInterestDuringConstruction, permanentLoanAmount, permanentMonthlyPayment, totalConstructionCost, chartData, summaryStats };
}

const DEFAULTS = { landValue: "100000", constructionCost: "350000", constructionMonths: "12", constructionRate: "8.0", permanentRate: "6.5", permanentTermYears: "30", downPaymentPct: "20" };

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function ConstructionToPermanentLoanCalculator() {
  const [landValue, setLandValue] = useState(DEFAULTS.landValue);
  const [constructionCost, setConstructionCost] = useState(DEFAULTS.constructionCost);
  const [constructionMonths, setConstructionMonths] = useState(DEFAULTS.constructionMonths);
  const [constructionRate, setConstructionRate] = useState(DEFAULTS.constructionRate);
  const [permanentRate, setPermanentRate] = useState(DEFAULTS.permanentRate);
  const [permanentTermYears, setPermanentTermYears] = useState(DEFAULTS.permanentTermYears);
  const [downPaymentPct, setDownPaymentPct] = useState(DEFAULTS.downPaymentPct);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<C2PResult | null>(null);

  const calc = () => setResults(calcC2P(
    parseFloat(landValue)||0, parseFloat(constructionCost)||0, parseFloat(constructionMonths)||0,
    parseFloat(constructionRate)||0, parseFloat(permanentRate)||0, parseFloat(permanentTermYears)||30,
    parseFloat(downPaymentPct)||0
  ));
  const reset = () => { setLandValue(DEFAULTS.landValue); setConstructionCost(DEFAULTS.constructionCost); setConstructionMonths(DEFAULTS.constructionMonths); setConstructionRate(DEFAULTS.constructionRate); setPermanentRate(DEFAULTS.permanentRate); setPermanentTermYears(DEFAULTS.permanentTermYears); setDownPaymentPct(DEFAULTS.downPaymentPct); setShowAdvanced(false); };
  useEffect(() => { calc(); }, []);

  const faqs = [
    { question: "What is a construction-to-permanent loan?", answer: "A construction-to-permanent (C2P) loan, also called a one-time-close loan, combines the construction financing and the permanent mortgage into a single loan product with one application, one set of closing costs, and one closing. During construction, you pay interest-only on funds drawn. When construction is complete, the loan automatically converts to a standard amortizing mortgage." },
    { question: "How does the draw schedule work?", answer: "During construction, funds are not disbursed all at once. The lender releases money in draws—typically 4 to 6 installments tied to construction milestones (foundation complete, framing complete, etc.). A lender-appointed inspector verifies work before each draw is released. You pay interest only on the amount drawn, not the full loan amount." },
    { question: "What are the advantages over two separate loans?", answer: "A single closing means you pay closing costs only once, saving typically $3,000–$7,000. You also lock in your permanent mortgage rate at the time of the initial application, protecting you from rate increases during the 6–18 month construction period. There is less paperwork and lower stress compared to coordinating two separate loan applications." },
    { question: "What credit score is needed for a C2P loan?", answer: "Most lenders require a minimum credit score of 680-700 for conventional C2P loans. FHA one-time-close construction loans are available with scores as low as 580 with a 3.5% down payment. The qualification standards are typically stricter than for a standard mortgage because construction loans carry higher lender risk." },
    { question: "What is a contingency reserve?", answer: "Lenders typically require a contingency reserve of 5% to 10% of the total construction budget held in escrow to cover unexpected cost overruns. This reserve is part of the approved loan but is only released if verified cost increases occur. Any unused contingency funds are applied to reduce the permanent loan balance at conversion." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "Construction-to-Permanent Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Construction-to-Permanent Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="land" label="Land Value" value={landValue} onChange={setLandValue} prefix="$" />
              <CompactInput id="const" label="Construction Cost" value={constructionCost} onChange={setConstructionCost} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="months" label="Build Duration" value={constructionMonths} onChange={setConstructionMonths} suffix="months" />
              <CompactInput id="down" label="Down Payment" value={downPaymentPct} onChange={setDownPaymentPct} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="const-rate" label="Construction Rate" value={constructionRate} onChange={setConstructionRate} suffix="%" />
              <CompactInput id="perm-rate" label="Permanent Rate" value={permanentRate} onChange={setPermanentRate} suffix="%" />
            </div>
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-foreground mb-1.5">Permanent Term</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[["15","15yr"],["30","30yr"]].map(([v,l]) => (
                        <button key={v} onClick={() => setPermanentTermYears(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${permanentTermYears===v?"bg-primary text-primary-foreground border-primary":"border-input bg-background hover:bg-secondary"}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Permanent Monthly Payment</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${results.permanentMonthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">After {constructionMonths}-month build · During build ~${results.interestOnlyPayment.toFixed(2)}/mo</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Construction Loan", `$${results.constructionLoanAmount.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Build Interest", `$${results.totalInterestDuringConstruction.toLocaleString("en-US",{maximumFractionDigits:0})}`], ["Permanent Loan", `$${results.permanentLoanAmount.toLocaleString("en-US",{maximumFractionDigits:0})}`]].map(([l,v],i) => (
                  <div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className={`text-lg font-bold ${i===1?"text-amber-600":""}`}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Loan Details</h3>
                <div className="space-y-2.5">
                  {results.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0">
                      <span className="text-sm text-muted-foreground">{s.label}:</span>
                      <span className="text-sm font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Total Cost Breakdown</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={results.chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="phase" tick={{ fontSize: 12 }} width={75} />
                    <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, ""]} />
                    <Bar dataKey="amount" name="Amount" fill="hsl(var(--primary))" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Construction-to-Permanent Loan?</h2>
            <p>A <strong>construction-to-permanent loan</strong> (C2P), also known as a single-close or one-time-close construction loan, is a unique financing product that combines two separate loan phases into a single mortgage. The first phase funds the construction of your new home. The second phase automatically converts to a standard amortizing mortgage once the construction is complete and the certificate of occupancy is issued. Unlike a traditional two-loan approach, you apply and close only once, saving thousands in duplicate closing costs and eliminating the risk of rate lock expiration.</p>

            <h2 className="text-2xl font-bold mb-3">The Two Phases Explained</h2>
            <p><strong>Construction Phase:</strong> During the building period (typically 6 to 18 months), the lender releases funds in stages called draws. These draws are tied to specific construction milestones, such as foundation completion, framing, rough electrical and plumbing, and final finishes. During this phase, you pay interest only on the amount of money actually disbursed—not on the full loan commitment. This keeps your payments manageable during construction when you may also be paying rent elsewhere.</p>
            <p><strong>Permanent Phase:</strong> When the home is completed and passes all final inspections, the loan automatically rolls over into the permanent mortgage. The full loan amount becomes due, and your payments switch from interest-only to standard principal-and-interest amortizing payments. The permanent rate and term were locked at the original application, providing certainty throughout the entire process.</p>

            <h2 className="text-2xl font-bold mb-3">The Draw Schedule and Interest Calculation</h2>
            <p>The interest-only payment during construction fluctuates because it is based on the outstanding drawn balance, which increases with each draw. In the early months (when only the land and foundation draws have been made), your interest payment is relatively small. By the final months of construction (when most of the budget has been drawn), you are paying interest on nearly the full loan amount. This calculator uses an average of approximately 60% of the loan balance to estimate your typical monthly interest cost during construction—a useful approximation for planning purposes.</p>

            <h2 className="text-2xl font-bold mb-3">Key Advantages of the One-Time Close</h2>
            <p>The primary advantage is cost savings. A traditional approach requires two separate loans: a construction loan that is paid off at completion, and a new purchase mortgage for the completed home. Each loan has its own appraisal, title search, origination fees, and closing costs—duplicating expenses that can total $5,000 to $15,000. The C2P loan eliminates the second closing entirely.</p>
            <p>Rate protection is the second major advantage. Standard construction loans carry variable rates tied to the prime rate. With a C2P loan, your permanent mortgage rate is locked at the original application. If rates rise by 1% or more during your 12-month construction period—a real possibility in volatile rate environments—you benefit significantly from your rate lock.</p>

            <h2 className="text-2xl font-bold mb-3">Who Should Use a C2P Loan?</h2>
            <p>Construction-to-permanent loans are ideal for borrowers who are building a custom home on land they already own or are purchasing simultaneously. They work best when you have a licensed general contractor, detailed construction plans, and a fixed-price contract. Lenders will review all three during underwriting. Owner-builder arrangements (where you act as your own contractor) are typically not eligible for C2P programs and require a separate specialized construction loan product.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/construction-to-permanent-loan-calculator" />
          <PopularCalculators exclude="/calculator/construction-to-permanent-loan-calculator" />
        </div>
      </div>
    </>
  );
}
