"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Gauge } from "lucide-react";

interface MileageResult {
  mpg: number;
  litersPer100km: number;
  kmPerLiter: number;
  costPerMile: number;
  rangePerTank: number;
  isError: boolean;
  errorMsg?: string;
}

const calculateGasMileage = (
  unit: string,
  distanceStr: string, // Miles or Km
  fuelAddedStr: string, // Gallons or Liters
  fuelPriceStr: string, // $ per Gallon or Liter
  tankSizeStr: string // Gallons or Liters
): MileageResult | null => {
  const dist = parseFloat(distanceStr);
  const fuel = parseFloat(fuelAddedStr);
  const price = parseFloat(fuelPriceStr);
  const tank = parseFloat(tankSizeStr);

  if (isNaN(dist) || isNaN(fuel) || isNaN(price) || isNaN(tank) || dist <= 0 || fuel <= 0 || price < 0 || tank <= 0) return null;

  try {
    let mpg = 0;
    let l100 = 0;
    let kmpl = 0;
    let cpm = 0;
    let range = 0;

    if (unit === "imperial") {
      // Inputs: Miles, Gallons, $/Gal, Tank Gallons
      mpg = dist / fuel;
      
      // Convert to metric for secondary display
      // 1 mile = 1.60934 km
      // 1 gallon = 3.78541 liters
      const distKm = dist * 1.60934;
      const fuelLiters = fuel * 3.78541;
      
      kmpl = distKm / fuelLiters;
      l100 = (fuelLiters / distKm) * 100;

      // Cost per mile
      const totalCost = fuel * price;
      cpm = totalCost / dist;

      // Range
      range = mpg * tank;

    } else {
      // Inputs: Km, Liters, $/Liter, Tank Liters
      kmpl = dist / fuel;
      l100 = (fuel / dist) * 100;

      // Convert to Imperial for secondary display
      const distMi = dist / 1.60934;
      const fuelGal = fuel / 3.78541;

      mpg = distMi / fuelGal;

      // Cost per km (we store it in cpm variable)
      const totalCost = fuel * price;
      cpm = totalCost / dist;

      // Range (km)
      range = kmpl * tank;
    }

    return {
      mpg: parseFloat(mpg.toFixed(2)),
      litersPer100km: parseFloat(l100.toFixed(2)),
      kmPerLiter: parseFloat(kmpl.toFixed(2)),
      costPerMile: parseFloat(cpm.toFixed(4)),
      rangePerTank: Math.floor(range),
      isError: false
    };

  } catch (err) {
    return { mpg: 0, litersPer100km: 0, kmPerLiter: 0, costPerMile: 0, rangePerTank: 0, isError: true, errorMsg: "Calculation error." };
  }
};

const GasMileageCalculator = () => {
  const [unit, setUnit] = useState("imperial");
  const [distance, setDistance] = useState("320");
  const [fuel, setFuel] = useState("12.5");
  const [price, setPrice] = useState("3.50");
  const [tankSize, setTankSize] = useState("16");

  const [result, setResult] = useState<MileageResult | null>(null);

  const calculate = () => {
    setResult(calculateGasMileage(unit, distance, fuel, price, tankSize));
  };

  useEffect(() => { calculate(); }, [unit, distance, fuel, price, tankSize]);

  const handleUnitChange = (newUnit: "imperial" | "metric") => {
    setUnit(newUnit);
    if (newUnit === "imperial") {
      setDistance("320"); setFuel("12.5"); setPrice("3.50"); setTankSize("16");
    } else {
      setDistance("500"); setFuel("40"); setPrice("1.60"); setTankSize("60");
    }
  };

  const wrap = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const formatCents = (val: number) => {
    return `${(val * 100).toFixed(1)}¢`;
  };

  const faqs = [
    { question: "How do I calculate true MPG manually?", answer: "1) Fill your tank completely until the pump clicks off. 2) Reset your car's trip odometer to 0. 3) Drive normally for a few days until you need gas. 4) Go back to the gas station and fill the tank completely again until it clicks off. 5) Look at the gas pump receipt to see the exact number of gallons you just put in. 6) Look at your trip odometer to see the exact miles you drove. 7) Divide the Miles by the Gallons." },
    { question: "Why is the car's dashboard MPG readout wrong?", answer: "Modern cars calculate MPG using a computer that measures the fuel injector pulse width. It is essentially guessing how much fuel is spraying into the engine. While reasonably accurate, these computers are notoriously optimistic, often overstating your MPG by 1 to 2 miles per gallon to make the driver feel better about the car's efficiency. The only true way to know is manually calculating it at the pump." },
    { question: "Why is Metric fuel efficiency 'backwards'?", answer: "In the US, we measure efficiency by volume: 'How far can I go on one gallon of gas?' (Miles per Gallon). Higher is better. The metric system measures efficiency by distance: 'How much fuel do I need to travel a set distance of 100 kilometers?' (Liters per 100km). Because of this, a lower L/100km number means the car is MORE efficient." },
    { question: "Does turning off the AC save gas?", answer: "At low speeds in city driving, yes. Running the air conditioning compressor puts a physical load on the engine, reducing fuel efficiency by up to 10%. However, at highway speeds (over 55 MPH), rolling down the windows destroys the aerodynamic profile of the car. The massive air drag caused by open windows at 70 MPH burns far more gas than simply running the AC with the windows up." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Gas Mileage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Gas Mileage Calculator (True MPG)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          <div className="card-calculator flex flex-col gap-5 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col">
              <label className="text-base font-medium text-foreground mb-1.5">Measurement System</label>
              <div className="flex rounded-md border border-input overflow-hidden h-10 w-full mb-3">
                <button type="button" onClick={() => handleUnitChange("imperial")} className={`flex-1 text-sm font-bold transition-colors ${unit === "imperial" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>US (MPG)</button>
                <button type="button" onClick={() => handleUnitChange("metric")} className={`flex-1 text-sm font-bold transition-colors border-l border-input ${unit === "metric" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>Metric (L/100km)</button>
              </div>
            </div>

            <div className="h-px w-full bg-border/50"></div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Trip Odometer Distance</span>
                <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "Miles" : "Kilometers"}</span>
              </label>
              <div className={wrap}><input type="number" value={distance} onChange={e => setDistance(e.target.value)} className={ci} min="0.1" step="any" /></div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                <span>Fuel Added at Pump</span>
                <span className="text-xs text-muted-foreground self-end">{unit === "imperial" ? "Gallons" : "Liters"}</span>
              </label>
              <div className={wrap}><input type="number" value={fuel} onChange={e => setFuel(e.target.value)} className={ci} min="0.1" step="any" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Price at Pump</span>
                </label>
                <div className="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                  <span className="pl-3 text-muted-foreground font-bold">$</span>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full h-full px-2 text-base bg-transparent outline-none border-none text-foreground" min="0" step="0.01" />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  <span>Total Tank Size</span>
                </label>
                <div className={wrap}><input type="number" value={tankSize} onChange={e => setTankSize(e.target.value)} className={ci} min="1" step="any" /></div>
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
                  <div className="text-base font-medium text-foreground">Please check your inputs. Ensure no fields are zero.</div>
                </div>
              </div>
            ) : result && (<>
              
              <div className="bg-sky-500/10 border-l-4 border-sky-500 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-sky-600 dark:text-sky-400 mb-1 uppercase tracking-wider">True Fuel Efficiency</div>
                  <div className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight font-mono leading-tight">
                    {unit === "imperial" ? result.mpg : result.litersPer100km}
                  </div>
                  <div className="text-sm text-muted-foreground font-bold uppercase mt-1">{unit === "imperial" ? "Miles Per Gallon (MPG)" : "Liters per 100 km"}</div>
                </div>
                <div className="bg-background border border-border/50 rounded-lg p-3 text-center md:w-40 shrink-0">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Cost Efficiency</div>
                  <div className="text-2xl font-bold text-foreground font-mono">{formatCents(result.costPerMile)}</div>
                  <div className="text-xs text-muted-foreground">per {unit === "imperial" ? "mile" : "km"}</div>
                </div>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 text-center border-b-4 border-b-zinc-400">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Max Driving Range</div>
                    <div className="text-3xl font-bold text-foreground font-mono mb-1">{result.rangePerTank.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground font-bold uppercase">{unit === "imperial" ? "Miles" : "Kilometers"} on a full tank</div>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg border border-border/50 text-center border-b-4 border-b-blue-600">
                    <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Metric Conversion</div>
                    <div className="text-3xl font-bold text-foreground font-mono mb-1">{unit === "imperial" ? result.litersPer100km : result.mpg}</div>
                    <div className="text-xs text-muted-foreground font-bold uppercase">{unit === "imperial" ? "L/100km" : "MPG"}</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center leading-relaxed">
                  * Note: Max range assumes you drive the vehicle until it is completely dead on the side of the road. Never attempt to drive the full calculated range.
                </p>
              </div>

            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Fuel Efficiency</h2>
            <p>With gas prices constantly fluctuating, knowing your vehicle's exact fuel efficiency is crucial for budgeting a road trip or deciding if it's time to buy a new car. The gold standard for measuring fuel efficiency in the United States is <strong>Miles Per Gallon (MPG)</strong>. It is a simple calculation: how many miles can the car travel on a single gallon of gasoline?</p>

            <h2>Why Your Dashboard MPG is Lying to You</h2>
            <p>If you own a car built in the last two decades, you likely have a digital readout on your dashboard displaying your current MPG. You should completely ignore this number if you want true accuracy.</p>
            <p>The car's computer does not physically measure the volume of gasoline burning in real time. Instead, it measures how long the fuel injectors stay open (the pulse width) and uses an algorithm to guess the fuel consumption. Because automakers want you to feel good about your vehicle purchase, these algorithms are notoriously optimistic. It is incredibly common for a dashboard to display 25 MPG, while the true mathematical efficiency is actually 23 MPG.</p>

            <h2>The Only True Way to Calculate MPG</h2>
            <p>To find your vehicle's actual, indisputable fuel efficiency, you must calculate it manually at the gas pump using physical measurements.</p>
            <ol>
              <li>Go to a gas station and fill your tank completely until the pump clicks off. (Do not "top it off").</li>
              <li>Reset your car's trip odometer to zero.</li>
              <li>Drive normally for a few days or weeks until you need gas again.</li>
              <li>Return to a gas station and fill the tank completely until it clicks off.</li>
              <li>Look at the gas pump. It will tell you the exact volume of gas you just put in the car (e.g., 14.2 gallons). Because you filled the tank to the top both times, this number represents the exact amount of gas you burned since the last fill-up.</li>
              <li>Look at your trip odometer. It will tell you exactly how far you drove (e.g., 340 miles).</li>
              <li>Divide the Distance by the Fuel (340 ÷ 14.2 = 23.94 MPG).</li>
            </ol>

            <h2>Why is Metric Efficiency Backwards?</h2>
            <p>If you travel outside the United States, fuel efficiency is measured using the metric system. However, they don't just swap miles for kilometers and gallons for liters; they completely invert the mathematical concept.</p>
            <p>In the US, we ask: <em>"How far can I go on one unit of fuel?"</em> (MPG). Because of this, a higher number is better.</p>
            <p>In the metric system, they ask: <em>"How much fuel do I need to travel a set distance of 100 kilometers?"</em> (L/100km). Because of this, a <strong>lower</strong> number is better. A car that gets 5 L/100km is incredibly efficient (roughly 47 MPG), while a truck that gets 15 L/100km is a massive gas guzzler (roughly 15 MPG).</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gas-mileage-calculator" />
          <PopularCalculators exclude="/calculator/gas-mileage-calculator" />
        </div>
      </div>
    </>
  );
};
export default GasMileageCalculator;
