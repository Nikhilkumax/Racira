"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  wagesMonthly: string;
  fuelPrice: string;
  mpg: string;
  milesMonthly: string;
  insuranceMonthly: string;
  maintenanceMonthly: string;
  depreciationMonthly: string;
}

interface Result {
  fuelPerMile: number;
  fuelMonthly: number;
  fixedMonthly: number;
  fixedPerMile: number;
  totalMonthly: number;
  costPerMile: number;
}

const DEFAULTS: Inputs = {
  wagesMonthly: "30000",
  fuelPrice: "3.60",
  mpg: "8.5",
  milesMonthly: "12000",
  insuranceMonthly: "4000",
  maintenanceMonthly: "6000",
  depreciationMonthly: "3000",
};

function calculate(inputs: Inputs): Result {
  const wagesMonthly = Math.max(0, parseFloat(inputs.wagesMonthly) || 0);
  const fuelPrice = Math.max(0, parseFloat(inputs.fuelPrice) || 0);
  const mpg = Math.max(0, parseFloat(inputs.mpg) || 0);
  const milesMonthly = Math.max(0, parseFloat(inputs.milesMonthly) || 0);
  const insuranceMonthly = Math.max(0, parseFloat(inputs.insuranceMonthly) || 0);
  const maintenanceMonthly = Math.max(0, parseFloat(inputs.maintenanceMonthly) || 0);
  const depreciationMonthly = Math.max(0, parseFloat(inputs.depreciationMonthly) || 0);

  const fuelPerMile = mpg > 0 ? fuelPrice / mpg : 0;
  const fuelMonthly = fuelPerMile * milesMonthly;
  const fixedMonthly = wagesMonthly + insuranceMonthly + maintenanceMonthly + depreciationMonthly;
  const fixedPerMile = milesMonthly > 0 ? fixedMonthly / milesMonthly : 0;
  const totalMonthly = fixedMonthly + fuelMonthly;
  const costPerMile = milesMonthly > 0 ? totalMonthly / milesMonthly : 0;

  return { fuelPerMile, fuelMonthly, fixedMonthly, fixedPerMile, totalMonthly, costPerMile };
}

const NumInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));

export default function TransportationCostPerMileCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.wagesMonthly) < 0 ||
    num(inputs.fuelPrice) < 0 ||
    num(inputs.mpg) <= 0 ||
    num(inputs.milesMonthly) <= 0 ||
    num(inputs.insuranceMonthly) < 0 ||
    num(inputs.maintenanceMonthly) < 0 ||
    num(inputs.depreciationMonthly) < 0;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculate(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const handlePrint = () => window.print();

  const rows = [
    { label: "Miles Driven per Month", value: fmt(num(inputs.milesMonthly)) },
    { label: "Driver Wages", value: fmtMoney(num(inputs.wagesMonthly)) },
    { label: `Fuel ($${fmt(num(inputs.fuelPrice), 2)}/gal ÷ ${fmt(num(inputs.mpg), 1)} mpg)`, value: fmtMoney(result.fuelMonthly) },
    { label: "Maintenance & Tires", value: fmtMoney(num(inputs.maintenanceMonthly)) },
    { label: "Insurance & Permits", value: fmtMoney(num(inputs.insuranceMonthly)) },
    { label: "Vehicle Depreciation", value: fmtMoney(num(inputs.depreciationMonthly)) },
    { label: "Total Monthly Cost", value: fmtMoney(result.totalMonthly), total: true },
    { label: "Fuel Cost per Mile", value: "$" + fmt(result.fuelPerMile, 3) },
    { label: "Fixed Cost per Mile", value: "$" + fmt(result.fixedPerMile, 2) },
    { label: "Total Cost per Mile", value: "$" + fmt(result.costPerMile, 2), highlight: true },
  ];

  const summaryStats = [
    { label: "Miles / Month", value: fmt(num(inputs.milesMonthly)) },
    { label: "Fuel Price", value: "$" + fmt(num(inputs.fuelPrice), 2) + "/gal" },
    { label: "Average MPG", value: fmt(num(inputs.mpg), 1) },
    { label: "Driver Wages / Mo", value: fmtMoney(num(inputs.wagesMonthly)) },
    { label: "Fuel Cost / Mo", value: fmtMoney(result.fuelMonthly) },
    { label: "Fixed Costs / Mo", value: fmtMoney(result.fixedMonthly) },
    { label: "Total Monthly Cost", value: fmtMoney(result.totalMonthly), bold: true },
    { label: "Fuel Cost / Mile", value: "$" + fmt(result.fuelPerMile, 3) },
    { label: "Fixed Cost / Mile", value: "$" + fmt(result.fixedPerMile, 2) },
    { label: "Total Cost / Mile", value: "$" + fmt(result.costPerMile, 2) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Transportation Cost per Mile Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Transportation Cost per Mile Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="tpm-wages" label="Driver Wages per Month" value={inputs.wagesMonthly} onChange={set("wagesMonthly")} prefix="$" />
              <NumInput id="tpm-miles" label="Miles Driven per Month" value={inputs.milesMonthly} onChange={set("milesMonthly")} suffix="miles" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="tpm-fuel" label="Fuel Cost per Gallon" value={inputs.fuelPrice} onChange={set("fuelPrice")} prefix="$" />
              <NumInput id="tpm-mpg" label="Average MPG" value={inputs.mpg} onChange={set("mpg")} suffix="mpg" />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none"
            >
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Fixed Operating Costs</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="tpm-insurance" label="Insurance & Permits" value={inputs.insuranceMonthly} onChange={set("insuranceMonthly")} prefix="$" suffix="/mo" />
                    <NumInput id="tpm-maintenance" label="Maintenance & Tires" value={inputs.maintenanceMonthly} onChange={set("maintenanceMonthly")} prefix="$" suffix="/mo" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="tpm-depreciation" label="Vehicle Depreciation" value={inputs.depreciationMonthly} onChange={set("depreciationMonthly")} prefix="$" suffix="/mo" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                MPG and miles driven must be greater than zero; all costs must be non-negative.
              </p>
            )}

            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={handleReset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div ref={resultsRef} className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Cost per Mile</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">${fmt(result.costPerMile, 2)}</div>
              <div className="text-sm text-muted-foreground font-medium">${fmt(result.fuelPerMile, 2)} fuel + ${fmt(result.fixedPerMile, 2)} fixed per mile</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Fuel Cost / Mile</span>
                <span className="font-extrabold text-emerald-600">${fmt(result.fuelPerMile, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Fixed Cost / Mile</span>
                <span className="font-extrabold text-amber-600">${fmt(result.fixedPerMile, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Monthly Cost</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.totalMonthly)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Fleet Cost Breakdown</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[180px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 pl-4 pr-3 text-base font-medium ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 pl-3 pr-4 text-right text-base font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                    <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Transportation Cost per Mile Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A transportation cost per mile calculator works out the true cost of operating a vehicle or a fleet for every mile driven. Cost per mile is the fundamental unit of measurement in trucking, delivery, and logistics: freight rates are quoted per mile, fuel budgets are built per mile, and fleet profitability is ultimately a question of whether revenue per mile exceeds cost per mile. The challenge is that the cost is made up of very different components, some of which scale directly with distance, like fuel, and some of which are fixed monthly costs that must be spread across however many miles the fleet actually drives, like wages, insurance, and depreciation. This tool separates the two, calculates each per-mile figure, and produces a total cost per mile that reflects the real operating economics of the fleet. That number is what route pricing, owner-operator comparisons, and fleet replacement decisions should be built on.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes four core inputs. Driver wages per month is the total compensation of the drivers operating the vehicles, and miles driven per month is the fleet's monthly mileage, which is the denominator every cost is divided by. The fuel cost per gallon and the average miles per gallon complete the variable side: dividing the fuel price by the fleet's average fuel economy gives the fuel cost per mile, and multiplying by the monthly mileage gives the monthly fuel spend. The fixed monthly costs are then added, and the total monthly cost divided by the monthly mileage gives the total cost per mile, with the fixed cost per mile being the fixed total divided by the same mileage.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section completes the fixed cost picture with the three components that are easy to leave out. Insurance and permits covers commercial insurance premiums and operating authority costs, maintenance and tires covers the scheduled service, repairs, and tire replacement the fleet needs, and vehicle depreciation spreads the purchase price of the vehicles over their service life. Each is entered as a monthly amount and added to driver wages to form the fixed monthly total. With the default inputs, a fleet with $30,000 of monthly wages, 12,000 miles, fuel at $3.60 a gallon with an 8.5 mpg average, and $13,000 of monthly fixed costs runs at about $4.01 per mile, with fuel at $0.42 per mile and fixed costs at $3.58 per mile. The per-mile split matters because the two sides respond to different levers: fuel prices and driving efficiency drive the variable side, while utilization drives the fixed side.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total cost per mile, and the split between fuel and fixed cost determines which improvement lever to pull. When the fixed cost per mile is high, the fastest fix is more miles: the fixed monthly costs are already being paid, so every additional mile driven spreads them thinner and lowers the per-mile cost, which is why utilization is the most powerful profit driver in trucking. When the fuel cost per mile is high, the levers are vehicle choice, driving behavior, and route planning, and even a one mile per gallon improvement across a fleet moves the cost per mile by the price of fuel divided by the product of the old and new fuel economy. Compare the total cost per mile against the revenue per mile your freight or deliveries generate, and the margin per mile appears immediately. Re-run the calculator when fuel prices change, when wages move, or when vehicles are replaced, and use the figure to evaluate whether a route, a lane, or an entire contract is worth keeping.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/transportation-cost-per-mile-calculator" />
        </div>
      </div>
    </>
  );
}