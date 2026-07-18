"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Snowflake, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ColdChainResults {
  baseFreight: number;
  reeferPremium: number;
  reeferCost: number;
  packaging: number;
  monitoring: number;
  compliance: number;
  
  totalColdPremium: number;
  totalFreightCost: number;
  premiumPercentage: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateColdChain = (
  baseFreight: number, reeferPremium: number, packaging: number, 
  monitoring: number, compliance: number
): ColdChainResults => {
  
  const reeferCost = baseFreight * (reeferPremium / 100);
  
  const totalColdPremium = reeferCost + packaging + monitoring + compliance;
  const totalFreightCost = baseFreight + totalColdPremium;
  
  const premiumPercentage = baseFreight > 0 ? (totalColdPremium / baseFreight) * 100 : 0;

  const chartData = [
    { name: "Standard Dry Freight", value: baseFreight, color: "hsl(var(--muted-foreground))" },
    { name: "Reefer/Temp Control Premium", value: reeferCost, color: "hsl(var(--blue-500))" },
    { name: "Insulation & Coolants", value: packaging, color: "hsl(var(--sky-400))" },
    { name: "Data Loggers & Monitoring", value: monitoring, color: "hsl(var(--indigo-500))" },
    { name: "Compliance / Audits", value: compliance, color: "hsl(var(--primary))" },
  ];

  const summaryStats = [
    { label: "Total Logistics Cost", value: `$${totalFreightCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Standard Base Freight", value: `$${baseFreight.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Cold Chain Premium", value: `+$${totalColdPremium.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Premium Markup %", value: `${premiumPercentage.toFixed(1)}%` },
  ];

  const breakdown = [
    { label: "Standard Dry Freight Rate", amount: `$${baseFreight.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: `Refrigerated Transport Premium (${reeferPremium}%)`, amount: `+$${reeferCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-500" },
    { label: "Thermal Packaging (Coolants, Insulation)", amount: `+$${packaging.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-500" },
    { label: "Active Monitoring (IoT Data Loggers)", amount: `+$${monitoring.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-500" },
    { label: "Quality Compliance & SOP Audits", amount: `+$${compliance.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-blue-500" },
    { label: "Total Cold Chain Surcharge", amount: `+$${totalColdPremium.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-blue-500 font-bold" },
    { label: "Total Fully-Burdened Logistics Cost", amount: `$${totalFreightCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-primary font-bold text-[15px]" },
  ];

  return { baseFreight, reeferPremium, reeferCost, packaging, monitoring, compliance, totalColdPremium, totalFreightCost, premiumPercentage, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  baseFreight: "3500",
  reeferPremium: "40",
  packaging: "450",
  monitoring: "120",
  compliance: "250",
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

export default function ColdChainComplianceCostCalculator() {
  const [baseFreight, setBaseFreight] = useState(DEFAULTS.baseFreight);
  const [reeferPremium, setReeferPremium] = useState(DEFAULTS.reeferPremium);
  const [packaging, setPackaging] = useState(DEFAULTS.packaging);
  const [monitoring, setMonitoring] = useState(DEFAULTS.monitoring);
  const [compliance, setCompliance] = useState(DEFAULTS.compliance);
  
  const [results, setResults] = useState<ColdChainResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateColdChain(
      parseFloat(baseFreight) || 0, 
      parseFloat(reeferPremium) || 0,
      parseFloat(packaging) || 0,
      parseFloat(monitoring) || 0,
      parseFloat(compliance) || 0
    ));
  };

  const handleReset = () => {
    setBaseFreight(DEFAULTS.baseFreight); setReeferPremium(DEFAULTS.reeferPremium); setPackaging(DEFAULTS.packaging); setMonitoring(DEFAULTS.monitoring); setCompliance(DEFAULTS.compliance);
    setResults(calculateColdChain(3500, 40, 450, 120, 250));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Cold Chain Logistics Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Cold Chain Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cold Chain Compliance Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Snowflake className="h-5 w-5 text-blue-500" />
              <h2 className="text-2xl font-bold mb-3">Thermal Logistics Pricing</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="base" label="Standard Dry Freight" value={baseFreight} onChange={setBaseFreight} prefix="$" tooltip="The cost to ship this cargo if it did not require temperature control." />
              <CompactInput id="rpm" label="Reefer / Temp Premium" value={reeferPremium} onChange={setReeferPremium} suffix="%" tooltip="The percentage markup charged by the carrier to use a refrigerated (reefer) truck or container." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="pkg" label="Thermal Packaging" value={packaging} onChange={setPackaging} prefix="$" tooltip="Cost of dry ice, phase change materials (PCMs), gel packs, and insulated pallet shippers." />
              <CompactInput id="mon" label="IoT Data Loggers" value={monitoring} onChange={setMonitoring} prefix="$" tooltip="Cost of active temperature monitoring devices placed inside the shipment." />
            </div>

            <div className="border-t border-border my-1"></div>

            <CompactInput id="comp" label="Compliance & Audits" value={compliance} onChange={setCompliance} prefix="$" tooltip="Cost of GDP (Good Distribution Practice) certification, SOP generation, or 3rd party temperature mapping audits." />

            <div className="p-3 mt-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p>Extracts the "Cold Chain Premium" to show exactly how much extra money is being spent purely to maintain temperature integrity.</p>
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
                
                <div className={`grid grid-cols-2 gap-4`}>
                  <div className="rounded-lg p-5 relative bg-primary/10 border-l-4 border-primary">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Total Logistics Cost</div>
                    <div className="text-3xl font-bold tracking-tighter mb-2 text-primary">
                      ${results.totalFreightCost.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="rounded-lg p-5 relative bg-blue-500/10 border-l-4 border-blue-500">
                    <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-blue-600 transition-colors print:hidden" aria-label="Print Results">
                      <Printer className="h-4 w-4" />
                    </button>
                    <div className="text-xs uppercase tracking-wide text-blue-600/70 mb-1 font-bold">Cold Chain Premium</div>
                    <div className="text-3xl font-bold tracking-tighter mb-2 text-blue-600">
                      +${results.totalColdPremium.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Logistics Breakdown</th>
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Freight vs Premium Surcharges</h3>
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
            <h2 className="text-2xl font-bold mb-3">What is Cold Chain Logistics?</h2>
            <p><strong>Cold Chain Logistics</strong> refers to the highly specialized supply chain processes used to transport temperature-sensitive products. This is most commonly required for pharmaceuticals (vaccines, biologics), fresh agriculture, and perishable foods.</p>
            <p>Unlike shipping dry goods like t-shirts or electronics, a single temperature excursion (e.g., a truck turning off its refrigeration unit for 2 hours) can instantly ruin a $2,000,000 shipment of medicine. Because of this extreme risk, cold chain shipping is drastically more expensive than standard freight.</p>
            
            <h3>The Hidden Costs of Cold Chain Compliance</h3>
            <p>If a standard dry truck costs $3,500, a refrigerated ("reefer") truck might cost $4,900. But the freight cost is only the beginning. True cold chain compliance requires:</p>
            <ul>
              <li><strong>Active Thermal Packaging:</strong> Pallet shippers with specialized foam and phase-change materials (PCMs) that can hold a steady 2-8°C for 96 hours.</li>
              <li><strong>IoT Data Loggers:</strong> Digital thermometers placed inside the boxes that track GPS location and temperature every 15 minutes, transmitting the data to the cloud.</li>
              <li><strong>GDP Compliance Audits:</strong> In the pharmaceutical industry, Good Distribution Practice (GDP) requires companies to map the temperature of their warehouses and run dummy shipments to prove their packaging actually works.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Active vs Passive Cold Chain</h2>
            <p>There are two primary ways to move cold goods:</p>
            <ul>
              <li><strong>Active Systems:</strong> Using machines with active compressors (like a Reefer ocean container or a plugged-in Envirotainer for air freight). Highly reliable, but very expensive to lease and transport.</li>
              <li><strong>Passive Systems:</strong> Using highly advanced coolers filled with dry ice or gel packs, shipped on standard dry trucks or airplanes. Cheaper on freight, but the packaging materials themselves can cost hundreds of dollars per pallet.</li>
            </ul>
          </section>
          <FAQSection faqs={[
            { question: "What happens if a shipment goes out of temperature range?", answer: "In the pharmaceutical industry, this is called a 'Temperature Excursion'. The product is immediately quarantined. A Quality Assurance team will review the data logger to see exactly how high the temperature spiked and for how long. If it exceeds the stability budget, the entire shipment is destroyed." },
            { question: "Is Cold Chain insurance more expensive?", answer: "Yes. Marine/Cargo insurance for cold chain goods usually requires a specialized 'Spoilage Rider' which significantly increases the premium, as the risk of a total loss is much higher than standard freight." },
            { question: "What is Phase Change Material (PCM)?", answer: "PCMs are specialized engineered liquids that are designed to freeze and melt at very specific temperatures (e.g., exactly 5°C) to absorb heat and keep vaccines perfectly chilled inside a passive cooler for days at a time." },
          ]} pageUrl="https://racira.com/calculator/cold-chain-compliance-cost-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Cold Chain Compliance Cost Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Cold Chain Compliance Cost Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Cold Chain Compliance Cost Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Cold Chain Compliance Cost Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Cold Chain Compliance Cost Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/cold-chain-compliance-cost-calculator" />
        </div>
      </div>
    </>
  );
}
