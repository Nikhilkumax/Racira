"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Calculator, RotateCcw, Truck, Printer, Info } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CpmResults {
  miles: number;
  
  truckPayment: number;
  insurance: number;
  permits: number;
  
  fuelPrice: number;
  mpg: number;
  maintenance: number;
  tolls: number;
  
  driverPay: number;
  
  totalFixed: number;
  totalVariable: number;
  fuelCost: number;
  totalCost: number;
  
  costPerMile: number;
  fixedCpm: number;
  variableCpm: number;
  driverCpm: number;
  
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string }[];
  breakdown: { label: string; amount: string; isTotal?: boolean; colorClass?: string }[];
}

const calculateCpm = (
  miles: number, 
  truckPayment: number, insurance: number, permits: number,
  fuelPrice: number, mpg: number, maintenance: number, tolls: number,
  driverPay: number
): CpmResults => {
  
  const totalFixed = truckPayment + insurance + permits;
  
  const fuelCost = mpg > 0 ? (miles / mpg) * fuelPrice : 0;
  const totalVariable = fuelCost + maintenance + tolls;
  
  const totalCost = totalFixed + totalVariable + driverPay;
  
  const costPerMile = miles > 0 ? totalCost / miles : 0;
  const fixedCpm = miles > 0 ? totalFixed / miles : 0;
  const variableCpm = miles > 0 ? totalVariable / miles : 0;
  const driverCpm = miles > 0 ? driverPay / miles : 0;

  const chartData = [
    { name: "Fixed Overhead", value: totalFixed, color: "hsl(var(--muted-foreground))" },
    { name: "Fuel & Variable", value: totalVariable, color: "hsl(var(--amber-500))" },
    { name: "Driver Pay", value: driverPay, color: "hsl(var(--primary))" },
  ];

  const summaryStats = [
    { label: "Cost Per Mile", value: `$${costPerMile.toFixed(3)}` },
    { label: "Total Operating Cost", value: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Fuel CPM", value: `$${(miles > 0 ? fuelCost / miles : 0).toFixed(3)}` },
    { label: "Total Miles", value: miles.toLocaleString() },
  ];

  const breakdown = [
    { label: `Fixed Costs (Truck, Insurance, Permits)`, amount: `$${totalFixed.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-muted-foreground" },
    { label: `Fuel Cost (${miles} mi / ${mpg} MPG × $${fuelPrice})`, amount: `$${fuelCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: `Other Variable (Maint. & Tolls)`, amount: `$${(maintenance + tolls).toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-amber-600" },
    { label: `Driver Labor / Pay`, amount: `$${driverPay.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, colorClass: "text-primary" },
    { label: "Total Operating Cost", amount: `$${totalCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, isTotal: true, colorClass: "text-foreground font-bold text-[15px]" },
    { label: `Cost Per Mile (CPM)`, amount: `$${costPerMile.toFixed(3)} / mi`, isTotal: true, colorClass: "text-primary font-bold text-[15px]" },
  ];

  return { miles, truckPayment, insurance, permits, fuelPrice, mpg, maintenance, tolls, driverPay, totalFixed, totalVariable, fuelCost, totalCost, costPerMile, fixedCpm, variableCpm, driverCpm, chartData, summaryStats, breakdown };
};

const DEFAULTS = {
  miles: "10000",
  truckPayment: "2200",
  insurance: "1100",
  permits: "150",
  fuelPrice: "4.15",
  mpg: "6.5",
  maintenance: "1200",
  tolls: "450",
  driverPay: "6500",
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

export default function DeliveryCostPerMileCalculator() {
  const [miles, setMiles] = useState(DEFAULTS.miles);
  
  const [truckPayment, setTruckPayment] = useState(DEFAULTS.truckPayment);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [permits, setPermits] = useState(DEFAULTS.permits);
  
  const [fuelPrice, setFuelPrice] = useState(DEFAULTS.fuelPrice);
  const [mpg, setMpg] = useState(DEFAULTS.mpg);
  const [maintenance, setMaintenance] = useState(DEFAULTS.maintenance);
  const [tolls, setTolls] = useState(DEFAULTS.tolls);
  
  const [driverPay, setDriverPay] = useState(DEFAULTS.driverPay);
  
  const [results, setResults] = useState<CpmResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setResults(calculateCpm(
      parseFloat(miles) || 0,
      parseFloat(truckPayment) || 0, parseFloat(insurance) || 0, parseFloat(permits) || 0,
      parseFloat(fuelPrice) || 0, parseFloat(mpg) || 0, parseFloat(maintenance) || 0, parseFloat(tolls) || 0,
      parseFloat(driverPay) || 0
    ));
  };

  const handleReset = () => {
    setMiles(DEFAULTS.miles);
    setTruckPayment(DEFAULTS.truckPayment); setInsurance(DEFAULTS.insurance); setPermits(DEFAULTS.permits);
    setFuelPrice(DEFAULTS.fuelPrice); setMpg(DEFAULTS.mpg); setMaintenance(DEFAULTS.maintenance); setTolls(DEFAULTS.tolls);
    setDriverPay(DEFAULTS.driverPay);
    setResults(calculateCpm(10000, 2200, 1100, 150, 4.15, 6.5, 1200, 450, 6500));
  };

  useEffect(() => { 
    setMounted(true);
    handleCalculate(); 
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Cost Per Mile</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#f5f5f5;text-align:left}</style></head><body>`);
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Delivery Cost Per Mile" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Trucking & Delivery Cost Per Mile (CPM) Calculator</h1>
        
        <div className="racira-page-container grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
          
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <CompactInput id="mi" label="Total Monthly Miles" value={miles} onChange={setMiles} suffix="miles" tooltip="Total miles driven by the truck in a typical month." />
            
            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-3">Fixed Monthly Costs</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="trk" label="Truck Payment" value={truckPayment} onChange={setTruckPayment} prefix="$" tooltip="Monthly loan or lease payment for the tractor/trailer." />
              <CompactInput id="ins" label="Commercial Insurance" value={insurance} onChange={setInsurance} prefix="$" />
            </div>
            
            <CompactInput id="per" label="Permits & Licenses" value={permits} onChange={setPermits} prefix="$" tooltip="Monthly breakdown of IFTA, heavy vehicle use tax, registration, etc." />

            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-5 w-5 text-amber-500" />
              <h2 className="text-2xl font-bold mb-3">Variable Operations</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="fpt" label="Fuel Price" value={fuelPrice} onChange={setFuelPrice} prefix="$" suffix="/gal" />
              <CompactInput id="mpg" label="Vehicle MPG" value={mpg} onChange={setMpg} suffix="mpg" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="mnt" label="Maintenance" value={maintenance} onChange={setMaintenance} prefix="$" tooltip="Monthly budget for oil changes, tires, repairs." />
              <CompactInput id="tol" label="Tolls & Scales" value={tolls} onChange={setTolls} prefix="$" />
            </div>

            <div className="border-t border-border my-1"></div>

            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Driver Compensation</h2>
            </div>

            <CompactInput id="drv" label="Total Driver Pay" value={driverPay} onChange={setDriverPay} prefix="$" tooltip="Total gross wages paid to the driver per month, including benefits/taxes." />

            <div className="p-3 mt-1 rounded-lg bg-primary/10 border border-primary/30 text-xs text-foreground font-medium flex gap-2 items-start">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>Knowing your CPM is the single most important metric for an owner-operator. If your CPM is $1.95, and a broker offers you a load for $1.80/mile, you are paying to work.</p>
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
                    Cost Per Mile (CPM)
                  </div>
                  <div className="text-4xl font-bold tracking-tighter mb-2 text-primary">
                    ${results.costPerMile.toFixed(3)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    Never accept a freight load that pays less than your true CPM.
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
            <h2 className="text-2xl font-bold mb-3">What is Cost Per Mile (CPM)?</h2>
            <p><strong>Cost Per Mile (CPM)</strong> is the foundational metric of the trucking and delivery industry. It represents exactly how much money it costs a trucking company (or owner-operator) to drive a vehicle exactly one mile.</p>
            <p>If you do not know your CPM to the penny, you cannot run a profitable trucking business. Freight brokers will constantly offer you loads at "$1.80 per mile." If your CPM is $1.95, accepting that load means you are losing 15 cents for every mile you drive.</p>
            
            <h3>Fixed vs. Variable Costs</h3>
            <p>To calculate an accurate CPM, you must separate your costs into two categories:</p>
            <ul>
              <li><strong>Fixed Costs:</strong> These are expenses you pay even if the truck never moves. This includes your truck lease/payment, commercial auto liability insurance, health insurance, and annual permits (like IFTA).</li>
              <li><strong>Variable Costs:</strong> These expenses only happen when the wheels are turning. This includes diesel fuel, DEF fluid, tires, oil changes, tolls, and scale fees.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Danger of "Deadhead" Miles</h2>
            <p><strong>Deadheading</strong> is driving a truck with an empty trailer. If you drive 500 miles to deliver a load, and then drive 200 miles empty to pick up the next load, your actual driven miles for that trip is 700.</p>
            <p>Many new truck drivers only divide their revenue by the 500 loaded miles, tricking themselves into thinking they are profitable. You must divide your costs by <strong>Total Miles Driven</strong> (including empty deadhead miles) to find your true CPM. Fuel burns whether the trailer is empty or full.</p>
          </section>
          <FAQSection faqs={[
            { question: "What is a good CPM for a trucking company?", answer: "There is no single 'good' CPM, as it varies wildly depending on the equipment type (Dry Van vs Reefer vs Flatbed) and fuel prices. However, a typical owner-operator operating a Class 8 semi-truck usually sees a CPM between $1.60 and $2.10." },
            { question: "How often should I calculate my CPM?", answer: "You should calculate it monthly. Diesel prices fluctuate constantly, and insurance premiums usually adjust annually. A CPM calculated six months ago is likely inaccurate today." },
            { question: "Should driver pay be included if I am an owner-operator?", answer: "Yes, absolutely. You must pay yourself a fair market wage for driving. If your business only breaks even when you don't pay yourself, you don't have a business—you bought yourself a minimum wage job with massive financial liability." },
          ]} pageUrl="https://racira.com/calculator/delivery-cost-per-mile-calculator" />
          <PopularCalculators exclude="/calculator/delivery-cost-per-mile-calculator" />
        </div>
      </div>
    </>
  );
}
