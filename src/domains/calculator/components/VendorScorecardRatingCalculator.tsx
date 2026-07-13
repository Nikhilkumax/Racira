"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, ShieldAlert, Printer, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface VendorResults {
  overallScore: number;
  tier: string;
  tierColor: string;
  chartData: { metric: string; score: number; weight: number; weightedScore: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; score: string; weight: string; contribution: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateVendor = (
  quality: number, wQuality: number, 
  delivery: number, wDelivery: number, 
  cost: number, wCost: number, 
  service: number, wService: number
): VendorResults => {
  const totalWeight = wQuality + wDelivery + wCost + wService;
  
  // Normalize weights if they don't equal 100%
  const nW1 = totalWeight > 0 ? wQuality / totalWeight : 0;
  const nW2 = totalWeight > 0 ? wDelivery / totalWeight : 0;
  const nW3 = totalWeight > 0 ? wCost / totalWeight : 0;
  const nW4 = totalWeight > 0 ? wService / totalWeight : 0;

  const score1 = quality * nW1;
  const score2 = delivery * nW2;
  const score3 = cost * nW3;
  const score4 = service * nW4;

  const overallScore = score1 + score2 + score3 + score4;

  let tier = "";
  let tierColor = "";
  if (overallScore >= 90) {
    tier = "Strategic Partner";
    tierColor = "text-emerald-500";
  } else if (overallScore >= 80) {
    tier = "Approved Vendor";
    tierColor = "text-blue-500";
  } else if (overallScore >= 70) {
    tier = "Conditional (Review)";
    tierColor = "text-amber-500";
  } else {
    tier = "Disqualified (Phase Out)";
    tierColor = "text-red-500";
  }

  const chartData = [
    { metric: "Quality", score: quality, weight: nW1 * 100, weightedScore: score1 },
    { metric: "Delivery", score: delivery, weight: nW2 * 100, weightedScore: score2 },
    { metric: "Cost Value", score: cost, weight: nW3 * 100, weightedScore: score3 },
    { metric: "Service", score: service, weight: nW4 * 100, weightedScore: score4 },
  ];

  const summaryStats = [
    { label: "Overall Score", value: `${overallScore.toFixed(1)} / 100` },
    { label: "Vendor Tier", value: tier.split(' ')[0] },
    { label: "Total Weights", value: `${totalWeight}%` },
    { label: "Weakest Area", value: [...chartData].sort((a,b) => a.score - b.score)[0].metric },
  ];

  const breakdown = [
    { label: "Quality (Defect-Free Rate)", score: `${quality.toFixed(1)}%`, weight: `${(nW1*100).toFixed(1)}%`, contribution: `+${score1.toFixed(2)} pts` },
    { label: "Delivery (On-Time in Full)", score: `${delivery.toFixed(1)}%`, weight: `${(nW2*100).toFixed(1)}%`, contribution: `+${score2.toFixed(2)} pts` },
    { label: "Cost Competitiveness Index", score: `${cost.toFixed(1)}`, weight: `${(nW3*100).toFixed(1)}%`, contribution: `+${score3.toFixed(2)} pts` },
    { label: "Service & Communication", score: `${service.toFixed(1)}`, weight: `${(nW4*100).toFixed(1)}%`, contribution: `+${score4.toFixed(2)} pts` },
    { label: "Overall Score", score: "-", weight: "100%", contribution: `${overallScore.toFixed(2)} pts`, isTotal: true, colorClass: "text-emerald-500 font-bold" },
  ];

  return { overallScore, tier, tierColor, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  quality: "98", wQuality: "40",
  delivery: "95", wDelivery: "30",
  cost: "85", wCost: "20",
  service: "90", wService: "10",
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

export default function VendorScorecardRatingCalculator() {
  const [quality, setQuality] = useState(DEFAULTS.quality);
  const [wQuality, setWQuality] = useState(DEFAULTS.wQuality);
  
  const [delivery, setDelivery] = useState(DEFAULTS.delivery);
  const [wDelivery, setWDelivery] = useState(DEFAULTS.wDelivery);
  
  const [cost, setCost] = useState(DEFAULTS.cost);
  const [wCost, setWCost] = useState(DEFAULTS.wCost);
  
  const [service, setService] = useState(DEFAULTS.service);
  const [wService, setWService] = useState(DEFAULTS.wService);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<VendorResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateVendor(
      parseFloat(quality) || 0, parseFloat(wQuality) || 0,
      parseFloat(delivery) || 0, parseFloat(wDelivery) || 0,
      parseFloat(cost) || 0, parseFloat(wCost) || 0,
      parseFloat(service) || 0, parseFloat(wService) || 0
    ));
  };

  const handleReset = () => {
    setQuality(DEFAULTS.quality); setWQuality(DEFAULTS.wQuality);
    setDelivery(DEFAULTS.delivery); setWDelivery(DEFAULTS.wDelivery);
    setCost(DEFAULTS.cost); setWCost(DEFAULTS.wCost);
    setService(DEFAULTS.service); setWService(DEFAULTS.wService);
    setResults(calculateVendor(98, 40, 95, 30, 85, 20, 90, 10));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Vendor Scorecard</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
            <span>{payload[0].payload.score.toFixed(1)} / 100</span>
          </div>
          <div className="text-primary flex justify-between gap-4 font-bold border-t border-border mt-1 pt-1">
            <span>Points Earned:</span>
            <span>{payload[0].value.toFixed(2)} pts</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Vendor Scorecard Rating" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Vendor Scorecard Rating Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Supplier Evaluation (0-100)</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="qual" label="Quality Rate" value={quality} onChange={setQuality} suffix="/ 100" tooltip="Percentage of parts received that pass inspection without defects." />
              <CompactInput id="del" label="Delivery Rate (OTIF)" value={delivery} onChange={setDelivery} suffix="/ 100" tooltip="On-Time In-Full (OTIF) rate. Did they deliver exactly what was ordered, on time?" />
              <CompactInput id="cost" label="Cost Competitiveness" value={cost} onChange={setCost} suffix="/ 100" tooltip="Subjective or index-based score (1-100) on how their pricing compares to market rates." />
              <CompactInput id="srv" label="Service & Communication" value={service} onChange={setService} suffix="/ 100" tooltip="Subjective score (1-100) on responsiveness, technical support, and ease of doing business." />
            </div>
            
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-2 focus:outline-none">
                Adjust Evaluation Weights <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <CompactInput id="w1" label="Quality Weight" value={wQuality} onChange={setWQuality} suffix="%" />
                  <CompactInput id="w2" label="Delivery Weight" value={wDelivery} onChange={setWDelivery} suffix="%" />
                  <CompactInput id="w3" label="Cost Weight" value={wCost} onChange={setWCost} suffix="%" />
                  <CompactInput id="w4" label="Service Weight" value={wService} onChange={setWService} suffix="%" />
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
                    Total Vendor Score
                  </div>
                  <div className={`text-4xl font-bold tracking-tighter mb-2 ${results.tierColor}`}>
                    {results.overallScore.toFixed(1)} / 100
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Vendor Status: <span className={`font-bold ${results.tierColor}`}>{results.tier}</span>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Evaluation Area</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Score</th>
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Points</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">Score Contribution by Metric</h3>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What is a Vendor Scorecard?</h2>
            <p>A <strong>Vendor Scorecard</strong> is a systematic tool used by procurement and supply chain teams to evaluate the performance of their suppliers over a specific period (usually monthly or quarterly). By assigning objective scores and weights to different performance categories, companies can manage supplier relationships based on data rather than emotion.</p>
            
            <h3>The Four Pillars of Supplier Performance</h3>
            <p>While scorecards can be highly customized, most industries use these four pillars:</p>
            <ol>
              <li><strong>Quality (Defect-Free Rate):</strong> The most critical metric for manufacturers. If a vendor sends 1,000 parts and 20 fail quality control inspection, their quality rate is 98%. High defect rates halt production lines and create massive rework costs.</li>
              <li><strong>Delivery (On-Time In-Full):</strong> Often abbreviated as OTIF. Did the supplier deliver on the promised date? Did they send the full quantity ordered, or was it a partial shipment? Late deliveries can shut down factories.</li>
              <li><strong>Cost Competitiveness:</strong> While procurement shouldn't buy on price alone, vendors must remain competitive. This score evaluates whether the vendor is offering fair market pricing, honoring negotiated discounts, and proactively finding cost-saving opportunities.</li>
              <li><strong>Service & Communication:</strong> A subjective metric measuring responsiveness. When a crisis happens, does the vendor answer the phone? Do they provide proactive updates on delays? Do they offer engineering support?</li>
            </ol>
            
            <h2 className="text-2xl font-bold mb-3">Interpreting Vendor Tiers</h2>
            <p>Once the weighted score is calculated, the vendor is placed into a tier that dictates how your business interacts with them:</p>
            <ul>
              <li><strong>Strategic Partners (90-100):</strong> Your best suppliers. You should aim to give them more business, integrate them into your new product development, and sign long-term contracts.</li>
              <li><strong>Approved Vendors (80-89):</strong> Reliable suppliers that meet expectations. They receive standard order allocations but may need to improve specific areas to gain more volume.</li>
              <li><strong>Conditional (70-79):</strong> These vendors are struggling. Procurement should issue a formal Corrective Action Request (CAR) and place them on probation until performance improves.</li>
              <li><strong>Disqualified (Below 70):</strong> Vendors causing active harm to your operations. Procurement should begin phasing them out and sourcing alternative suppliers immediately.</li>
            </ul>
          </section>
          <FAQSection faqs={[
            { question: "Why not just buy from the cheapest vendor?", answer: "The 'cheapest' vendor often has hidden costs. If a cheap vendor has a 90% quality rate and delivers late 20% of the time, the costs of factory downtime, scrap, and expedited freight will vastly exceed the pennies saved on the initial purchase price." },
            { question: "How should I weight the categories?", answer: "Weights should reflect your company's strategic priorities. If you manufacture aerospace parts, Quality should likely be weighted at 60%. If you sell low-margin commodities, Cost might be weighted at 40%." },
            { question: "Should I share the scorecard with the vendor?", answer: "Absolutely. The primary purpose of a scorecard is to drive continuous improvement. Presenting the scorecard during a Quarterly Business Review (QBR) sets clear expectations and gives the vendor a roadmap for how to earn more of your business." },
          ]} pageUrl="https://racira.com/calculator/vendor-scorecard-rating-calculator" />
          <PopularCalculators exclude="/calculator/vendor-scorecard-rating-calculator" />
        </div>
      </div>
    </>
  );
}
