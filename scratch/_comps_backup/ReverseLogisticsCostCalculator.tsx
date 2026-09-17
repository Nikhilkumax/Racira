"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, ArrowLeftRight, Printer, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface ReverseResults {
  outboundCost: number;
  reverseMultiplier: number;
  returnVolume: number;
  handlingFee: number;
  customerFee: number;
  
  unitReverseFreight: number;
  unitTotalCost: number;
  
  totalReverseFreight: number;
  totalHandling: number;
  totalGrossCost: number;
  totalRecovery: number;
  totalNetLoss: number;
  
  chartData: { name: string; outbound: number; reverse: number }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateReverse = (
  outboundCost: number, reverseMultiplier: number, 
  returnVolume: number, handlingFee: number, customerFee: number
): ReverseResults => {
  
  const unitReverseFreight = outboundCost * reverseMultiplier;
  const unitTotalCost = unitReverseFreight + handlingFee;
  
  const totalReverseFreight = unitReverseFreight * returnVolume;
  const totalHandling = handlingFee * returnVolume;
  
  const totalGrossCost = totalReverseFreight + totalHandling;
  const totalRecovery = customerFee * returnVolume;
  
  const totalNetLoss = Math.max(0, totalGrossCost - totalRecovery);

  const chartData = [
    { name: "Freight Comparison", outbound: outboundCost, reverse: unitReverseFreight },
  ];

  const summaryStats = [
    { label: "Net Loss Per Return", value: `$${Math.max(0, unitTotalCost - customerFee).toFixed(2)}` },
    { label: "Total Net Financial Loss", value: `$${totalNetLoss.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Gross Cost", value: `$${totalGrossCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Customer Recovery", value: `$${totalRecovery.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const breakdown = [
    { label: `Total Reverse Freight (${returnVolume} units × $${unitReverseFreight.toFixed(2)})`, amount: `$${totalReverseFreight.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-red-600" },
    { label: `Total 3PL / Handling Fees (${returnVolume} units × $${handlingFee.toFixed(2)})`, amount: `$${totalHandling.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: `Gross Reverse Logistics Expense`, amount: `$${totalGrossCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold" },
    { label: `Less: Customer Return Fees Recovered`, amount: `-$${totalRecovery.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-emerald-600 font-bold" },
    { label: `Total Net Supply Chain Loss`, amount: `$${totalNetLoss.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-red-600 font-bold text-[15px]" },
  ];

  return { outboundCost, reverseMultiplier, returnVolume, handlingFee, customerFee, unitReverseFreight, unitTotalCost, totalReverseFreight, totalHandling, totalGrossCost, totalRecovery, totalNetLoss, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  outboundCost: "8.50",
  reverseMultiplier: "2.5",
  returnVolume: "1200",
  handlingFee: "3.25",
  customerFee: "5.99",
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

export default function ReverseLogisticsCostCalculator() {
  const [outboundCost, setOutboundCost] = useState(DEFAULTS.outboundCost);
  const [reverseMultiplier, setReverseMultiplier] = useState(DEFAULTS.reverseMultiplier);
  const [returnVolume, setReturnVolume] = useState(DEFAULTS.returnVolume);
  const [handlingFee, setHandlingFee] = useState(DEFAULTS.handlingFee);
  const [customerFee, setCustomerFee] = useState(DEFAULTS.customerFee);
  
  const [results, setResults] = useState<ReverseResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateReverse(
      parseFloat(outboundCost) || 0, parseFloat(reverseMultiplier) || 0,
      parseFloat(returnVolume) || 0, parseFloat(handlingFee) || 0,
      parseFloat(customerFee) || 0
    ));
  };

  const handleReset = () => {
    setOutboundCost(DEFAULTS.outboundCost); setReverseMultiplier(DEFAULTS.reverseMultiplier);
    setReturnVolume(DEFAULTS.returnVolume); setHandlingFee(DEFAULTS.handlingFee);
    setCustomerFee(DEFAULTS.customerFee);
    setResults(calculateReverse(8.50, 2.5, 1200, 3.25, 5.99));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Reverse Logistics Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-sm text-xs font-semibold">
          <p className="mb-2 text-foreground font-bold border-b border-border pb-1">Unit Freight Cost Comparison</p>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-muted-foreground">Outbound Freight:</span>
            <span style={{ color: payload[0].fill }}>${payload[0].value.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
          </div>
          <div className="flex justify-between gap-4 mb-1">
            <span className="text-muted-foreground font-bold">Reverse Freight:</span>
            <span style={{ color: payload[1].fill }} className="font-bold">${payload[1].value.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Reverse Logistics Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Reverse Logistics Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex items-center gap-2 mb-1">
              <ArrowLeftRight className="h-5 w-5 text-red-500" />
              <h2 className="text-2xl font-bold mb-3">Freight Assymetry</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="out" label="Outbound Unit Cost" value={outboundCost} onChange={setOutboundCost} prefix="$" tooltip="How much it originally cost to ship the item to the customer." />
              <CompactInput id="mul" label="Reverse Multiplier" value={reverseMultiplier} onChange={setReverseMultiplier} suffix="x" tooltip="Reverse freight is usually 2x to 3x more expensive than outbound." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <ArrowLeftRight className="h-5 w-5 text-amber-500" />
              <h2 className="text-2xl font-bold mb-3">Volume & Handling</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="vol" label="Monthly Returns" value={returnVolume} onChange={setReturnVolume} tooltip="Total number of items sent back per month." />
              <CompactInput id="hnd" label="3PL Handling Fee" value={handlingFee} onChange={setHandlingFee} prefix="$" tooltip="The flat fee the warehouse charges you just to receive the return box." />
            </div>

            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <ArrowLeftRight className="h-5 w-5 text-emerald-500" />
              <h2 className="text-2xl font-bold mb-3">Cost Recovery</h2>
            </div>

            <CompactInput id="fee" label="Customer Return Fee" value={customerFee} onChange={setCustomerFee} prefix="$" tooltip="Amount deducted from the customer's refund to subsidize the shipping label (e.g., $5.99)." />

            <div className="p-3 mt-1 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p>Because outbound freight is highly consolidated on pallets, it is cheap. Reverse freight is un-consolidated (single boxes from residential addresses) and is massively more expensive.</p>
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
                    Total Monthly Net Loss
                  </div>
                  <div className="text-4xl font-bold tracking-tighter mb-2 text-red-600">
                    ${results.totalNetLoss.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Total Gross Reverse Logistics Cost was <span className="font-bold text-foreground">${results.totalGrossCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>.
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
                          <th className="p-3 text-xs font-bold uppercase text-muted-foreground tracking-wider">Logistics Flow Breakdown</th>
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
                    <h3 className="text-sm font-bold mb-4 w-full text-left">The Asymmetry of Freight</h3>
                    {mounted && (
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" hide />
                          <Tooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<CustomTooltip />} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                          
                          <Bar dataKey="outbound" name="Outbound Cost" stackId="a" fill="hsl(var(--blue-500))" radius={[0, 0, 0, 0]} barSize={40} />
                          <Bar dataKey="reverse" name="Reverse Cost" stackId="a" fill="hsl(var(--red-500))" radius={[0, 4, 4, 0]} barSize={40} />
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
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Reverse Logistics</h2>
            <p>Reverse Logistics is often the most misunderstood and incorrectly budgeted part of a supply chain. Executives often assume that if it costs $8.50 to ship an item to a customer, it will cost $8.50 to ship it back. <strong>This is completely false.</strong></p>
            
            <h3>Why Reverse Freight is So Expensive</h3>
            <p>When you ship <strong>Outbound</strong>, you are shipping from a commercial warehouse. The carrier backs a 53-foot trailer up to your loading dock, and you load 5,000 packages into it in 20 minutes. You get a massive commercial discount because the freight is highly consolidated.</p>
            <p>When a customer returns an item (<strong>Reverse</strong>), they drop it off at a random UPS store, or a driver has to drive a massive diesel truck to their residential driveway just to pick up a single 2-pound box. This lack of consolidation means reverse freight routinely costs <strong>2x to 3x more</strong> than outbound freight.</p>

            <h2 className="text-2xl font-bold mb-3">Cost Recovery and "Free Returns"</h2>
            <p>For a decade, Amazon forced the e-commerce industry to offer "Free Returns." In 2023, the math became so unsustainable that major brands (Zara, H&M, Abercrombie) started charging a return fee (usually $5.99 to $7.99) deducted from the refund.</p>
            <p>This calculator demonstrates why. If your reverse freight cost is $21.25 per item, and you don't charge a return fee, you are subsidizing that entire loss out of your corporate profits. Charging a $5.99 fee doesn't cover the whole cost, but it acts as a critical subsidy to prevent severe financial bleeding.</p>
          </section>
          <FAQSection faqs={[
            { question: "What is a 3PL Handling Fee?", answer: "Third-Party Logistics (3PL) warehouses charge a 'receiving fee' for returns. It takes significantly more labor to open a used box, inspect the item, and decide if it can be restocked than it does to ship a new item." },
            { question: "Can I use 'Returnless Refunds'?", answer: "Yes, and it is highly recommended for low-ticket items. If an item costs you $4 to manufacture, and the reverse freight + handling costs $15, you should issue the customer a refund and tell them to keep the item. You instantly save $11." },
            { question: "Is Reverse Logistics just returns?", answer: "No. It also includes recycling (e.g., taking back old electronics), core charges in auto parts (returning a broken alternator), and managing reusable packaging (like plastic totes)." },
          ]} pageUrl="https://racira.com/calculator/reverse-logistics-cost-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Reverse Logistics Cost Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Reverse Logistics Cost Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Reverse Logistics Cost Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Reverse Logistics Cost Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Reverse Logistics Cost Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/reverse-logistics-cost-calculator" />
        </div>
      </div>
    </>
  );
}
