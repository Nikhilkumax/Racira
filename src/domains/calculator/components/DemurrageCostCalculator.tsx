"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Ship, Printer, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DemurrageResults {
  containers: number;
  totalDays: number;
  freeDays: number;
  
  tier1Cost: number;
  tier2Cost: number;
  tier3Cost: number;
  
  tier1DaysUsed: number;
  tier2DaysUsed: number;
  tier3DaysUsed: number;

  totalDemurrage: number;
  
  chartData: { day: number; label: string; dailyCost: number; cumulativeCost: number; isFree: boolean; tier: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateTieredDemurrage = (
  containers: number, totalDays: number, freeDays: number, 
  t1Rate: number, t1Length: number,
  t2Rate: number, t2Length: number,
  t3Rate: number
): DemurrageResults => {
  
  let tier1DaysUsed = 0;
  let tier2DaysUsed = 0;
  let tier3DaysUsed = 0;

  let tier1Cost = 0;
  let tier2Cost = 0;
  let tier3Cost = 0;

  const chartData = [];
  let cumulativeCost = 0;

  for (let day = 1; day <= totalDays; day++) {
    let dailyCost = 0;
    let isFree = false;
    let tier = 0;

    if (day <= freeDays) {
      isFree = true;
      dailyCost = 0;
    } else {
      const penaltyDay = day - freeDays;
      
      if (penaltyDay <= t1Length) {
        tier1DaysUsed++;
        dailyCost = t1Rate * containers;
        tier1Cost += dailyCost;
        tier = 1;
      } else if (penaltyDay <= t1Length + t2Length) {
        tier2DaysUsed++;
        dailyCost = t2Rate * containers;
        tier2Cost += dailyCost;
        tier = 2;
      } else {
        tier3DaysUsed++;
        dailyCost = t3Rate * containers;
        tier3Cost += dailyCost;
        tier = 3;
      }
    }

    cumulativeCost += dailyCost;
    chartData.push({
      day,
      label: `Day ${day}`,
      dailyCost,
      cumulativeCost,
      isFree,
      tier
    });
  }

  const totalDemurrage = tier1Cost + tier2Cost + tier3Cost;

  const summaryStats = [
    { label: "Total Demurrage Fine", value: `$${totalDemurrage.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Penalty Days Accrued", value: (tier1DaysUsed + tier2DaysUsed + tier3DaysUsed).toString() },
    { label: "Max Tier Reached", value: tier3DaysUsed > 0 ? "Tier 3 (Severe)" : tier2DaysUsed > 0 ? "Tier 2 (High)" : tier1DaysUsed > 0 ? "Tier 1 (Base)" : "None (Free)" },
    { label: "Containers Impounded", value: containers.toString() },
  ];

  const breakdown = [
    { label: `Free Time [${freeDays} Days]`, amount: `$0.00`, colorClass: "text-emerald-600" },
    { label: `Tier 1 Penalty [${tier1DaysUsed} Days × $${t1Rate} × ${containers}]`, amount: `+$${tier1Cost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: tier1Cost > 0 ? "text-amber-500" : "text-muted-foreground" },
    { label: `Tier 2 Penalty [${tier2DaysUsed} Days × $${t2Rate} × ${containers}]`, amount: `+$${tier2Cost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: tier2Cost > 0 ? "text-red-500" : "text-muted-foreground" },
    { label: `Tier 3 Penalty [${tier3DaysUsed} Days × $${t3Rate} × ${containers}]`, amount: `+$${tier3Cost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: tier3Cost > 0 ? "text-red-700 font-bold" : "text-muted-foreground" },
    { label: "Total Demurrage Fine", amount: `$${totalDemurrage.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: totalDemurrage > 0 ? "text-red-600 font-bold text-[15px]" : "text-emerald-600 font-bold text-[15px]" },
  ];

  return { containers, totalDays, freeDays, tier1Cost, tier2Cost, tier3Cost, tier1DaysUsed, tier2DaysUsed, tier3DaysUsed, totalDemurrage, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  containers: "5",
  totalDays: "14",
  freeDays: "4",
  t1Rate: "150",
  t1Length: "3", // Days 5, 6, 7
  t2Rate: "300",
  t2Length: "4", // Days 8, 9, 10, 11
  t3Rate: "500", // Days 12+
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

export default function DemurrageCostCalculator() {
  const [containers, setContainers] = useState(DEFAULTS.containers);
  const [totalDays, setTotalDays] = useState(DEFAULTS.totalDays);
  const [freeDays, setFreeDays] = useState(DEFAULTS.freeDays);
  
  const [t1Rate, setT1Rate] = useState(DEFAULTS.t1Rate);
  const [t1Length, setT1Length] = useState(DEFAULTS.t1Length);
  const [t2Rate, setT2Rate] = useState(DEFAULTS.t2Rate);
  const [t2Length, setT2Length] = useState(DEFAULTS.t2Length);
  const [t3Rate, setT3Rate] = useState(DEFAULTS.t3Rate);
  
  const [results, setResults] = useState<DemurrageResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateTieredDemurrage(
      parseFloat(containers) || 0, parseFloat(totalDays) || 0, parseFloat(freeDays) || 0,
      parseFloat(t1Rate) || 0, parseFloat(t1Length) || 0,
      parseFloat(t2Rate) || 0, parseFloat(t2Length) || 0,
      parseFloat(t3Rate) || 0
    ));
  };

  const handleReset = () => {
    setContainers(DEFAULTS.containers); setTotalDays(DEFAULTS.totalDays); setFreeDays(DEFAULTS.freeDays);
    setT1Rate(DEFAULTS.t1Rate); setT1Length(DEFAULTS.t1Length); setT2Rate(DEFAULTS.t2Rate); setT2Length(DEFAULTS.t2Length); setT3Rate(DEFAULTS.t3Rate);
    setResults(calculateTieredDemurrage(5, 14, 4, 150, 3, 300, 4, 500));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Tiered Demurrage Fines</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-sm text-xs font-semibold">
          <p className="mb-2 text-foreground font-bold border-b border-border pb-1">{data.label}</p>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-muted-foreground">Status:</span>
            <span style={{ color: payload[0].fill }}>
              {data.isFree ? "Free Time" : `Tier ${data.tier} Penalty`}
            </span>
          </div>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-muted-foreground">Daily Charge:</span>
            <span className="text-foreground">${data.dailyCost.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
          </div>
          <div className="flex justify-between gap-4 mb-1 border-t border-border mt-2 pt-2">
            <span className="text-muted-foreground">Cumulative Fine:</span>
            <span className="text-red-500 font-bold">${data.cumulativeCost.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Tiered Demurrage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Escalating Tiered Demurrage Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="cnt" label="Total Containers" value={containers} onChange={setContainers} tooltip="Number of containers stuck at the port." />
              <CompactInput id="tday" label="Total Days at Port" value={totalDays} onChange={setTotalDays} tooltip="Total calendar days the containers sat at the terminal." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Ship className="h-5 w-5 text-red-500" />
              <h2 className="text-2xl font-bold mb-3">Port Penalty Tariff</h2>
            </div>
            
            <CompactInput id="free" label="Free Days Allowed" value={freeDays} onChange={setFreeDays} suffix="days" tooltip="Number of days the port allows you to store the container for free." />

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="t1r" label="Tier 1 Rate" value={t1Rate} onChange={setT1Rate} prefix="$" suffix="/day" tooltip="The daily penalty rate for the first phase of delay." />
              <CompactInput id="t1l" label="Tier 1 Length" value={t1Length} onChange={setT1Length} suffix="days" tooltip="How many days Tier 1 lasts before escalating to Tier 2." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="t2r" label="Tier 2 Rate" value={t2Rate} onChange={setT2Rate} prefix="$" suffix="/day" tooltip="The escalated daily penalty rate." />
              <CompactInput id="t2l" label="Tier 2 Length" value={t2Length} onChange={setT2Length} suffix="days" tooltip="How many days Tier 2 lasts before escalating to Tier 3." />
            </div>

            <CompactInput id="t3r" label="Tier 3 Rate (Max)" value={t3Rate} onChange={setT3Rate} prefix="$" suffix="/day" tooltip="The maximum punitive rate applied to all remaining days." />

            <div className="p-3 mt-1 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p>Models the aggressive escalating fee structures used by major ports (like LA/Long Beach) to aggressively punish importers who abandon containers on the dock.</p>
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
                
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Total Demurrage Fine (All Containers)
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.totalDemurrage > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ${results.totalDemurrage.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  {results.totalDemurrage > 0 ? (
                    <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                      Accrued over <span className="font-bold text-red-600">{results.totalDays - results.freeDays} penalty days</span>.
                    </div>
                  ) : (
                    <div className="text-sm text-emerald-600 font-bold flex items-center gap-2">
                      Picked up within Free Time. No penalties!
                    </div>
                  )}
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Demurrage Tier</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Daily Fine Escalation</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `Day ${val}`} />
                          <YAxis hide />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          
                          <Bar dataKey="dailyCost" radius={[4, 4, 0, 0]}>
                            {results.chartData.map((entry, index) => {
                              let color = "hsl(var(--emerald-500))"; // Free
                              if (entry.tier === 1) color = "hsl(var(--amber-500))";
                              if (entry.tier === 2) color = "hsl(var(--orange-500))";
                              if (entry.tier === 3) color = "hsl(var(--red-600))";
                              return <Cell key={`cell-${index}`} fill={color} />;
                            })}
                          </Bar>
                        </BarChart>
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
            <h2 className="text-2xl font-bold mb-3">What is Tiered Demurrage?</h2>
            <p><strong>Port Demurrage</strong> is the penalty fee charged by a marine terminal when you fail to pick up your container within the allotted "Free Time" window. Because ports have limited physical space on the dock, they use demurrage as a weapon to force importers to quickly remove their cargo.</p>
            
            <h3>The Danger of Tiered Escalation</h3>
            <p>Major global ports (like Los Angeles, Long Beach, or Rotterdam) do not charge a flat daily penalty. Instead, they use <strong>Escalating Tiers</strong>.</p>
            <p>For example, if you leave a container for 14 days, you do not just pay $150 a day. You might pay $150 for the first few days, then the port raises the rate to $300 a day to encourage you to hurry up. If you still do not pick it up, they will escalate to a punitive "Tier 3" rate of $500+ per day.</p>
            <p>This is why a logistics delay caused by a paperwork error or a trucking shortage can result in a $20,000 fine accumulating in just a matter of two weeks.</p>

            <h2 className="text-2xl font-bold mb-3">Can You Abandon a Container to Avoid Fees?</h2>
            <p>No. If the accumulated demurrage fees exceed the actual value of the goods inside the container (which happens frequently with cheap goods like plastic toys or scrap metal), an importer might be tempted to simply abandon the cargo and ignore the port's phone calls.</p>
            <p>However, you cannot escape the bill. As the "Importer of Record," you signed a contract with the ocean carrier. The carrier will place a lien on your company, send you to collections, and potentially ban you from ever shipping with them again. The port will eventually auction off your cargo to recoup the storage fees, but you are still legally liable for the difference.</p>
          </section>
          <FAQSection faqs={[
            { question: "Are weekends included in Demurrage calculation?", answer: "Usually, yes. While 'Free Time' sometimes excludes weekends depending on the specific port tariff, once the container enters penalty status (Demurrage), ports almost always charge you for Saturdays and Sundays." },
            { question: "What causes a container to get stuck in Demurrage?", answer: "The most common reasons are: 1) Customs holds or intensive exams (CBP X-Ray). 2) Missing or incorrect import paperwork (e.g., missing Bill of Lading). 3) A severe shortage of truck drivers or chassis at the destination port." },
            { question: "Who collects the Demurrage fee?", answer: "Technically, the Terminal Operator (the company running the physical dock) charges it. However, they usually bill the Ocean Carrier, who then passes the invoice directly onto you (the importer)." },
          ]} pageUrl="https://racira.com/calculator/demurrage-cost-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Demurrage Cost Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Demurrage Cost Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Demurrage Cost Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Demurrage Cost Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Demurrage Cost Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/demurrage-cost-calculator" />
        </div>
      </div>
    </>
  );
}
