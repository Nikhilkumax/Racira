"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Wrench, Printer } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TMBudgetResults {
  laborCost: number;
  materialsCost: number;
  subsCost: number;
  baseCost: number;
  markupAmount: number;
  totalBudget: number;
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateTMBudget = (hours: number, rate: number, materials: number, subs: number, markupPct: number): TMBudgetResults => {
  const laborCost = hours * rate;
  const baseCost = laborCost + materials + subs;
  
  const markupAmount = baseCost * (markupPct / 100);
  const totalBudget = baseCost + markupAmount;

  const chartData = [
    { name: "Direct Labor", value: laborCost, color: "hsl(var(--primary))" },
    { name: "Materials", value: materials, color: "hsl(var(--chart-2))" },
    { name: "Subcontractors", value: subs, color: "hsl(var(--amber-500))" },
    { name: "Markup / Margin", value: markupAmount, color: "hsl(var(--emerald-500))" },
  ];

  const summaryStats = [
    { label: "Total Estimated Budget", value: `$${totalBudget.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Base Cost (Hard Costs)", value: `$${baseCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Labor Cost", value: `$${laborCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Markup Amount", value: `$${markupAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: "Labor (Hours × Rate)", amount: `$${laborCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Materials & Supplies", amount: `$${materials.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Subcontractor Fees", amount: `$${subs.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Subtotal (Base Hard Costs)", amount: `$${baseCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true },
    { label: `Markup / Contingency (${markupPct}%)`, amount: `+$${markupAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-emerald-500" },
    { label: "Total Estimated Budget", amount: `$${totalBudget.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-primary font-bold text-[15px]" },
  ];

  return { laborCost, materialsCost: materials, subsCost: subs, baseCost, markupAmount, totalBudget, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  hours: "350",
  rate: "65",
  materials: "12500",
  subs: "4000",
  markupPct: "20"
};

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

export default function TimeAndMaterialsBudgetCalculator() {
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [materials, setMaterials] = useState(DEFAULTS.materials);
  const [subs, setSubs] = useState(DEFAULTS.subs);
  const [markupPct, setMarkupPct] = useState(DEFAULTS.markupPct);
  
  const [results, setResults] = useState<TMBudgetResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateTMBudget(
      parseFloat(hours) || 0, 
      parseFloat(rate) || 0,
      parseFloat(materials) || 0,
      parseFloat(subs) || 0,
      parseFloat(markupPct) || 0
    ));
  };

  const handleReset = () => {
    setHours(DEFAULTS.hours); setRate(DEFAULTS.rate); setMaterials(DEFAULTS.materials); setSubs(DEFAULTS.subs); setMarkupPct(DEFAULTS.markupPct);
    setResults(calculateTMBudget(350, 65, 12500, 4000, 20));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>T&M Budget Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.name}:</span>
          <span className="text-foreground">${payload[0].value.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Time and Materials Budget" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Time and Materials (T&M) Budget Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Project Scope</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="hrs" label="Est. Labor Hours" value={hours} onChange={setHours} suffix="hrs" tooltip="Total estimated hours required to complete the project." />
              <CompactInput id="rate" label="Avg Hourly Rate" value={rate} onChange={setRate} prefix="$" tooltip="Blended or average hourly rate billed for labor." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="mat" label="Estimated Materials Cost" value={materials} onChange={setMaterials} prefix="$" tooltip="Direct cost of physical materials, hardware, or software required." />
              <CompactInput id="sub" label="Subcontractor Fees (Optional)" value={subs} onChange={setSubs} prefix="$" tooltip="Cost of external vendors or sub-contractors." />
            </div>

            <div className="border-t border-border my-1"></div>

            <CompactInput id="mark" label="Markup / Contingency Margin" value={markupPct} onChange={setMarkupPct} suffix="%" tooltip="Percentage added to base costs for profit margin or risk contingency (typically 15% to 30%)." />

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={handleCalculate} className="h-10 w-full flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center transition-colors shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors shrink-0" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {results && (
              <div ref={printRef} className="flex flex-col gap-4">
                
                <div className={`border-l-4 rounded-lg p-5 relative bg-primary/10 border-primary/30`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Total Estimated Budget
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 text-primary`}>
                    ${results.totalBudget.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Includes <span className="font-bold text-foreground">${results.baseCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span> in base hard costs.
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Estimate Breakdown</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[13px] py-3 px-3">{item.label}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Budget Allocation</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={results.chartData.filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {results.chartData.filter(d => d.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="racira-page-container mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is a Time and Materials (T&M) Contract?</h2>
            <p>In project management and construction, a <strong>Time and Materials (T&M)</strong> contract is an arrangement where the client agrees to pay the contractor based on the exact hours worked (Time) and the actual cost of supplies (Materials), rather than paying a flat, fixed price for the entire project.</p>
            <p>T&M contracts are highly common in software development, construction, legal services, and general consulting where the full scope of work is difficult to accurately predict upfront.</p>
            
            <h3>Fixed Price vs. Time and Materials</h3>
            <ul>
              <li><strong>Fixed Price (Lump Sum):</strong> The contractor says "I will build this app for exactly $50,000." If it takes them 500 hours, they make a great profit. If it takes 2,000 hours, the contractor takes a massive loss. The risk is entirely on the contractor.</li>
              <li><strong>Time and Materials:</strong> The contractor says "I will build this app for $150 per hour, plus the cost of software licenses." If the client requests changes, the price naturally scales. The risk is entirely on the client, as the final budget is not strictly capped.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Why Apply a Markup?</h2>
            <p>In standard T&M contracts, contractors do not simply pass through the exact cost of materials. They apply a <strong>Markup</strong> (often 10% to 25%). This markup covers un-billable overhead expenses related to procuring the materials:</p>
            <ul>
              <li>The time spent sourcing and negotiating with vendors.</li>
              <li>The cost of shipping, handling, and storage.</li>
              <li>The financial risk and carrying cost of purchasing materials upfront on company credit before the client pays the invoice.</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-3">Setting a "Not To Exceed" (NTE) Limit</h2>
            <p>Because T&M contracts pose a risk of runaway budgets for clients, it is standard practice to include a <strong>Not To Exceed (NTE)</strong> clause. This acts as a hybrid approach: the client pays hourly, but the total budget is hard-capped (e.g., "Billed at $150/hr, not to exceed $60,000 without written authorization").</p>
          </section>
          <FAQSection faqs={[
            { question: "Should my labor rate include overhead?", answer: "Yes. When calculating a T&M budget, the 'Avg Hourly Rate' should not be what you actually pay your employee (e.g., $30/hr). It should be your 'Fully Loaded Billed Rate' (e.g., $100/hr) which covers the employee's salary, benefits, office rent, software, and company profit." },
            { question: "Are subcontractor fees considered Time or Materials?", answer: "Subcontractor fees are generally treated as Materials (or pass-through expenses). You take the total invoice from the subcontractor and apply your standard material markup before billing the client." },
            { question: "What happens if a T&M project finishes early?", answer: "The client saves money! This is the primary benefit of T&M for a client. If they budget for 500 hours and you finish in 400, they only pay for 400 hours." },
          ]} pageUrl="https://racira.com/calculator/time-and-materials-budget-calculator" />
          <PopularCalculators exclude="/calculator/time-and-materials-budget-calculator" />
        </div>
      </div>
    </>
  );
}
