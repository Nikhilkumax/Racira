"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Plus, Trash2, HardHat, Calendar, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { LazyView } from "@/components/ui/LazyView";

interface Draw {
  month: number;
  amount: number;
  label: string;
}

interface ConstructionResults {
  totalInterestPaid: number;
  averageMonthlyInterest: number;
  finalDisbursedBalance: number;
  disbursementPercentage: number;
  contingencyAmount: number;
  permanentMonthlyPI: number;
  monthlyData: { month: number; disbursed: number; interest: number; drawAmount: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateDraws = (
  loanAmount: number, rate: number, months: number, draws: Draw[], permRate: number, permYears: number, contingencyPct: number
): ConstructionResults => {
  const monthlyRate = rate / 100 / 12;
  const contingencyAmount = loanAmount * (contingencyPct / 100);
  const totalLimit = loanAmount + contingencyAmount;
  
  let currentDisbursed = 0;
  let totalInterest = 0;
  const monthlyData = [];
  
  // Initialize array up to max month
  const maxMonth = Math.max(months, ...draws.map(d => d.month));
  
  for (let m = 1; m <= maxMonth; m++) {
    const currentMonthDraws = draws.filter(d => d.month === m);
    let drawAmount = 0;
    currentMonthDraws.forEach(d => {
      drawAmount += d.amount;
    });
    
    currentDisbursed += drawAmount;
    const interestThisMonth = currentDisbursed * monthlyRate;
    totalInterest += interestThisMonth;
    
    monthlyData.push({
      month: m,
      disbursed: currentDisbursed,
      interest: interestThisMonth,
      drawAmount
    });
  }
  
  const finalDisbursed = currentDisbursed;
  
  // Permanent Loan Calc (assuming one-close where disbursed balance + interest rolls over, or just disbursed)
  // Typically, borrowers pay interest monthly during construction.
  const pRate = permRate / 100 / 12;
  const pN = permYears * 12;
  const permanentMonthlyPI = pRate > 0 && pN > 0 
    ? finalDisbursed * (pRate * Math.pow(1 + pRate, pN)) / (Math.pow(1 + pRate, pN) - 1) 
    : finalDisbursed / (pN || 1);

  const summaryStats = [
    { label: "Total Loan Limit", value: `$${totalLimit.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Disbursed", value: `$${finalDisbursed.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Remaining Funds", value: `$${Math.max(0, totalLimit - finalDisbursed).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest Paid", value: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Total Construction Draws", amount: `$${finalDisbursed.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Interest (Paid Monthly)", amount: `$${totalInterest.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, colorClass: "text-amber-600" },
    { label: "Total Project Cost Outlay", amount: `$${(finalDisbursed + totalInterest).toLocaleString("en-US", { maximumFractionDigits: 0 })}`, isTotal: true },
  ];

  return {
    totalInterestPaid: totalInterest,
    averageMonthlyInterest: totalInterest / (maxMonth || 1),
    finalDisbursedBalance: finalDisbursed,
    disbursementPercentage: totalLimit > 0 ? (finalDisbursed / totalLimit) * 100 : 0,
    contingencyAmount,
    permanentMonthlyPI,
    monthlyData,
    summaryStats,
    breakdown
  };
};

const DEFAULTS = {
  loanAmount: "500000",
  rate: "7.5",
  months: "12",
  permRate: "6.5",
  permYears: "30",
  contingency: "10"
};

const DEFAULT_DRAWS: Draw[] = [
  { month: 1, amount: 50000, label: "Land/Permits" },
  { month: 3, amount: 100000, label: "Foundation" },
  { month: 6, amount: 150000, label: "Framing" },
  { month: 9, amount: 100000, label: "Exterior/Roof" },
  { month: 12, amount: 100000, label: "Interior/Finish" },
];

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none">{suffix}</span>}
    </div>
  </div>
);

export default function ConstructionLoanDrawCalculator() {
  const [loanAmount, setLoanAmount] = useState(DEFAULTS.loanAmount);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [months, setMonths] = useState(DEFAULTS.months);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [permRate, setPermRate] = useState(DEFAULTS.permRate);
  const [permYears, setPermYears] = useState(DEFAULTS.permYears);
  const [contingency, setContingency] = useState(DEFAULTS.contingency);
  
  const [draws, setDraws] = useState<Draw[]>(DEFAULT_DRAWS);
  
  const [results, setResults] = useState<ConstructionResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateDraws(
      parseFloat(loanAmount) || 0,
      parseFloat(rate) || 0,
      parseInt(months) || 12,
      draws,
      parseFloat(permRate) || 0,
      parseInt(permYears) || 30,
      parseFloat(contingency) || 0
    ));
  };

  const handleReset = () => {
    setLoanAmount(DEFAULTS.loanAmount); setRate(DEFAULTS.rate); setMonths(DEFAULTS.months);
    setPermRate(DEFAULTS.permRate); setPermYears(DEFAULTS.permYears); setContingency(DEFAULTS.contingency);
    setDraws(DEFAULT_DRAWS); setShowAdvanced(false);
    setResults(calculateDraws(500000, 7.5, 12, DEFAULT_DRAWS, 6.5, 30, 10));
  };

  useEffect(() => { handleCalculate(); }, []);

  const addDraw = () => setDraws([...draws, { month: parseInt(months) || 12, amount: 0, label: "New Draw" }]);
  const removeDraw = (index: number) => setDraws(draws.filter((_, i) => i !== index));
  const updateDraw = (index: number, field: keyof Draw, value: string) => {
    const newDraws = [...draws];
    if (field === "month") newDraws[index].month = parseInt(value) || 1;
    else if (field === "amount") newDraws[index].amount = parseFloat(value) || 0;
    else newDraws[index].label = value;
    setDraws(newDraws);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Construction Loan Draw Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How does interest work on a construction loan?", answer: "Unlike a standard mortgage where you pay interest on the full amount from day one, construction loans only charge interest on the funds that have been 'drawn' (disbursed). Your payments will be very small at the beginning of the project and steadily increase as more money is drawn to pay the builders." },
    { question: "What is a draw schedule?", answer: "A draw schedule outlines exactly when funds will be released by the lender to the builder. These releases are tied to specific construction milestones (e.g., foundation poured, framing complete). The bank will typically send an inspector to verify the work before releasing each draw." },
    { question: "What happens when construction is finished?", answer: "Most modern construction loans are 'construction-to-permanent' loans (single close). Once the home is finished and a Certificate of Occupancy is issued, the interest-only construction loan automatically converts into a standard 15- or 30-year amortizing mortgage." },
    { question: "Do I need a contingency fund?", answer: "Yes, absolutely. Building a home almost always encounters unexpected costs, such as lumber price spikes or delays. Lenders typically require or recommend a 10% to 20% contingency buffer built into the total loan limit to absorb these cost overruns without stalling the project." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Real Estate", href: "/calculator#real-estate" }, { label: "Construction Loan Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Construction Loan Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <HardHat className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground m-0">Loan Basics</h2>
            </div>
            
            <CompactInput id="loan" label="Total Base Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rate" label="Interest Rate" value={rate} onChange={setRate} suffix="%" />
              <CompactInput id="months" label="Build Period" value={months} onChange={setMonths} suffix="mo" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="cont" label="Contingency Buffer" value={contingency} onChange={setContingency} suffix="%" />
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-2">Permanent Loan (Post-Build)</div>
                  <div className="grid grid-cols-2 gap-4">
                    <CompactInput id="prate" label="Permanent Rate" value={permRate} onChange={setPermRate} suffix="%" />
                    <CompactInput id="pyears" label="Permanent Term" value={permYears} onChange={setPermYears} suffix="yrs" />
                  </div>
                </div>
              )}
            </div>

            <hr className="border-border my-2" />
            
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground m-0">Draw Schedule</h2>
              </div>
              <button onClick={addDraw} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                <Plus className="h-3 w-3" /> Add Draw
              </button>
            </div>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {draws.map((draw, i) => (
                <div key={i} className="flex gap-2 items-end bg-secondary/20 p-3 rounded-lg border border-border">
                  <div className="w-14">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Mo</label>
                    <input type="number" value={draw.month} onChange={(e) => updateDraw(i, "month", e.target.value)} className="w-full bg-transparent border-b border-border text-sm focus:border-primary outline-none py-1" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Phase</label>
                    <input type="text" value={draw.label} onChange={(e) => updateDraw(i, "label", e.target.value)} className="w-full bg-transparent border-b border-border text-sm focus:border-primary outline-none py-1" />
                  </div>
                  <div className="w-24">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Amount</label>
                    <input type="number" value={draw.amount || ""} onChange={(e) => updateDraw(i, "amount", e.target.value)} className="w-full bg-transparent border-b border-border text-sm focus:border-primary outline-none py-1" />
                  </div>
                  <button onClick={() => removeDraw(i)} className="text-muted-foreground hover:text-red-500 transition-colors pb-1.5" aria-label="Remove Draw">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Total Interest During Build</div>
                  <div className="text-4xl font-bold text-primary tracking-tighter mb-2">
                    ${Math.round(results.totalInterestPaid).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Avg. Monthly Interest: ${Math.round(results.averageMonthlyInterest).toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {results.summaryStats.map((stat, i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""} ${i === 2 ? "max-sm:border-l-0 max-sm:border-t" : ""} ${i === 3 ? "max-sm:border-t" : ""}`}>
                      <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{stat.label}</div>
                      <div className="text-sm font-bold truncate">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[15px] py-3 px-3">{item.label}</td>
                            <td className={`text-[15px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {results.permanentMonthlyPI > 0 && (
                      <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center">
                        <span className="text-[13px] font-bold uppercase text-muted-foreground">Est. Permanent P&I</span>
                        <span className="text-lg font-bold text-primary">${Math.round(results.permanentMonthlyPI).toLocaleString()}/mo</span>
                      </div>
                    )}
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Accumulating Disbursed Balance</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={results.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorDis" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tickFormatter={(val) => `M${val}`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip formatter={(v: number, name: string) => [ `$${v.toLocaleString()}`, name === "disbursed" ? "Balance" : name ]} />
                        <Area type="monotone" dataKey="disbursed" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorDis)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-4 card-calculator !p-0 border border-border bg-card overflow-hidden">
                  <h3 className="text-base font-bold p-4 pb-2">Monthly Interest & Draw Schedule</h3>
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-secondary/50 border-b border-border">
                      <tr>
                        <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Mo</th>
                        <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Draw Amt</th>
                        <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Disbursed Bal</th>
                        <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Interest Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {results.monthlyData.map((row) => (
                        <tr key={row.month} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-2.5 px-3 font-semibold">{row.month}</td>
                          <td className="py-2.5 px-3 text-emerald-600">{row.drawAmount > 0 ? `+$${row.drawAmount.toLocaleString()}` : "-"}</td>
                          <td className="py-2.5 px-3">${row.disbursed.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right text-amber-600 font-bold">${Math.round(row.interest).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Construction Loan Draw Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">
                A construction loan draw calculator is a specialized financial modeling tool for homebuyers and real estate developers building a property from the ground up. Unlike a standard mortgage where the entire loan amount is handed over on closing day, construction loans are paid out in stages, called "draws", as the builder completes specific milestones. This calculator models exactly how these staggered payouts affect your monthly interest obligations, giving you a precise forecast of your holding costs during the build phase.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">How Construction Interest Works</h2>
              <p className="text-muted-foreground leading-relaxed">
                The core advantage of a construction loan is that you are only charged interest on the funds that have actually been disbursed to the builder, not the total loan limit. For example, if you have a $500,000 loan but have only drawn $50,000 to pour the foundation, your monthly interest payment is calculated solely on that $50,000. As construction progresses and more draws are taken to pay for framing, plumbing, and finishing, the disbursed balance grows, causing your monthly interest payments to steadily increase until the project is finished.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">
                The primary output of this calculator is the total interest paid during the build. This represents cash out-of-pocket that you must account for while simultaneously paying for your current living situation. The monthly interest schedule provides a month-by-month breakdown so you know exactly what your bill will look like as the project nears completion. The permanent loan projection estimates what your standard monthly Principal and Interest (P&I) payment will be once the home is finished and the construction loan converts to a standard mortgage.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
              <p className="text-muted-foreground leading-relaxed">
                The total loan amount sets the ceiling for your project budget. The interest rate on construction loans is typically variable and usually 1% to 2% higher than standard mortgage rates because the bank is lending against an unfinished asset. The build period dictates how long you will carry these interest-only payments. A faster build saves you thousands in interest, while weather delays or supply chain issues will drastically increase your holding costs.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">The Draw Schedule</h2>
              <p className="text-muted-foreground leading-relaxed">
                The custom draw schedule is the engine of this calculator. You can map out exactly when your builder expects to be paid based on your construction contract. A heavily front-loaded schedule (where the builder requires massive payments early for land or materials) will result in much higher total interest costs. A back-loaded schedule keeps your disbursed balance lower for longer, saving you significant money on interest.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
              <p className="text-muted-foreground leading-relaxed">
                Always include a 10% to 20% contingency buffer in your loan limit; construction projects almost universally run over budget due to material upgrades or unexpected site issues. Push your builder for a fair draw schedule that ties payments strictly to completed, verifiable milestones rather than upfront deposits. Finally, consider a "Single-Close" or "Construction-to-Permanent" loan, which automatically converts your construction loan into a 30-year mortgage upon completion, saving you thousands of dollars in duplicate closing costs.
              </p>
            </div>
          </section>
          
          <FAQSection faqs={[
            { question: "What is a draw schedule?", answer: "A draw schedule outlines exactly when funds will be released by the lender to the builder. These releases are tied to specific construction milestones (e.g., foundation poured, framing complete). The bank will typically send an inspector to verify the work before releasing each draw." },
            { question: "What happens when construction is finished?", answer: "Most modern construction loans are 'construction-to-permanent' loans (single close). Once the home is finished and a Certificate of Occupancy is issued, the interest-only construction loan automatically converts into a standard 15- or 30-year amortizing mortgage." },
            { question: "Do I need a contingency fund?", answer: "Yes, absolutely. Building a home almost always encounters unexpected costs, such as lumber price spikes or delays. Lenders typically require or recommend a 10% to 20% contingency buffer built into the total loan limit to absorb these cost overruns without stalling the project." }
          ]} pageUrl="https://racira.com/calculator/construction-loan-draw-calculator" />
          <PopularCalculators exclude="/calculator/construction-loan-draw-calculator" />
        </div>
      </div>
    </>
  );
}
