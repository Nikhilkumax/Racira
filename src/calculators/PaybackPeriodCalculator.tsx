"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Hourglass, PlusCircle, Trash2 } from "lucide-react";
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

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

interface CashFlow { id: number; year: number; amount: string; }

export default function PaybackPeriodCalculator() {
  const [initialInv, setInitialInv] = useState("50000");
  const [flowType, setFlowType] = useState<"constant" | "uneven">("constant");
  const [constantFlow, setConstantFlow] = useState("12000");
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([
    { id: 1, year: 1, amount: "10000" },
    { id: 2, year: 2, amount: "15000" },
    { id: 3, year: 3, amount: "18000" },
    { id: 4, year: 4, amount: "20000" },
    { id: 5, year: 5, amount: "25000" },
  ]);
  const [res, setRes] = useState<{ paybackPeriod: number; chartData: { name: string; value: number }[] } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const inv = parseFloat(initialInv) || 0;
    let pb = 0;
    const chartData: { name: string; value: number }[] = [];

    if (flowType === "constant") {
      const flow = parseFloat(constantFlow) || 0;
      if (flow > 0) {
        pb = inv / flow;
        const yearsLimit = Math.ceil(pb) + 2;
        let cumulative = -inv;
        for (let i = 1; i <= yearsLimit; i++) {
          cumulative += flow;
          chartData.push({ name: `Year ${i}`, value: cumulative });
        }
      }
    } else {
      let cumulative = -inv;
      let found = false;
      
      for (let i = 0; i < cashFlows.length; i++) {
        const cf = parseFloat(cashFlows[i].amount) || 0;
        const prevCumulative = cumulative;
        cumulative += cf;
        chartData.push({ name: `Year ${cashFlows[i].year}`, value: cumulative });

        if (!found && cumulative >= 0) {
          const fraction = cf > 0 ? Math.abs(prevCumulative) / cf : 0;
          pb = i + fraction;
          found = true;
        }
      }

      if (!found) {
        pb = -1; // Never pays back within input range
      }
    }

    setRes({ paybackPeriod: pb, chartData });
  };

  const addFlow = () => {
    const nextYear = cashFlows.length > 0 ? Math.max(...cashFlows.map(c => c.year)) + 1 : 1;
    setCashFlows([...cashFlows, { id: Date.now(), year: nextYear, amount: "15000" }]);
  };
  
  const removeFlow = (id: number) => setCashFlows(cashFlows.filter(c => c.id !== id));
  
  const updateFlow = (id: number, field: "year" | "amount", value: string) =>
    setCashFlows(cashFlows.map(c => c.id === id ? { ...c, [field]: value } : c));

  const reset = () => {
    setInitialInv("50000");
    setFlowType("constant");
    setConstantFlow("12000");
    setCashFlows([
      { id: 1, year: 1, amount: "10000" },
      { id: 2, year: 2, amount: "15000" },
      { id: 3, year: 3, amount: "18000" },
      { id: 4, year: 4, amount: "20000" },
      { id: 5, year: 5, amount: "25000" },
    ]);
  };

  const faqs = [
    { question: "What is payback period?", answer: "The payback period is the time required to recover the cost of an investment. It is a simple metric used to evaluate risk — a shorter payback period means you recoup your money faster, reducing exposure to risk. The basic formula for constant cash flows is: Payback Period = Initial Investment ÷ Annual Cash Flow." },
    { question: "How do you calculate payback period for uneven cash flows?", answer: "For uneven cash flows, you calculate the cumulative cash flow year-by-year until it reaches zero or becomes positive. Payback Period = Year before full recovery + (Remaining balance to recover at start of year ÷ Cash flow during the recovery year)." },
    { question: "What are the limitations of the payback period?", answer: "The payback period has two major limitations: it ignores the time value of money, and it ignores all cash flows that occur after the payback point is reached. A project that pays back in 2 years but makes nothing else is ranked higher than a project that pays back in 3 years and generates millions thereafter." },
    { question: "What is the discounted payback period?", answer: "The discounted payback period addresses the time value of money limitation by discounting future cash flows back to present value using a discount rate before performing the payback calculation. This results in a longer, more realistic payback period." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Payback Period Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Payback Period Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Investment Details</h2>
            
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-foreground">Cash Flow Type</span>
              <div className="flex rounded-md border border-border overflow-hidden">
                {(["constant", "uneven"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFlowType(t)} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${flowType === t ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-secondary"}`}>
                    {t === "constant" ? "Constant" : "Uneven"}
                  </button>
                ))}
              </div>
            </div>

            <CompactInput id="inv" label="Initial Investment" value={initialInv} onChange={setInitialInv} prefix="$" />

            {flowType === "constant" ? (
              <CompactInput id="flow" label="Expected Annual Cash Flow" value={constantFlow} onChange={setConstantFlow} prefix="$" />
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Cash Flows by Year</span>
                  <button type="button" onClick={addFlow} className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                    <PlusCircle className="h-3.5 w-3.5" /> Add Year
                  </button>
                </div>
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                  {cashFlows.map(cf => (
                    <div key={cf.id} className="grid grid-cols-[60px_1fr_32px] gap-2 items-center">
                      <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm">
                        <span className="pl-2 text-xs text-muted-foreground shrink-0">Yr</span>
                        <input type="number" value={cf.year} onChange={e => updateFlow(cf.id, "year", e.target.value)} className="w-full h-full px-1 text-sm bg-transparent outline-none border-none text-foreground" min={1} />
                      </div>
                      <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm">
                        <span className="pl-2 text-sm text-muted-foreground shrink-0">$</span>
                        <input type="number" value={cf.amount} onChange={e => updateFlow(cf.id, "amount", e.target.value)} className="w-full h-full px-2 text-sm bg-transparent outline-none border-none text-foreground" />
                      </div>
                      <button type="button" onClick={() => removeFlow(cf.id)} className="h-9 w-8 flex items-center justify-center rounded-md border border-border hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  <h2 className="text-2xl font-bold mb-3">Results</h2>
                  <Hourglass className="h-5 w-5 text-primary" />
                </div>
                <div className={`bg-gradient-to-br border rounded-xl p-5 text-center ${res.paybackPeriod >= 0 ? "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 animate-fade-in" : "from-red-500/10 to-red-500/5 border-red-500/20"}`}>
                  <div className="text-[13px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">Payback Period</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                    {res.paybackPeriod >= 0 ? `${res.paybackPeriod.toFixed(2)} Years` : "Does Not Recoup"}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {res.paybackPeriod >= 0 ? "Investment is successfully recovered." : "Cumulative cash flows are negative within entered range."}
                  </div>
                </div>
                {res.paybackPeriod >= 0 && mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Cumulative Net Cash Flow</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v.toLocaleString()}`} />
                        <Tooltip formatter={(v: any) => fmt(v)} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
          <article className="prose-finance text-[15.75px]">
            <h2>What is the Payback Period?</h2>
            <p>The payback period is the length of time required for an investment to generate enough cash flow to recover its initial cost. It is one of the oldest and simplest capital budgeting methods used by businesses to evaluate potential capital expenditures and investments.</p>
            <p>Because the payback period measures the time to recoup capital, it serves as a proxy for risk. Shorter payback periods are generally preferred because they free up cash quickly for other investments and reduce the period of time during which the investment is exposed to market, political, or technological obsolescence risks.</p>
            
            <h2>How to Calculate Payback Period</h2>
            <p>When cash flows are constant year after year, the calculation is simple:</p>
            <p><code>Payback Period = Initial Investment ÷ Annual Cash Flow</code></p>
            <p>For example, if a project costs $50,000 to implement and generates $12,000 per year, the payback period is <code>$50,000 ÷ $12,000 = 4.17 years</code>.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/payback-period-calculator" />
          <PopularCalculators exclude="/calculator/payback-period-calculator" />
        </div>
      </div>
    </>
  );
}
