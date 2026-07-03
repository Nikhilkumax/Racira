"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Activity, Printer, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PerformanceResults {
  overallScore: number;
  tier: string;
  tierColor: string;
  chartData: { metric: string; score: number; weight: number; weightedScore: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; score: string; weight: string; contribution: string; isTotal?: boolean; colorClass?: string }[];
}

const calculatePerformance = (onTime: number, wOnTime: number, damageFree: number, wDamage: number, billing: number, wBilling: number, tender: number, wTender: number): PerformanceResults => {
  const totalWeight = wOnTime + wDamage + wBilling + wTender;
  
  // Normalize weights if they don't equal 100%
  const nW1 = totalWeight > 0 ? wOnTime / totalWeight : 0;
  const nW2 = totalWeight > 0 ? wDamage / totalWeight : 0;
  const nW3 = totalWeight > 0 ? wBilling / totalWeight : 0;
  const nW4 = totalWeight > 0 ? wTender / totalWeight : 0;

  const score1 = onTime * nW1;
  const score2 = damageFree * nW2;
  const score3 = billing * nW3;
  const score4 = tender * nW4;

  const overallScore = score1 + score2 + score3 + score4;

  let tier = "";
  let tierColor = "";
  if (overallScore >= 95) {
    tier = "Preferred Carrier (Tier 1)";
    tierColor = "text-emerald-500";
  } else if (overallScore >= 85) {
    tier = "Standard Carrier (Tier 2)";
    tierColor = "text-blue-500";
  } else if (overallScore >= 75) {
    tier = "Probationary (Tier 3)";
    tierColor = "text-amber-500";
  } else {
    tier = "Do Not Use (DNU)";
    tierColor = "text-red-500";
  }

  const chartData = [
    { metric: "On-Time", score: onTime, weight: nW1 * 100, weightedScore: score1 },
    { metric: "Damage-Free", score: damageFree, weight: nW2 * 100, weightedScore: score2 },
    { metric: "Tender Accept", score: tender, weight: nW4 * 100, weightedScore: score4 },
    { metric: "Billing Acc.", score: billing, weight: nW3 * 100, weightedScore: score3 },
  ];

  const summaryStats = [
    { label: "Overall Score", value: `${overallScore.toFixed(1)} / 100` },
    { label: "Carrier Status", value: tier.split(' ')[0] },
    { label: "Total Weights", value: `${totalWeight}%` },
    { label: "Lowest Metric", value: [...chartData].sort((a,b) => a.score - b.score)[0].metric },
  ];

  const breakdown = [
    { label: "On-Time Delivery", score: `${onTime.toFixed(1)}%`, weight: `${(nW1*100).toFixed(1)}%`, contribution: `+${score1.toFixed(2)} pts` },
    { label: "Damage-Free Claims", score: `${damageFree.toFixed(1)}%`, weight: `${(nW2*100).toFixed(1)}%`, contribution: `+${score2.toFixed(2)} pts` },
    { label: "Tender Acceptance", score: `${tender.toFixed(1)}%`, weight: `${(nW4*100).toFixed(1)}%`, contribution: `+${score4.toFixed(2)} pts` },
    { label: "Billing Accuracy", score: `${billing.toFixed(1)}%`, weight: `${(nW3*100).toFixed(1)}%`, contribution: `+${score3.toFixed(2)} pts` },
    { label: "Overall KPI Score", score: "-", weight: "100%", contribution: `${overallScore.toFixed(2)} pts`, isTotal: true, colorClass: "text-emerald-500 font-bold" },
  ];

  return { overallScore, tier, tierColor, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  onTime: "92", wOnTime: "40",
  damageFree: "99", wDamage: "30",
  tender: "85", wTender: "20",
  billing: "95", wBilling: "10",
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

export default function CarrierPerformanceScoreCalculator() {
  const [onTime, setOnTime] = useState(DEFAULTS.onTime);
  const [wOnTime, setWOnTime] = useState(DEFAULTS.wOnTime);
  
  const [damageFree, setDamageFree] = useState(DEFAULTS.damageFree);
  const [wDamage, setWDamage] = useState(DEFAULTS.wDamage);
  
  const [tender, setTender] = useState(DEFAULTS.tender);
  const [wTender, setWTender] = useState(DEFAULTS.wTender);
  
  const [billing, setBilling] = useState(DEFAULTS.billing);
  const [wBilling, setWBilling] = useState(DEFAULTS.wBilling);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<PerformanceResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculatePerformance(
      parseFloat(onTime) || 0, parseFloat(wOnTime) || 0,
      parseFloat(damageFree) || 0, parseFloat(wDamage) || 0,
      parseFloat(billing) || 0, parseFloat(wBilling) || 0,
      parseFloat(tender) || 0, parseFloat(wTender) || 0
    ));
  };

  const handleReset = () => {
    setOnTime(DEFAULTS.onTime); setWOnTime(DEFAULTS.wOnTime);
    setDamageFree(DEFAULTS.damageFree); setWDamage(DEFAULTS.wDamage);
    setTender(DEFAULTS.tender); setWTender(DEFAULTS.wTender);
    setBilling(DEFAULTS.billing); setWBilling(DEFAULTS.wBilling);
    setResults(calculatePerformance(92, 40, 99, 30, 95, 10, 85, 20));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Carrier Scorecard</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <p className="font-bold text-foreground mb-1">{payload[0].payload.metric}</p>
          <div className="text-muted-foreground flex justify-between gap-4">
            <span>Raw Score:</span>
            <span>{payload[0].payload.score.toFixed(1)}%</span>
          </div>
          <div className="text-muted-foreground flex justify-between gap-4">
            <span>Weight:</span>
            <span>{payload[0].payload.weight.toFixed(1)}%</span>
          </div>
          <div className="text-primary flex justify-between gap-4 font-bold border-t border-border mt-1 pt-1">
            <span>Contribution:</span>
            <span>{payload[0].value.toFixed(2)} pts</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Carrier Performance Score" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Carrier Performance Scorecard Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Carrier KPI Inputs</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="ontime" label="On-Time Delivery Rate" value={onTime} onChange={setOnTime} suffix="%" tooltip="Percentage of loads delivered by the required appointment time." />
              <CompactInput id="dmg" label="Damage-Free / Claim-Free Rate" value={damageFree} onChange={setDamageFree} suffix="%" tooltip="Percentage of loads delivered without freight damage or shortage claims." />
              <CompactInput id="tndr" label="Tender Acceptance Rate" value={tender} onChange={setTender} suffix="%" tooltip="Percentage of load tenders the carrier accepts versus rejects." />
              <CompactInput id="bill" label="Billing Accuracy Rate" value={billing} onChange={setBilling} suffix="%" tooltip="Percentage of invoices that match the contracted rate without disputes." />
            </div>
            
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-2 focus:outline-none">
                Adjust KPI Weights <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="w1" label="On-Time Weight" value={wOnTime} onChange={setWOnTime} suffix="%" />
                  <CompactInput id="w2" label="Damage Weight" value={wDamage} onChange={setWDamage} suffix="%" />
                  <CompactInput id="w3" label="Tender Weight" value={wTender} onChange={setWTender} suffix="%" />
                  <CompactInput id="w4" label="Billing Weight" value={wBilling} onChange={setWBilling} suffix="%" />
                  <div className="col-span-2 text-xs text-muted-foreground text-center">
                    Note: Weights are automatically normalized to 100% if they don't sum perfectly.
                  </div>
                </div>
              )}
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
                
                <div className={`border-l-4 rounded-lg p-5 relative bg-secondary/20 border-border`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    Overall Performance Score
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.tierColor}`}>
                    {results.overallScore.toFixed(1)} / 100
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Classification: <span className={`font-bold ${results.tierColor}`}>{results.tier}</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">KPI Metric</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Score</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Contrib.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.breakdown.map((item, idx) => (
                          <tr key={idx} className={item.isTotal ? "font-bold bg-secondary/20 border-t-2 border-border" : ""}>
                            <td className="text-[13px] py-3 px-3">
                              {item.label}
                              {!item.isTotal && <span className="block text-[10px] text-muted-foreground font-normal">Weight: {item.weight}</span>}
                            </td>
                            <td className="text-[13px] py-3 px-3 text-right text-muted-foreground">{item.score}</td>
                            <td className={`text-[13px] py-3 px-3 text-right ${item.colorClass || ""}`}>{item.contribution}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Weighted Score Contribution</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="metric" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                          <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                          <Bar dataKey="weightedScore" radius={[4, 4, 0, 0]}>
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                            ))}
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
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is a Carrier Performance Scorecard?</h2>
            <p>In logistics and supply chain management, simply choosing the cheapest freight carrier often results in terrible service. A <strong>Carrier Performance Scorecard</strong> is a quantitative tool used by procurement managers to evaluate their logistics partners based on multiple Key Performance Indicators (KPIs), rather than just cost.</p>
            
            <h3>The Core Metrics (KPIs)</h3>
            <p>A standard scorecard evaluates carriers across four primary dimensions:</p>
            <ul>
              <li><strong>On-Time Delivery Rate:</strong> The percentage of shipments that arrive by the scheduled appointment time. In modern just-in-time supply chains, this is usually the most heavily weighted metric. A rate below 90% is typically unacceptable.</li>
              <li><strong>Damage-Free (Claim-Free) Rate:</strong> Measures how carefully the carrier handles your freight. Frequent damage destroys customer relationships and creates massive administrative headaches fighting for claims.</li>
              <li><strong>Tender Acceptance Rate:</strong> When you offer (tender) a load to a contracted carrier at your agreed rate, do they accept it, or do they reject it to chase higher spot market rates? A low tender acceptance rate forces shippers onto the expensive spot market.</li>
              <li><strong>Billing Accuracy:</strong> Does the carrier's invoice match the agreed-upon rate? Inaccurate billing wastes hours of accounting time auditing freight bills.</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-3">How Weighted Scoring Works</h2>
            <p>Not all metrics are equally important. For a retailer shipping fragile electronics, the <em>Damage-Free Rate</em> might be weighted at 50%. For an automotive plant running an assembly line, the <em>On-Time Rate</em> might be weighted at 60%, because a late truck shuts down the factory.</p>
            <p>The calculator multiplies the raw score of each metric by its assigned weight to produce a "Contribution." The sum of these contributions yields the overall Performance Score out of 100.</p>
            
            <h2 className="text-2xl font-bold mb-3">Using the Scorecard for Continuous Improvement</h2>
            <p>Scorecards should be reviewed with carriers on a monthly or quarterly basis in a <em>Quarterly Business Review (QBR)</em>. Carriers who consistently achieve Tier 1 (Preferred) status are rewarded with more freight volume. Carriers who fall into Probationary status are placed on a corrective action plan; if scores do not improve, they are removed from the routing guide entirely (Do Not Use).</p>
          </article>
          <FAQSection faqs={[
            { question: "What is a good overall carrier score?", answer: "In most enterprise routing guides, a score of 95 or above is required to maintain 'Preferred' status. Scores between 85 and 94 are considered adequate but require improvement, while anything below 85 usually triggers a formal review." },
            { question: "How do I calculate the 'On-Time' metric fairly?", answer: "It is crucial to measure On-Time Delivery against the agreed appointment time, minus any delays caused by the shipper (e.g., if the shipper held the driver at the origin dock for 4 hours, the late delivery should not penalize the carrier)." },
            { question: "Why is Tender Acceptance so important?", answer: "Routing guides are useless if carriers don't honor them. If your primary carrier rejects a load, you must offer it to your backup carrier (who is usually more expensive), or go to the spot market (which is highly volatile). Low tender acceptance directly inflates your freight budget." },
          ]} pageUrl="https://racira.com/calculator/carrier-performance-score-calculator" />
          <PopularCalculators exclude="/calculator/carrier-performance-score-calculator" />
        </div>
      </div>
    </>
  );
}
