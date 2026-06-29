"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Fuel } from "lucide-react";

interface FuelCostResult {
  totalCost: number;
  gallonsUsed: number;
  costPerMile: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateFuelCost = (
  unit: string,
  distanceStr: string,
  efficiencyStr: string, // MPG or L/100km
  priceStr: string // Price per gallon or price per liter
): FuelCostResult | null => {
  const dist = parseFloat(distanceStr);
  const eff = parseFloat(efficiencyStr);
  const price = parseFloat(priceStr);

  if (isNaN(dist) || isNaN(eff) || isNaN(price) || dist < 0 || eff <= 0 || price < 0) return null;

  try {
    let gallonsUsed = 0;
    let totalCost = 0;
    let costPerMile = 0;

    if (unit === "imperial") {
      // MPG and Price per Gallon
      gallonsUsed = dist / eff;
      totalCost = gallonsUsed * price;
      costPerMile = totalCost / dist;
      if (dist === 0) costPerMile = 0;
    } else {
      // Metric: L/100km and Price per Liter, distance in km
      // Liters used = (distance / 100) * efficiency
      gallonsUsed = (dist / 100) * eff; // Storing liters in the gallonsUsed field
      totalCost = gallonsUsed * price;
      costPerMile = totalCost / dist; // Storing cost per km
      if (dist === 0) costPerMile = 0;
    }

    return {
      totalCost: parseFloat(totalCost.toFixed(2)),
      gallonsUsed: parseFloat(gallonsUsed.toFixed(2)),
      costPerMile: parseFloat(costPerMile.toFixed(4)),
      isError: false
    };

  } catch (err) {
    return { totalCost: 0, gallonsUsed: 0, costPerMile: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const FuelCostCalculator = () => {
  const [unit, setUnit] = useState("imperial");
  const [distance, setDistance] = useState("1200"); // miles or km
  const [efficiency, setEfficiency] = useState("25"); // MPG or L/100km
  const [price, setPrice] = useState("3.50"); // per gallon or liter

  const [result, setResult] = useState<FuelCostResult | null>(null);

  const calculate = () => {
    setResult(calculateFuelCost(unit, distance, efficiency, price));
  };

  useEffect(() => { calculate(); }, [unit, distance, efficiency, price]);

  const handleUnitChange = (newUnit: "imperial" | "metric") => {
    setUnit(newUnit);
    if (newUnit === "imperial") {
      setDistance("1200"); setEfficiency("25"); setPrice("3.50");
    } else {
      setDistance("2000"); setEfficiency("8.5"); setPrice("1.60");
    }
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatCents = (val: number) => {
    return `${(val * 100).toFixed(1)}¢`;
  };

  const faqs = [
    { question: "How can I find my car's true MPG?", answer: "Do not trust the digital dashboard on your car; it is often optimistic by 1-2 MPG. To find true MPG: Fill your tank until the pump clicks off. Reset your trip odometer to zero. Drive normally until you need gas again. Fill the tank until it clicks off again. Look at the pump to see exactly how many gallons you just put in. Divide the miles on your trip odometer by the gallons on the pump." },
    { question: "Is it cheaper to fly or drive?", answer: "This calculator helps you answer that. When comparing flights to a road trip, you must calculate the total fuel cost (both ways). However, you should also factor in the 'Cost Per Mile' wear-and-tear on your vehicle (tires, oil, depreciation). The IRS standard mileage rate for total vehicle cost is usually around 65 cents per mile." },
    { question: "Why does MPG drop so much at 80 MPH?", answer: "Aerodynamic drag increases exponentially, not linearly. Driving at 80 MPH requires dramatically more horsepower (and fuel) to push the air out of the way compared to driving at 65 MPH. For most vehicles, fuel efficiency plummets by roughly 15% to 20% when cruising above 70 MPH." },
    { question: "How does the Metric system measure fuel efficiency?", answer: "Unlike the US system which asks 'How far can I go on one unit of fuel?' (Miles per Gallon), the metric system asks 'How much fuel do I need to go a set distance?' (Liters per 100 Kilometers). A lower L/100km number means the car is MORE efficient, which is the exact opposite of MPG." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Fuel Cost Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fuel Cost Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Measurement System</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full mb-3">
                <button type="button" onClick={() => handleUnitChange("imperial")} className={`flex-1 text-sm font-bold transition-colors ${unit === "imperial" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>US (Miles, Gallons)</button>
                <button type="button" onClick={() => handleUnitChange("metric")} className={`flex-1 text-sm font-bold transition-colors border-l border-input ${unit === "metric" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Metric (km, Liters)</button>
              </div>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Trip Distance</span>
                <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "Miles" : "Kilometers"}</span>
              </label>
              <div className={wrap}><input type="number" value={distance} onChange={e => setDistance(e.target.value)} className={ci} min="0" step="any" /></div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Fuel Efficiency</span>
                <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "MPG" : "L/100km"}</span>
              </label>
              <div className={wrap}><input type="number" value={efficiency} onChange={e => setEfficiency(e.target.value)} className={ci} min="0.1" step="any" /></div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Fuel Price</span>
                <span className="text-xs text-muted-foreground self-end">per {unit === "imperial" ? "Gallon" : "Liter"}</span>
              </label>
              <div className="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-3 text-muted-foreground font-bold">$</span>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground" min="0" step="0.01" />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-12 text-lg transition-all active:scale-[0.98] shadow-sm">Calculate</button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                  <div className="text-base font-medium text-foreground">Please check your inputs and try again.</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">Total Trip Fuel Cost</div>
                  <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                    {formatCurrency(result.totalCost)}
                  </div>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 text-center md:w-40 shrink-0">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Fuel Burned</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{result.gallonsUsed.toLocaleString()} <span className="text-sm font-normal text-muted-foreground font-sans">{unit === "imperial" ? "Gal" : "L"}</span></div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Cost Efficiency Breakdown</h3>
                <div className="p-5 bg-secondary/30 rounded-lg border border-border/50 text-center flex flex-col justify-center items-center">
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Fuel Cost Per {unit === "imperial" ? "Mile" : "Kilometer"} Driven</div>
                  <div className="text-4xl font-bold text-foreground font-mono">{formatCents(result.costPerMile)}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center leading-relaxed">
                  * Note: This calculation only covers the raw cost of fuel. It does not include vehicle depreciation, tire wear, oil changes, or toll roads. The true IRS cost of driving a vehicle is roughly $0.65 per mile.
                </p>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Hidden Costs of the American Road Trip</h2>
            <p>The great American road trip is a classic vacation, but calculating the true cost of driving across the country can be deceiving. When choosing between driving 1,200 miles to a destination or buying a $300 airline ticket, many people vastly underestimate the cost of the drive because they only think about filling up the gas tank once.</p>

            <h2>How Fuel Cost is Calculated</h2>
            <p>The math behind fuel cost is incredibly straightforward: calculate how much fuel you will physically burn, and multiply it by the price at the pump. To find the amount of fuel burned, divide your Total Distance by your vehicle's Fuel Efficiency.</p>
            <p>For example, if you are driving 1,000 miles in an SUV that gets 20 Miles Per Gallon (MPG), you will burn exactly 50 gallons of gas (1,000 ÷ 20 = 50). If gas costs $3.50 per gallon, the fuel cost for the trip is $175.</p>
            <p><strong>Crucial Reminder:</strong> Do not forget that vacations require a return trip! If you calculate the drive from New York to Florida is $175 in gas, the true budget for your vacation fuel is actually $350.</p>

            <h2>The Deception of Dashboard MPG</h2>
            <p>If you rely on your car's digital dashboard to tell you your MPG, your budget is likely wrong. Car manufacturers program these computers to be highly optimistic. They often calculate efficiency based on fuel injector pulse widths under ideal conditions. In reality, factors like idling in traffic, running the air conditioner, under-inflated tires, and driving 80 MPH on the highway will absolutely destroy your actual fuel efficiency. Most dashboard MPG readouts are overestimating efficiency by 1 to 2 MPG.</p>
            <p>To find your true MPG, calculate it manually at the pump by dividing the miles on your trip odometer by the exact number of gallons it took to refill the tank.</p>

            <h2>Aerodynamics: Why Speed Costs Money</h2>
            <p>Because of aerodynamic drag, fuel efficiency is not linear. When you drive 60 MPH, your engine works to push the car through the air. When you accelerate to 80 MPH, the air resistance does not simply increase by 33%; it increases exponentially. Pushing a heavy SUV through the air at 80 MPH requires massive amounts of horsepower, which requires massive amounts of fuel. If your car gets 30 MPG at 65 MPH, it might only get 24 MPG at 80 MPH. Driving faster saves time, but it costs significantly more money.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fuel-cost-calculator" />
          <PopularCalculators exclude="/calculator/fuel-cost-calculator" />
        </div>
      </div>
    </>
  );
};
export default FuelCostCalculator;
