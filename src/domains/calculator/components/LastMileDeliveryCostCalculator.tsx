"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Truck, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface LastMileResults {
  distance: number;
  wage: number;
  hours: number;
  fuelPrice: number;
  mpg: number;
  wear: number;
  packages: number;
  
  laborCost: number;
  fuelCost: number;
  maintCost: number;
  
  totalRouteCost: number;
  costPerPackage: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateLastMile = (
  distance: number, wage: number, hours: number, fuelPrice: number, mpg: number, wear: number, packages: number
): LastMileResults => {
  
  const laborCost = wage * hours;
  const fuelCost = mpg > 0 ? (distance / mpg) * fuelPrice : 0;
  const maintCost = distance * wear;
  
  const totalRouteCost = laborCost + fuelCost + maintCost;
  const costPerPackage = packages > 0 ? totalRouteCost / packages : 0;

  const chartData = [
    { name: "Driver Labor", value: laborCost, color: "hsl(var(--amber-500))" },
    { name: "Fuel Consumption", value: fuelCost, color: "hsl(var(--destructive))" },
    { name: "Vehicle Maintenance", value: maintCost, color: "hsl(var(--primary))" },
  ];

  const summaryStats = [
    { label: "Cost Per Package", value: `$${costPerPackage.toFixed(2)}` },
    { label: "Total Route Cost", value: `$${totalRouteCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Labor % of Route", value: totalRouteCost > 0 ? `${((laborCost / totalRouteCost) * 100).toFixed(1)}%` : "0%" },
    { label: "Drop Density", value: packages > 0 ? `${(distance / packages).toFixed(1)} mi/pkg` : "0" },
  ];

  const breakdown = [
    { label: `Driver Labor (${hours} hours @ $${wage}/hr)`, amount: `$${laborCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: `Fuel Cost (${distance} miles / ${mpg} MPG × $${fuelPrice})`, amount: `$${fuelCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-red-500" },
    { label: `Vehicle Wear & Tear (${distance} miles @ $${wear}/mi)`, amount: `$${maintCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Total Cost of Delivery Route", amount: `$${totalRouteCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold text-[15px]" },
    { label: `Average Cost Per Package Delivered`, amount: `$${costPerPackage.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-primary font-bold text-[15px]" },
  ];

  return { distance, wage, hours, fuelPrice, mpg, wear, packages, laborCost, fuelCost, maintCost, totalRouteCost, costPerPackage, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  distance: "85",
  wage: "24",
  hours: "8",
  fuelPrice: "4.15",
  mpg: "12",
  wear: "0.45",
  packages: "120",
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

export default function LastMileDeliveryCostCalculator() {
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [wage, setWage] = useState(DEFAULTS.wage);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [fuelPrice, setFuelPrice] = useState(DEFAULTS.fuelPrice);
  const [mpg, setMpg] = useState(DEFAULTS.mpg);
  const [wear, setWear] = useState(DEFAULTS.wear);
  const [packages, setPackages] = useState(DEFAULTS.packages);
  
  const [results, setResults] = useState<LastMileResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateLastMile(
      parseFloat(distance) || 0, parseFloat(wage) || 0, parseFloat(hours) || 0,
      parseFloat(fuelPrice) || 0, parseFloat(mpg) || 0, parseFloat(wear) || 0,
      parseFloat(packages) || 0
    ));
  };

  const handleReset = () => {
    setDistance(DEFAULTS.distance); setWage(DEFAULTS.wage); setHours(DEFAULTS.hours);
    setFuelPrice(DEFAULTS.fuelPrice); setMpg(DEFAULTS.mpg); setWear(DEFAULTS.wear); setPackages(DEFAULTS.packages);
    setResults(calculateLastMile(85, 24, 8, 4.15, 12, 0.45, 120));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Last-Mile Route Cost</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
          <span className="text-foreground">${payload[0].value.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Last-Mile Delivery Cost" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Last-Mile Delivery Route Cost Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="dist" label="Total Route Distance" value={distance} onChange={setDistance} suffix="miles" tooltip="Total miles driven by the delivery van for the entire shift." />
              <CompactInput id="pkg" label="Packages Delivered" value={packages} onChange={setPackages} tooltip="Total number of stops or packages dropped off on this route." />
            </div>
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Route Expenses</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="wg" label="Driver Hourly Wage" value={wage} onChange={setWage} prefix="$" tooltip="Fully burdened hourly cost of the driver." />
              <CompactInput id="hr" label="Route Duration" value={hours} onChange={setHours} suffix="hours" tooltip="Total time taken to complete the route." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="fpt" label="Fuel Price" value={fuelPrice} onChange={setFuelPrice} prefix="$" suffix="/gal" tooltip="Current price of gas or diesel per gallon." />
              <CompactInput id="mpg" label="Vehicle MPG" value={mpg} onChange={setMpg} suffix="mpg" tooltip="Miles per gallon achieved by the delivery van." />
            </div>

            <CompactInput id="maint" label="Maintenance / Wear" value={wear} onChange={setWear} prefix="$" suffix="/mile" tooltip="Cost of tires, oil, depreciation, and insurance spread across each mile driven (IRS standard is ~$0.67/mi)." />

            <div className="p-3 mt-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <p>The "Last Mile" to the customer's front porch is notoriously the most expensive and inefficient part of the entire global supply chain.</p>
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
                    Cost Per Package (Last-Mile)
                  </div>
                  <div className="text-4xl font-bold tracking-tighter mb-2 text-primary">
                    ${results.costPerPackage.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Total route expense: <span className="font-bold text-foreground">${results.totalRouteCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
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
                    <h3 className="text-sm font-bold mb-0 w-full text-left">Route Expense Distribution</h3>
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
            <h2 className="text-2xl font-bold mb-3">The Last-Mile Delivery Problem</h2>
            <p>In the supply chain, the <strong>Last Mile</strong> refers to the final step of the delivery process: moving a package from a local fulfillment center to the customer's front door. Astonishingly, this short trip often accounts for <strong>over 50% of the total shipping cost</strong> of a product.</p>
            
            <h3>Why is the Last Mile so Expensive?</h3>
            <p>When you ship an ocean container from China to California, the ship carries 10,000 containers at once, achieving massive economies of scale. When you move a pallet from California to a warehouse in Ohio via a semi-truck, the truck carries 26 pallets at once.</p>
            <p>But when a delivery van leaves the local depot, it has to make 120 individual stops. The driver has to navigate traffic, find parking, walk up driveways, and avoid aggressive dogs. You lose all economies of scale, and labor costs skyrocket.</p>

            <h2 className="text-2xl font-bold mb-3">Drop Density: The Key to Profitability</h2>
            <p>The single most important metric in Last-Mile delivery is <strong>Drop Density</strong> (how close the delivery stops are to each other). </p>
            <ul>
              <li><strong>High Density (Urban):</strong> If a driver delivers 10 packages to a single apartment building, the fuel and time cost per package is incredibly low.</li>
              <li><strong>Low Density (Rural):</strong> If a driver has to drive 5 miles between each farmhouse, the fuel and time cost per package can exceed the value of the actual items inside the box.</li>
            </ul>
            
            <h3>The Hidden Cost of Vehicle Wear</h3>
            <p>Many courier businesses only look at Driver Wage and Gas. This is a fatal mistake. Delivery vans stop and start hundreds of times a day, destroying brakes and transmissions. Tires wear out quickly, and commercial insurance is exorbitant. Factoring in a per-mile maintenance rate (like the IRS standard mileage rate) is critical to understanding your true route profitability.</p>
          </section>
          <FAQSection faqs={[
            { question: "What is an acceptable Cost Per Package?", answer: "For giants like Amazon or USPS with massive route density, they can achieve $3 - $5 per package. For smaller regional couriers or dedicated delivery services, $8 - $12 per stop is more common." },
            { question: "How does 'Failed Delivery' impact costs?", answer: "A failed delivery (customer wasn't home to sign) doubles your cost for that package, because the driver has to drive it back to the depot and attempt it again tomorrow, doing twice the work for the same revenue." },
            { question: "Are electric vehicles (EVs) cheaper for Last-Mile?", answer: "Usually, yes. While the upfront purchase cost of an EV delivery van is higher, the 'Fuel' cost is significantly lower, and EVs require far less maintenance (no oil changes, fewer moving parts) which drastically lowers the per-mile operating cost over time." },
          ]} pageUrl="https://racira.com/calculator/last-mile-delivery-cost-calculator" />
          <PopularCalculators exclude="/calculator/last-mile-delivery-cost-calculator" />
        </div>
      </div>
    </>
  );
}
