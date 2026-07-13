"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Compass, RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface CorrectionResults {
  actualMileage: number;
  mileageDifference: number;
  errorPercentage: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateCorrection = (inputs: typeof DEFAULTS): CorrectionResults => {
  const factoryDiameter = parseFloat(inputs.factoryDiameter);
  const newDiameter = parseFloat(inputs.newDiameter);
  const indicatedMileage = parseFloat(inputs.indicatedMileage);

  if (isNaN(factoryDiameter) || factoryDiameter <= 0 || isNaN(newDiameter) || newDiameter <= 0 || isNaN(indicatedMileage) || indicatedMileage < 0) {
    return {
      actualMileage: 0, mileageDifference: 0, errorPercentage: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid positive numbers."
    };
  }

  // Calculate circumference (C = PI * D)
  const factoryCirc = factoryDiameter * Math.PI;
  const newCirc = newDiameter * Math.PI;

  // The ratio of the circumferences dictates the odometer error
  // If new tire is larger, the tire travels FURTHER per rotation than the car thinks it did.
  // Therefore, Actual Mileage > Indicated Mileage.
  const ratio = newCirc / factoryCirc;
  const actualMileage = indicatedMileage * ratio;
  const mileageDifference = actualMileage - indicatedMileage;
  const errorPercentage = (ratio - 1) * 100;

  // Generate chart data mapping indicated vs actual over 100,000 miles
  const chartData = [];
  const schedule = [];
  
  for (let m = 10000; m <= 100000; m += 10000) {
    const act = m * ratio;
    
    chartData.push({
      "Indicated Mileage": m,
      "Actual Miles Driven": Math.round(act)
    });

    if (m % 20000 === 0 || m === 10000) {
      schedule.push({
        indicated: m,
        actual: Math.round(act),
        diff: Math.round(act - m)
      });
    }
  }

  return {
    actualMileage: Number(actualMileage.toFixed(1)),
    mileageDifference: Number(mileageDifference.toFixed(1)),
    errorPercentage: Number(errorPercentage.toFixed(2)),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  factoryDiameter: "30.0", // Typical stock truck tire (e.g. 265/70R17)
  newDiameter: "35.0",     // Upgraded off-road tire
  indicatedMileage: "50000"
};

const CompactInput = ({ id, label, value, onChange, placeholder, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" step="any" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function OdometerCorrectionCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<CorrectionResults>(calculateCorrection(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateCorrection(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateCorrection(DEFAULTS));
  };

  const faqs = [
    { question: "Why do larger tires affect my odometer?", answer: "Your vehicle's computer does not use GPS to track mileage; it simply counts how many times the wheels rotate. The factory computer is programmed to assume every rotation covers a specific distance based on the stock tire circumference. If you install larger tires, the physical circumference increases. Your car will now cover more physical ground per rotation than the computer realizes, causing the odometer to read lower than the actual miles driven." },
    { question: "Will my vehicle show more or fewer miles than actual?", answer: "If you install LARGER tires than factory, your odometer will read LOWER than the actual miles you have driven. You are getting 'free' unrecorded miles. If you install SMALLER tires than factory (like on a lowered sports car), your odometer will read HIGHER than actual miles, meaning your car is artificially aging faster on paper." },
    { question: "Does this affect my vehicle's warranty or lease?", answer: "Yes. If you install larger tires on a leased vehicle without having the dealership recalibrate the computer, you are technically driving unrecorded miles. While this might save you money on lease overage penalties, it is a legally gray area. More importantly, it throws off your scheduled maintenance intervals, meaning you might go 12,000 actual miles between oil changes when you thought you only went 10,000." },
    { question: "How do I fix the odometer error?", answer: "The only permanent fix is to reprogram the vehicle's Engine Control Unit (ECU) or Body Control Module (BCM). A dealership can usually reprogram the computer to recognize the new tire size. Alternatively, you can purchase an aftermarket handheld tuner/programmer to flash the new tire diameter directly into the ECU yourself." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Odometer Correction Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Odometer Correction Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Determine your vehicle's true, physical mileage after installing aftermarket tires without recalibrating the computer.</p>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Tire Geometry</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="factory" label="Factory Tire Diameter" value={inputs.factoryDiameter} onChange={(v: string) => handleChange("factoryDiameter", v)} suffix="in" placeholder="30.0" />
              <CompactInput id="new" label="New Tire Diameter" value={inputs.newDiameter} onChange={(v: string) => handleChange("newDiameter", v)} suffix="in" placeholder="35.0" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Dashboard Reading</div>
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="ind" label="Indicated Odometer Mileage" value={inputs.indicatedMileage} onChange={(v: string) => handleChange("indicatedMileage", v)} suffix="miles" placeholder="50000" />
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
            
          </div>

          {/* RIGHT fluid */}
          <div id="results-section" className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">True Actual Mileage</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.actualMileage.toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
                      <div className="text-2xl font-bold text-primary mb-1">mi</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Unrecorded "Ghost" Miles</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">
                        {results.mileageDifference > 0 ? "+" : ""}{results.mileageDifference.toLocaleString('en-US', {maximumFractionDigits: 0})}
                      </div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">mi</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Indicated</div>
                    <div className="text-2xl font-bold text-foreground">{parseFloat(inputs.indicatedMileage).toLocaleString()}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Odometer Error</div>
                    <div className={`text-2xl font-bold ${results.errorPercentage > 0 ? 'text-emerald-500' : results.errorPercentage < 0 ? 'text-destructive' : 'text-blue-500'}`}>
                      {results.errorPercentage > 0 ? "+" : ""}{results.errorPercentage}%
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Tire Size Change</div>
                    <div className="text-2xl font-bold text-foreground">
                      {inputs.factoryDiameter}" → {inputs.newDiameter}"
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Mileage Divergence Over Time</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Indicated Mileage" tickFormatter={(val) => `${val/1000}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                        <YAxis tickFormatter={(val) => `${val/1000}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [value.toLocaleString(), 'Miles']}
                          labelFormatter={(label) => `Indicated: ${Number(label).toLocaleString()}`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', marginTop: '10px' }} />
                        <Area type="monotone" name="Actual Miles Driven" dataKey="Actual Miles Driven" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorAct)" strokeWidth={3} activeDot={{r: 6}} />
                        <Area type="monotone" name="Indicated Mileage" dataKey="Indicated Mileage" stroke="hsl(var(--muted-foreground))" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">The gap between what your dashboard says and what you actually drove widens continuously.</div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Odometer Skew Schedule</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">When Dash Reads:</th>
                          <th className="px-4 py-3 font-semibold text-right">Actual Physical Miles</th>
                          <th className="px-4 py-3 font-semibold text-right">Hidden Difference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.indicated} className={`hover:bg-muted/20 transition-colors ${row.indicated == parseFloat(inputs.indicatedMileage) ? 'bg-primary/5 font-medium' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.indicated.toLocaleString()} mi</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">{row.actual.toLocaleString()} mi</td>
                            <td className={`px-4 py-3 text-right ${row.diff > 0 ? 'text-emerald-500' : row.diff < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {row.diff > 0 ? "+" : ""}{row.diff.toLocaleString()} mi
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Mileage</h2>
            <p>Your vehicle's dashboard does not use GPS satellites to track how many miles you have driven. Instead, it relies on a very simple piece of math: counting wheel rotations. When your vehicle leaves the factory, its central computer is permanently programmed with the physical circumference of the stock tires. The computer knows exactly how many times the axles must rotate to cover exactly one mile. If you change the size of the tires, you break that mathematical formula.</p>

            <h2 className="text-2xl font-bold mb-3">Installing Larger Tires (Trucks & Off-Road)</h2>
            <p>If you own a Jeep Wrangler or a Ford F-150 and you upgrade from the factory 30-inch tires to massive 35-inch mud tires, the physical circumference of the tire increases drastically. Because the new tire is physically larger, it covers more ground during a single rotation. </p>
            <p>However, the vehicle's computer doesn't know this. It is still counting rotations based on the small 30-inch tire. Therefore, your vehicle will physically travel 100 miles down the highway, but the odometer might only click off 85 miles. Your car is accumulating "ghost miles" that are never recorded on the dashboard.</p>

            <h2 className="text-2xl font-bold mb-3">Installing Smaller Tires (Sports Cars)</h2>
            <p>The inverse is true for sports cars. If you install smaller, low-profile tires to lower the vehicle's center of gravity, the tire's circumference shrinks. The smaller tire must complete significantly more rotations just to cover a single mile. The computer, still thinking the tires are full-sized, will see this rapid spinning and assume you are traveling incredibly fast. Your odometer will rack up miles much faster than you are actually driving, artificially aging your vehicle and killing its resale value.</p>

            <h2 className="text-2xl font-bold mb-3">The Real-World Consequences</h2>
            <p>An inaccurate odometer causes several cascading issues beyond just a false reading on the dashboard. Because the speedometer uses the exact same rotational data, your speedometer will also be incorrect. If you install larger tires, your speedometer will say you are driving 65 MPH when you are actually traveling 75 MPH, making it incredibly easy to get a speeding ticket. Furthermore, because your vehicle's MPG computer uses the odometer data to calculate efficiency, your dashboard will incorrectly tell you that your fuel economy has plummeted.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/odometer-correction-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
