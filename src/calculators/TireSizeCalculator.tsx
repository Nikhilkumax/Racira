"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, RefreshCw, Car, Ruler } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface TireDimensions {
  widthMm: number;
  widthIn: number;
  sidewallIn: number;
  diameterIn: number;
  circumferenceIn: number;
  revsPerMile: number;
}

interface TireComparisonResults {
  tire1: TireDimensions;
  tire2: TireDimensions;
  diameterDiff: number;
  diameterDiffPct: number;
  widthDiff: number;
  speedoError: number; // if speedo reads 60mph, actual speed is this
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateTireSize = (inputs: typeof DEFAULTS): TireComparisonResults => {
  const parseTire = (wStr: string, arStr: string, dStr: string): TireDimensions | null => {
    const w = parseFloat(wStr);
    const ar = parseFloat(arStr);
    const d = parseFloat(dStr);
    if (!w || !ar || !d || w <= 0 || ar <= 0 || d <= 0) return null;

    const widthIn = w / 25.4;
    const sidewallIn = (w * (ar / 100)) / 25.4;
    const diameterIn = d + (sidewallIn * 2);
    const circumferenceIn = diameterIn * Math.PI;
    const revsPerMile = 63360 / circumferenceIn;

    return {
      widthMm: w,
      widthIn,
      sidewallIn,
      diameterIn,
      circumferenceIn,
      revsPerMile
    };
  };

  const t1 = parseTire(inputs.t1Width, inputs.t1Ratio, inputs.t1Wheel);
  const t2 = parseTire(inputs.t2Width, inputs.t2Ratio, inputs.t2Wheel);

  if (!t1 || !t2) {
    return {
      tire1: { widthMm: 0, widthIn: 0, sidewallIn: 0, diameterIn: 0, circumferenceIn: 0, revsPerMile: 0 },
      tire2: { widthMm: 0, widthIn: 0, sidewallIn: 0, diameterIn: 0, circumferenceIn: 0, revsPerMile: 0 },
      diameterDiff: 0, diameterDiffPct: 0, widthDiff: 0, speedoError: 0,
      chartData: [], isError: true, errorMsg: "Please enter valid tire dimensions."
    };
  }

  const diameterDiff = t2.diameterIn - t1.diameterIn;
  const diameterDiffPct = (diameterDiff / t1.diameterIn) * 100;
  const widthDiff = t2.widthIn - t1.widthIn;
  
  // Speedo error: if car thinks it's doing 60mph on Tire 1, how fast is it actually going on Tire 2?
  // V2 = V1 * (C2 / C1)
  const speedoError = 60 * (t2.circumferenceIn / t1.circumferenceIn);

  const chartData = [
    {
      metric: "Diameter (in)",
      "Tire 1": parseFloat(t1.diameterIn.toFixed(2)),
      "Tire 2": parseFloat(t2.diameterIn.toFixed(2)),
    },
    {
      metric: "Width (in)",
      "Tire 1": parseFloat(t1.widthIn.toFixed(2)),
      "Tire 2": parseFloat(t2.widthIn.toFixed(2)),
    },
    {
      metric: "Sidewall (in)",
      "Tire 1": parseFloat(t1.sidewallIn.toFixed(2)),
      "Tire 2": parseFloat(t2.sidewallIn.toFixed(2)),
    }
  ];

  return {
    tire1: t1,
    tire2: t2,
    diameterDiff,
    diameterDiffPct,
    widthDiff,
    speedoError,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  t1Width: "225",
  t1Ratio: "45",
  t1Wheel: "18",
  t2Width: "245",
  t2Ratio: "40",
  t2Wheel: "18",
};

const CompactInput = ({ id, label, value, onChange, placeholder }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
    </div>
  </div>
);

// 4. Component
export default function TireSizeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<TireComparisonResults>(calculateTireSize(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change since it's fast
    const r = calculateTireSize(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateTireSize(DEFAULTS));
  };

  const format2 = (val: number) => val.toFixed(2);
  const format1 = (val: number) => val.toFixed(1);

  const isSignificantChange = Math.abs(results.diameterDiffPct) > 3;

  const faqs = [
    { question: "How do I read a tire size? (e.g., 225/45R18)", answer: "The first number (225) is the tread width in millimeters. The second number (45) is the aspect ratio, meaning the sidewall height is 45% of the tread width. The letter 'R' stands for Radial construction. The last number (18) is the wheel/rim diameter in inches." },
    { question: "Why is a 3% diameter difference the safe limit?", answer: "Modern vehicles rely heavily on the precise rotational speed of the wheels to calculate ABS braking, traction control, stability control, and transmission shift points. Changing the tire diameter by more than 3% alters the rotational speed enough that these critical safety systems may malfunction or trigger warning lights." },
    { question: "How does changing tire size affect my speedometer?", answer: "Your speedometer is calibrated to the factory tire circumference. If you install larger (taller) tires, you cover more ground per revolution than the car thinks. Your speedometer will read 60 mph, but you might actually be traveling 65 mph, putting you at risk of speeding tickets." },
    { question: "What is 'Plus Sizing'?", answer: "Plus sizing means installing larger diameter wheels (rims) while simultaneously reducing the sidewall height (aspect ratio) of the tire so that the overall diameter remains identical to the factory setup. This improves handling by stiffening the sidewall, while maintaining speedometer accuracy." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Tire Size Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tire Size Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 text-primary">Tire 1 (OEM / Current)</div>
            <div className="grid grid-cols-3 gap-3">
              <CompactInput id="t1w" label="Width" value={inputs.t1Width} onChange={(v: string) => handleChange("t1Width", v)} placeholder="225" />
              <CompactInput id="t1r" label="Ratio" value={inputs.t1Ratio} onChange={(v: string) => handleChange("t1Ratio", v)} placeholder="45" />
              <CompactInput id="t1d" label="Wheel" value={inputs.t1Wheel} onChange={(v: string) => handleChange("t1Wheel", v)} placeholder="18" />
            </div>

            <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mt-4 text-emerald-600 dark:text-emerald-500">Tire 2 (New / Alternate)</div>
            <div className="grid grid-cols-3 gap-3">
              <CompactInput id="t2w" label="Width" value={inputs.t2Width} onChange={(v: string) => handleChange("t2Width", v)} placeholder="245" />
              <CompactInput id="t2r" label="Ratio" value={inputs.t2Ratio} onChange={(v: string) => handleChange("t2Ratio", v)} placeholder="40" />
              <CompactInput id="t2d" label="Wheel" value={inputs.t2Wheel} onChange={(v: string) => handleChange("t2Wheel", v)} placeholder="18" />
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-10 transition-colors flex items-center justify-center gap-2 focus:outline-none">
                <RefreshCw className="h-4 w-4" /> Reset Inputs
              </button>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg border border-border mt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">How to read</h4>
              <p className="text-sm text-foreground">Format: <strong>Width / Ratio R Wheel</strong></p>
              <p className="text-xs text-muted-foreground mt-1">Example: <strong>225 / 45 R 18</strong></p>
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
                <div className={`border-l-4 rounded-lg p-5 relative overflow-hidden ${isSignificantChange ? 'bg-destructive/10 border-destructive' : 'bg-primary/10 border-primary'}`}>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Diameter Difference</div>
                  <div className="flex items-end gap-2 mb-2">
                    <div className={`text-4xl font-bold ${isSignificantChange ? 'text-destructive' : 'text-primary'}`}>
                      {results.diameterDiffPct > 0 ? '+' : ''}{format2(results.diameterDiffPct)}%
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${isSignificantChange ? 'text-destructive' : 'text-foreground'}`}>
                    {isSignificantChange 
                      ? "⚠️ WARNING: Difference exceeds the 3% safe limit. This may cause brake failure, ABS issues, or rub against the fenders." 
                      : "✅ Safe. Difference is within the acceptable 3% tolerance limit."}
                  </div>
                </div>

                {/* 2. 3-Stat Bar (Speedometer) */}
                <div className="flex bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="flex-1 p-4 flex flex-col items-center justify-center">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Speedo Reading</div>
                    <div className="text-2xl font-bold text-foreground">60 mph</div>
                  </div>
                  <div className="w-[1px] bg-border my-2"></div>
                  <div className="flex-1 p-4 flex flex-col items-center justify-center bg-muted/10">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Actual Speed</div>
                    <div className="text-3xl font-bold text-primary">{format1(results.speedoError)} mph</div>
                    <div className="text-xs text-muted-foreground mt-1">on Tire 2</div>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Detailed Comparison</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Specification</th>
                          <th className="px-4 py-3 font-semibold text-right">Tire 1</th>
                          <th className="px-4 py-3 font-semibold text-right text-emerald-600 dark:text-emerald-500">Tire 2</th>
                          <th className="px-4 py-3 font-semibold text-right">Difference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">Diameter</td>
                          <td className="px-4 py-3 text-right">{format2(results.tire1.diameterIn)}"</td>
                          <td className="px-4 py-3 text-right font-semibold">{format2(results.tire2.diameterIn)}"</td>
                          <td className="px-4 py-3 text-right font-medium">{results.diameterDiff > 0 ? '+' : ''}{format2(results.diameterDiff)}"</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">Width</td>
                          <td className="px-4 py-3 text-right">{format2(results.tire1.widthIn)}" ({results.tire1.widthMm}mm)</td>
                          <td className="px-4 py-3 text-right font-semibold">{format2(results.tire2.widthIn)}" ({results.tire2.widthMm}mm)</td>
                          <td className="px-4 py-3 text-right font-medium">{results.widthDiff > 0 ? '+' : ''}{format2(results.widthDiff)}"</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">Sidewall Height</td>
                          <td className="px-4 py-3 text-right">{format2(results.tire1.sidewallIn)}"</td>
                          <td className="px-4 py-3 text-right font-semibold">{format2(results.tire2.sidewallIn)}"</td>
                          <td className="px-4 py-3 text-right font-medium">{format2(results.tire2.sidewallIn - results.tire1.sidewallIn)}"</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">Circumference</td>
                          <td className="px-4 py-3 text-right">{format2(results.tire1.circumferenceIn)}"</td>
                          <td className="px-4 py-3 text-right font-semibold">{format2(results.tire2.circumferenceIn)}"</td>
                          <td className="px-4 py-3 text-right font-medium">{format2(results.tire2.circumferenceIn - results.tire1.circumferenceIn)}"</td>
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors bg-muted/5">
                          <td className="px-4 py-3 font-medium text-foreground">Revolutions / Mile</td>
                          <td className="px-4 py-3 text-right">{format0(results.tire1.revsPerMile)}</td>
                          <td className="px-4 py-3 text-right font-semibold">{format0(results.tire2.revsPerMile)}</td>
                          <td className="px-4 py-3 text-right font-medium">{format0(results.tire2.revsPerMile - results.tire1.revsPerMile)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Dimensional Comparison</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="metric" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', marginTop: '10px' }} />
                        <Bar dataKey="Tire 1" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        <Bar dataKey="Tire 2" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Why Use a Tire Size Calculator?</h2>
            <p>A Tire Size Calculator is an essential diagnostic tool for anyone looking to replace their factory tires with aftermarket alternatives, upgrade their wheel rims ("plus sizing"), or install a suspension lift kit. Modifying tire dimensions alters the geometry of your vehicle. This calculator instantly processes the complex metric-to-imperial conversions embedded in tire codes to reveal the exact physical changes in width, diameter, and circumference.</p>

            <h2>The 3% Safety Rule</h2>
            <p>When swapping tires, the golden rule of automotive engineering is to stay within 3% of the factory overall diameter. Why? Modern cars are essentially rolling computers. The Anti-lock Braking System (ABS), Traction Control System (TCS), Electronic Stability Program (ESP), and automatic transmission shift maps all rely on mathematically predicting how fast the wheels are rotating relative to the road. If you increase tire diameter by more than 3%, you alter the rotational speed so drastically that these safety systems can fail or trigger dashboard warning lights.</p>

            <h2>How Tire Sizing Affects Your Speedometer</h2>
            <p>Your vehicle's speedometer does not actually measure how fast you are moving across the ground; it measures how fast the transmission output shaft is spinning, which correlates to the circumference of your factory tires. If you install larger diameter tires, your car will travel further per revolution than the computer expects. For example, if you increase your tire diameter by 10%, your speedometer might read 60 mph, but you are physically traveling 66 mph. Our calculator precisely models this Speedometer Error to protect you from accidental speeding tickets.</p>

            <h2>Understanding "Plus Sizing"</h2>
            <p>Plus sizing is the practice of installing larger diameter wheels (e.g., swapping 18-inch wheels for 20-inch wheels) without changing the overall diameter of the tire assembly. To achieve this, you must buy tires with a significantly smaller aspect ratio (a "lower profile" sidewall). A correct "Plus 2" setup ensures that the overall diameter remains mathematically identical to the OEM setup. This stiffens the sidewall for improved cornering performance while maintaining exact speedometer and ABS calibration.</p>

            <h2>Performance Impacts of Wider Tires</h2>
            <p>Increasing the section width of your tires (the first number in the tire code, e.g., moving from 225 to 245) increases the contact patch with the road. This generally improves dry traction and cornering grip. However, wider tires are heavier, which increases unsprung mass and rotational inertia. This can negatively impact acceleration, increase fuel consumption, and make the steering feel heavier. Furthermore, excessively wide tires are prone to "hydroplaning" on wet roads because they distribute the vehicle's weight over a larger area, reducing the pressure needed to slice through standing water.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tire-size-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}

const format0 = (val: number) => val.toFixed(0);
