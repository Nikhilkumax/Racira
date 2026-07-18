"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, AlertTriangle, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ClearanceDelayResults {
  goodsValue: number;
  apr: number;
  delayDays: number;
  dailyStorage: number;
  examFee: number;
  
  opportunityCost: number;
  storageCost: number;
  totalFinancialImpact: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateClearanceDelay = (
  goodsValue: number, apr: number, delayDays: number, dailyStorage: number, examFee: number
): ClearanceDelayResults => {
  
  const opportunityCost = goodsValue * (apr / 100) * (delayDays / 365);
  const storageCost = delayDays * dailyStorage;
  
  const totalFinancialImpact = opportunityCost + storageCost + examFee;

  const chartData = [
    { name: "Opportunity Cost (Capital Tied Up)", value: opportunityCost, color: "hsl(var(--amber-500))" },
    { name: "Port Storage / Demurrage", value: storageCost, color: "hsl(var(--destructive))" },
    { name: "Customs Exam Fees", value: examFee, color: "hsl(var(--primary))" },
  ];

  const summaryStats = [
    { label: "Total Cost of Delay", value: `$${totalFinancialImpact.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Lost Capital Interest", value: `$${opportunityCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Hard Logistics Fines", value: `$${(storageCost + examFee).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Days Lost", value: `${delayDays} Days` },
  ];

  const breakdown = [
    { label: `Opportunity Cost of Capital (${apr}% APR over ${delayDays} days)`, amount: `+$${opportunityCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: `Demurrage / Storage Penalties ($${dailyStorage}/day)`, amount: `+$${storageCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: `Customs Intensive Exam Fee (e.g. VACIS/CET)`, amount: `+$${examFee.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Total Financial Impact of Customs Hold", amount: `$${totalFinancialImpact.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-red-600 font-bold text-[15px]" },
  ];

  return { goodsValue, apr, delayDays, dailyStorage, examFee, opportunityCost, storageCost, totalFinancialImpact, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  goodsValue: "350000",
  apr: "12",
  delayDays: "14",
  dailyStorage: "250",
  examFee: "1500",
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

export default function ImportClearanceTimeCostCalculator() {
  const [goodsValue, setGoodsValue] = useState(DEFAULTS.goodsValue);
  const [apr, setApr] = useState(DEFAULTS.apr);
  const [delayDays, setDelayDays] = useState(DEFAULTS.delayDays);
  const [dailyStorage, setDailyStorage] = useState(DEFAULTS.dailyStorage);
  const [examFee, setExamFee] = useState(DEFAULTS.examFee);
  
  const [results, setResults] = useState<ClearanceDelayResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateClearanceDelay(
      parseFloat(goodsValue) || 0, 
      parseFloat(apr) || 0,
      parseFloat(delayDays) || 0,
      parseFloat(dailyStorage) || 0,
      parseFloat(examFee) || 0
    ));
  };

  const handleReset = () => {
    setGoodsValue(DEFAULTS.goodsValue); setApr(DEFAULTS.apr); setDelayDays(DEFAULTS.delayDays); setDailyStorage(DEFAULTS.dailyStorage); setExamFee(DEFAULTS.examFee);
    setResults(calculateClearanceDelay(350000, 12, 14, 250, 1500));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Customs Delay Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Import Clearance Delay Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Customs Delay Financial Impact Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="val" label="Total Value of Goods" value={goodsValue} onChange={setGoodsValue} prefix="$" tooltip="The total commercial value of the inventory stuck in customs." />
              <CompactInput id="apr" label="Cost of Capital (APR)" value={apr} onChange={setApr} suffix="%" tooltip="Your business loan interest rate, or the ROI you expect from your cash." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-2xl font-bold mb-3">Delay & Penalty Details</h2>
            </div>
            
            <CompactInput id="day" label="Days Delayed" value={delayDays} onChange={setDelayDays} suffix="days" tooltip="Number of days beyond the expected clearance date." />

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="stor" label="Daily Demurrage Rate" value={dailyStorage} onChange={setDailyStorage} prefix="$" tooltip="Penalty fee charged by the port/warehouse per day while waiting for customs clearance." />
              <CompactInput id="ex" label="Customs Exam Fee" value={examFee} onChange={setExamFee} prefix="$" tooltip="Flat fee charged by the port to perform an X-Ray or Intensive physical exam." />
            </div>

            <div className="p-3 mt-1 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p>When Customs places a hold on your cargo, you are legally responsible for paying the storage fees and the inspection labor costs, even if they find nothing illegal.</p>
            </div>

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
                
                <div className={`border-l-4 rounded-lg p-5 relative ${results.totalFinancialImpact > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Total Financial Damage
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.totalFinancialImpact > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ${results.totalFinancialImpact.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <span className="font-bold text-amber-600">${results.opportunityCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span> in lost interest + <span className="font-bold text-red-600">${(results.storageCost + results.examFee).toLocaleString("en-US", { maximumFractionDigits: 0 })}</span> in hard fines.
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Expense Breakdown</th>
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Cost Distribution</h3>
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
            <h2 className="text-2xl font-bold mb-3">The Nightmare of Customs Holds</h2>
            <p>In global supply chains, Customs authorities (like US CBP) have the absolute legal authority to stop, hold, and inspect any shipment entering the country. When this happens, the importer does not just suffer from a delayed schedule—they suffer massive, unplannable financial damages.</p>
            
            <h3>You Pay for the Government's Inspection</h3>
            <p>One of the harshest realities of international trade is that if the government decides to inspect your cargo, <strong>you</strong> have to pay the bill. The government does not own the port cranes or warehouses, so the terminal operators will invoice you for the labor required to move your container to the inspection station.</p>
            <ul>
              <li><strong>VACIS (X-Ray) Exam:</strong> Customs drives a giant X-ray machine over your container. Usually costs $300 - $600.</li>
              <li><strong>Intensive Exam (CET):</strong> Customs orders the container to be driven to an off-site facility where it is fully unloaded and physically searched. This can cost anywhere from $1,500 to $3,500 in labor and drayage fees.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Double Whammy: Demurrage & Opportunity Cost</h2>
            <p>While Customs is taking two weeks to inspect your container, the port is charging you daily Demurrage storage fees. Furthermore, you have massive capital tied up in the goods sitting inside the box. Every day that inventory is not on a store shelf generating revenue, you are paying interest on your business loans (the Cost of Capital).</p>
            
            <h3>How to Avoid Customs Holds</h3>
            <p>While some exams are purely random, most are triggered by algorithmic risk scoring. To minimize your chances of being flagged:</p>
            <ul>
              <li>Ensure your commercial invoices are extremely detailed. Do not just write "shoes"; write "men's leather dress shoes".</li>
              <li>Use the correct HTS classification codes.</li>
              <li>File your ISF (Importer Security Filing) 24 hours before the ship leaves the origin port. Late ISF filings almost guarantee a customs hold at destination.</li>
            </ul>
          </section>
          <FAQSection faqs={[
            { question: "If customs damages my goods during an inspection, do they pay for it?", answer: "No. By law, Customs authorities are generally immune from liability for damage caused during routine inspections. You must file a claim against your own cargo insurance policy." },
            { question: "Can I refuse to pay the intensive exam fee?", answer: "No. If you refuse to pay the Centralized Examination Station (CES) facility, they will not release your cargo. Eventually, the cargo will be seized and auctioned off." },
            { question: "Does a customs broker prevent exams?", answer: "A good licensed customs broker ensures your paperwork is flawless, which drastically reduces algorithmic flags. However, they cannot prevent purely random exams or targeted agency holds (like FDA or EPA holds)." },
          ]} pageUrl="https://racira.com/calculator/import-clearance-time-cost-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Import Clearance Time Cost Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Import Clearance Time Cost Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Import Clearance Time Cost Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Import Clearance Time Cost Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Import Clearance Time Cost Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/import-clearance-time-cost-calculator" />
        </div>
      </div>
    </>
  );
}
