"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { LazyView } from "@/components/ui/LazyView";

interface MovingCostInputs {
  distance: number;
  bedrooms: number;
  moveStyle: "diy" | "hybrid" | "full";
  moveMonth: string;
  packingService: boolean;
  insuranceValue: number;
  autoTransport: boolean;
  storageMonths: number;
}

interface MovingCostResults {
  totalCost: number;
  baseTransportation: number;
  laborCost: number;
  packingCost: number;
  insuranceCost: number;
  autoCost: number;
  storageCost: number;
  chartData: { category: string; cost: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateMovingCost = (inputs: MovingCostInputs): MovingCostResults => {
  const { distance, bedrooms, moveStyle, moveMonth, packingService, insuranceValue, autoTransport, storageMonths } = inputs;
  
  // Base constants
  const weightPerRoom = 1000; // lbs per room roughly
  const estimatedWeight = bedrooms * weightPerRoom + 1500; // base weight for living areas
  
  // Seasonality multiplier
  const peakMonths = ["May", "Jun", "Jul", "Aug", "Sep"];
  const seasonalityMultiplier = peakMonths.includes(moveMonth) ? 1.25 : 1.0;

  let baseTransportation = 0;
  let laborCost = 0;
  let packingCost = 0;
  let insuranceCost = (insuranceValue / 1000) * 10; // $10 per $1000 valuation
  let autoCost = autoTransport ? (distance * 1.10) : 0; // $1.10 per mile for auto transport
  let storageCost = storageMonths > 0 ? (storageMonths * 200 * bedrooms) : 0;

  if (moveStyle === "diy") {
    // Truck rental + gas + minimal supplies
    const truckRentalBase = 150 + (distance * 0.79);
    const gas = (distance / 10) * 3.50; // assuming 10mpg at $3.50/gal
    baseTransportation = (truckRentalBase + gas) * seasonalityMultiplier;
    laborCost = 0;
    packingCost = packingService ? (bedrooms * 150) : (bedrooms * 50); // Just supplies if no service
  } else if (moveStyle === "hybrid") {
    // Truck rental + hired loading/unloading
    const truckRentalBase = 150 + (distance * 0.79);
    const gas = (distance / 10) * 3.50;
    baseTransportation = (truckRentalBase + gas) * seasonalityMultiplier;
    laborCost = bedrooms * 200 * seasonalityMultiplier; // Labor for loading/unloading
    packingCost = packingService ? (bedrooms * 200) : (bedrooms * 50);
  } else {
    // Full service interstate or local
    if (distance < 50) {
      // Local move is usually hourly
      const hours = 4 + (bedrooms * 2);
      laborCost = hours * 150 * seasonalityMultiplier;
      baseTransportation = 200; // travel fee
    } else {
      // Long distance is by weight and distance
      baseTransportation = (estimatedWeight * 0.50 + distance * 0.80) * seasonalityMultiplier;
      laborCost = (estimatedWeight * 0.20) * seasonalityMultiplier;
    }
    packingCost = packingService ? (bedrooms * 300) : (bedrooms * 50);
  }

  const totalCost = baseTransportation + laborCost + packingCost + insuranceCost + autoCost + storageCost;

  const chartData = [
    { category: "Transport", cost: Math.round(baseTransportation), color: "hsl(var(--primary))" },
    { category: "Labor", cost: Math.round(laborCost), color: "#3b82f6" },
    { category: "Packing", cost: Math.round(packingCost), color: "#10b981" },
    { category: "Extras", cost: Math.round(insuranceCost + autoCost + storageCost), color: "#8b5cf6" },
  ].filter(d => d.cost > 0);

  const summaryStats = [
    { label: "Move Distance", value: `${distance} miles` },
    { label: "Est. Weight", value: `${estimatedWeight.toLocaleString()} lbs` },
    { label: "Seasonality", value: peakMonths.includes(moveMonth) ? "Peak (+25%)" : "Off-Peak" },
    { label: "Move Style", value: moveStyle.toUpperCase() },
  ];

  const breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[] = [
    { label: "Transportation (Truck/Fuel)", amount: `$${baseTransportation.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Labor (Movers)", amount: `$${laborCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Packing (Supplies/Service)", amount: `$${packingCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Insurance Valuation", amount: `$${insuranceCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  if (autoCost > 0) breakdown.push({ label: "Auto Transport", amount: `$${autoCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` });
  if (storageCost > 0) breakdown.push({ label: "Storage", amount: `$${storageCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` });
  
  breakdown.push({ label: "Total Estimated Cost", amount: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, isTotal: true, colorClass: "text-primary" });

  return {
    totalCost, baseTransportation, laborCost, packingCost, insuranceCost, autoCost, storageCost, chartData, summaryStats, breakdown
  };
};

const DEFAULTS = { distance: "500", bedrooms: "3", moveStyle: "full" as const, packingService: false, insuranceValue: "10000", autoTransport: false, storageMonths: "0" };

export default function MovingCostEstimator() {
  const currentMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][new Date().getMonth()];
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [bedrooms, setBedrooms] = useState(DEFAULTS.bedrooms);
  const [moveStyle, setMoveStyle] = useState<"diy" | "hybrid" | "full">(DEFAULTS.moveStyle);
  const [moveMonth, setMoveMonth] = useState(currentMonth);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [packingService, setPackingService] = useState(DEFAULTS.packingService);
  const [insuranceValue, setInsuranceValue] = useState(DEFAULTS.insuranceValue);
  const [autoTransport, setAutoTransport] = useState(DEFAULTS.autoTransport);
  const [storageMonths, setStorageMonths] = useState(DEFAULTS.storageMonths);

  const [results, setResults] = useState<MovingCostResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateMovingCost({
      distance: parseFloat(distance) || 0,
      bedrooms: parseInt(bedrooms) || 1,
      moveStyle,
      moveMonth,
      packingService,
      insuranceValue: parseFloat(insuranceValue) || 0,
      autoTransport,
      storageMonths: parseInt(storageMonths) || 0
    }));
  };

  const handleReset = () => {
    setDistance(DEFAULTS.distance); setBedrooms(DEFAULTS.bedrooms); setMoveStyle(DEFAULTS.moveStyle); setMoveMonth(currentMonth);
    setPackingService(DEFAULTS.packingService); setInsuranceValue(DEFAULTS.insuranceValue); setAutoTransport(DEFAULTS.autoTransport); setStorageMonths(DEFAULTS.storageMonths);
    setShowAdvanced(false);
    setResults(calculateMovingCost({ distance: parseFloat(DEFAULTS.distance), bedrooms: parseInt(DEFAULTS.bedrooms), moveStyle: DEFAULTS.moveStyle, moveMonth: currentMonth, packingService: DEFAULTS.packingService, insuranceValue: parseFloat(DEFAULTS.insuranceValue), autoTransport: DEFAULTS.autoTransport, storageMonths: parseInt(DEFAULTS.storageMonths) }));
  };

  useEffect(() => { handleCalculate(); }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Moving Cost Estimate</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-2 rounded-lg shadow-sm text-xs font-semibold">
          <span className="text-muted-foreground mr-2">{payload[0].payload.category}:</span>
          <span className="text-foreground">${payload[0].value.toLocaleString()}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Moving Cost Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Moving Cost Estimator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Move Distance</label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
                  <span className="pr-3 text-sm text-muted-foreground select-none pointer-events-none">miles</span>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Home Size</label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
                  <span className="pr-3 text-sm text-muted-foreground select-none pointer-events-none">beds</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-1.5">Moving Style</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full shadow-sm">
                <button type="button" onClick={() => setMoveStyle("diy")} className={`flex-1 text-xs sm:text-sm font-semibold transition-colors ${moveStyle === "diy" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>DIY</button>
                <button type="button" onClick={() => setMoveStyle("hybrid")} className={`flex-1 text-xs sm:text-sm font-semibold transition-colors border-l border-input ${moveStyle === "hybrid" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Hybrid</button>
                <button type="button" onClick={() => setMoveStyle("full")} className={`flex-1 text-xs sm:text-sm font-semibold transition-colors border-l border-input ${moveStyle === "full" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Full Service</button>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground mb-1.5">Move Month (Seasonality)</label>
              <select value={moveMonth} onChange={(e) => setMoveMonth(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 outline-none">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none">
                Professional Mode <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="grid grid-cols-1 gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="checkbox" checked={packingService} onChange={(e) => setPackingService(e.target.checked)} className="rounded border-input text-primary focus:ring-primary/20 h-4 w-4" />
                    Include Packing Service
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="checkbox" checked={autoTransport} onChange={(e) => setAutoTransport(e.target.checked)} className="rounded border-input text-primary focus:ring-primary/20 h-4 w-4" />
                    Add Auto Transport
                  </label>
                  
                  <div className="flex flex-col mt-2">
                    <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Insurance Valuation</label>
                    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm">
                      <span className="pl-3 pr-1 text-sm text-muted-foreground">$</span>
                      <input type="number" value={insuranceValue} onChange={(e) => setInsuranceValue(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Storage Needed</label>
                    <div className="relative w-full flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm">
                      <input type="number" value={storageMonths} onChange={(e) => setStorageMonths(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
                      <span className="pr-3 text-sm text-muted-foreground select-none">months</span>
                    </div>
                  </div>
                </div>
              )}
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Estimated Moving Cost</div>
                  <div className="text-4xl font-bold text-primary tracking-tighter mb-2">
                    ${results.totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    This is an estimate for a {bedrooms}-bedroom {moveStyle.toUpperCase()} move over {distance} miles.
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
                          <th className="p-3 text-right text-xs font-bold uppercase text-muted-foreground tracking-wider">Cost</th>
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
                  </div>

                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[250px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Cost Distribution</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }} />
                        <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Moving Cost Estimator?</h2>
              <p className="text-muted-foreground leading-relaxed">
                A moving cost estimator is an essential tool designed to help you financially prepare for relocating. Moving—whether across town or across the country—involves dozens of hidden fees, variable rates, and complex pricing structures that can quickly overwhelm a budget. This calculator synthesizes key variables such as distance, home size, moving style, and seasonality to generate a highly accurate, itemized cost breakdown, ensuring you can plan your move without financial surprises.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">
                The algorithm calculates costs based on industry-standard moving rates. For a Full Service move, interstate pricing is strictly regulated based on the total weight of your belongings and the exact mileage of the route. For Local or DIY moves, the formula shifts to calculate truck rental base rates, estimated fuel costs assuming standard moving truck fuel efficiency, and hourly labor rates. Seasonality acts as a massive multiplier—moving companies drastically increase rates during peak summer months when demand spikes, which our formula automatically applies based on your selected move month.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your total estimated cost is broken down into distinct categories to help you identify where you can save. The transportation cost covers the physical truck, fuel, and mileage fees. Labor costs cover the physical moving of items into and out of the truck. Packing costs account for boxes, tape, bubble wrap, and professional packing services if selected. By separating these costs, you can instantly see if hiring a hybrid service (you drive the truck, but hire local labor to load it) provides the optimal balance of cost and effort for your specific situation.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Key Factors</h2>
              <p className="text-muted-foreground leading-relaxed">
                The distance of your move establishes whether you are billed by the hour (local) or by weight/mileage (interstate). The size of your home determines the estimated weight of your belongings, which dictates truck size, fuel consumption, and labor hours. Your chosen moving style is the largest variable: DIY is the cheapest but requires immense physical effort; Full Service is completely hands-off but highly expensive; Hybrid offers a middle ground. Finally, moving during peak season (May through September) can increase your total bill by up to twenty-five percent.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-3">Professional Mode Features</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Professional Mode allows you to model complex, full-scale relocations. You can toggle professional packing services, which significantly increases costs but drastically reduces stress. You can add specialized auto transport if you are flying to your destination and shipping your vehicles. The insurance valuation input calculates the cost of full-value replacement coverage, protecting you beyond the legally required minimum coverage of sixty cents per pound. You can also estimate temporary storage costs if your new home won't be ready on arrival.
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-3">Tips & Best Practices</h2>
              <p className="text-muted-foreground leading-relaxed">
                The absolute best way to reduce your moving cost is to aggressively declutter before you pack; selling or donating heavy furniture can save you hundreds of dollars in weight-based fees. If your schedule allows, book your move between October and April, and specifically aim for a mid-week, mid-month date to secure the lowest possible rates. Always get at least three binding in-home or virtual estimates from reputable, licensed moving companies before making a final decision, and use this calculator as a baseline to negotiate better rates.
              </p>
            </div>
          </section>
          
          <FAQSection faqs={[
            { question: "Is it cheaper to rent a truck or hire movers?", answer: "Renting a truck (DIY) is significantly cheaper in hard dollars, often saving 50-70% compared to full-service movers. However, you must factor in hidden costs: fuel, tolls, moving supplies, specialized equipment rental (dollies, blankets), and the physical toll on your body. A popular compromise is a 'hybrid' move where you rent the truck but hire local laborers for a few hours strictly to load and unload heavy items." },
            { question: "When is the most expensive time to move?", answer: "The peak moving season runs from Memorial Day (late May) through Labor Day (early September). Approximately 70% of all moves occur during this window. Because demand vastly exceeds the supply of trucks and labor, moving companies charge premium rates—often 20% to 30% higher than winter rates. The first and last days of any month are also more expensive due to lease turnovers." },
            { question: "Should I buy extra moving insurance?", answer: "By law, interstate movers provide basic liability coverage for free, but it only pays 60 cents per pound per article. If a 10-pound flat-screen TV is destroyed, you receive $6. Full Value Protection (FVP) costs extra but ensures the mover repairs, replaces, or pays full market value for damaged items. If you are moving high-value items, FVP or third-party moving insurance is highly recommended." }
          ]} pageUrl="https://racira.com/calculator/moving-cost-estimator" />
          <PopularCalculators exclude="/calculator/moving-cost-estimator" />
        </div>
      </div>
    </>
  );
}
