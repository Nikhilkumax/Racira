"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Gauge, RotateCcw, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript interfaces
interface SpeedoResults {
  actualSpeedAt60: number;
  speedDifferencePct: number;
  diameterDiffPct: number;
  factoryDiameter: number;
  newDiameter: number;
  isDangerous: boolean;
  dangerMessage: string;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateSpeedoError = (inputs: typeof DEFAULTS): SpeedoResults => {
  const parseTire = (wStr: string, arStr: string, dStr: string) => {
    const w = parseFloat(wStr);
    const ar = parseFloat(arStr);
    const d = parseFloat(dStr);
    if (!w || !ar || !d || w <= 0 || ar <= 0 || d <= 0) return null;

    const sidewallIn = (w * (ar / 100)) / 25.4;
    const diameterIn = d + (sidewallIn * 2);
    const circumferenceIn = diameterIn * Math.PI;
    return { diameterIn, circumferenceIn };
  };

  const t1 = parseTire(inputs.t1Width, inputs.t1Ratio, inputs.t1Wheel);
  const t2 = parseTire(inputs.t2Width, inputs.t2Ratio, inputs.t2Wheel);

  if (!t1 || !t2) {
    return {
      actualSpeedAt60: 0, speedDifferencePct: 0, diameterDiffPct: 0, factoryDiameter: 0, newDiameter: 0,
      isDangerous: false, dangerMessage: "",
      chartData: [], schedule: [], isError: true, errorMsg: "Please enter valid tire dimensions."
    };
  }

  const diameterDiffPct = ((t2.diameterIn - t1.diameterIn) / t1.diameterIn) * 100;
  
  // Speedo error: if car thinks it's doing X, how fast is it actually going?
  // V_actual = V_speedo * (Circumference2 / Circumference1)
  const ratio = t2.circumferenceIn / t1.circumferenceIn;
  const actualSpeedAt60 = 60 * ratio;
  const speedDifferencePct = ((actualSpeedAt60 - 60) / 60) * 100;

  // Generate table and chart from 10 to 100 mph
  const chartData = [];
  const schedule = [];
  for (let speedo = 10; speedo <= 100; speedo += 10) {
    const actual = speedo * ratio;
    const diff = actual - speedo;
    chartData.push({
      "Speedometer Reading": speedo,
      "Actual Speed": parseFloat(actual.toFixed(1))
    });
    schedule.push({
      speedo,
      actual,
      diff
    });
  }

  const isDangerous = Math.abs(diameterDiffPct) > 3;
  let dangerMessage = "";
  if (isDangerous) {
    dangerMessage = "Tire size difference exceeds the safe 3% threshold. This will drastically skew your speedometer and may interfere with ABS braking systems.";
  }

  return {
    actualSpeedAt60,
    speedDifferencePct,
    diameterDiffPct,
    factoryDiameter: t1.diameterIn,
    newDiameter: t2.diameterIn,
    isDangerous,
    dangerMessage,
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  t1Width: "245",
  t1Ratio: "40",
  t1Wheel: "19",
  t2Width: "275",
  t2Ratio: "40",
  t2Wheel: "19",
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
export default function SpeedometerErrorCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<SpeedoResults>(calculateSpeedoError(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateSpeedoError(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateSpeedoError(DEFAULTS));
  };

  const format1 = (val: number) => val.toFixed(1);
  const format2 = (val: number) => val.toFixed(2);

  const isReadingSlow = results.actualSpeedAt60 > 60; // Actual speed > speedo = reading slow = dangerous (speeding tickets)

  const faqs = [
    { question: "Why does changing tire size affect my speedometer?", answer: "Your vehicle's speedometer is calibrated to the exact circumference of the factory-installed tires. The computer calculates your speed by counting how many times the axles rotate per minute. If you install larger (taller) tires, your vehicle covers more ground per revolution than the computer expects, causing the speedometer to read a slower speed than you are actually traveling." },
    { question: "Can a tire shop fix my speedometer?", answer: "In many modern vehicles, yes. A mechanic or dealership can access the vehicle's Engine Control Unit (ECU) via the OBD-II port and recalibrate the tire size parameter. This tells the computer the new circumference, instantly fixing the speedometer error. However, some manufacturers lock this setting." },
    { question: "How does a speedometer error affect my odometer?", answer: "The odometer and speedometer use the exact same rotational data. If your speedometer reads 10% too slow because you installed larger tires, your odometer is also recording 10% fewer miles than you are actually driving. While this sounds like a great way to keep mileage low, it is technically odometer fraud if you sell the car without disclosing it." },
    { question: "Is it dangerous to have a 5 mph speedometer error?", answer: "Yes, primarily legally. If your speedometer reads 65 mph but you are actually traveling 70 mph, you are at a high risk of receiving a speeding ticket. Furthermore, drastically altering tire diameter without recalibration can confuse the Anti-lock Braking System (ABS) and Electronic Stability Program (ESP), as they detect wheel speeds that do not align with factory parameters." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Speedometer Error Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Speedometer Error Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Determine exactly how much your new aftermarket tires will throw off your factory speedometer calibration.</p>

            <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 text-primary">Factory Tires</div>
            <div className="grid grid-cols-3 gap-3">
              <CompactInput id="t1w" label="Width" value={inputs.t1Width} onChange={(v: string) => handleChange("t1Width", v)} placeholder="245" />
              <CompactInput id="t1r" label="Ratio" value={inputs.t1Ratio} onChange={(v: string) => handleChange("t1Ratio", v)} placeholder="40" />
              <CompactInput id="t1d" label="Wheel" value={inputs.t1Wheel} onChange={(v: string) => handleChange("t1Wheel", v)} placeholder="19" />
            </div>

            <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mt-4 text-emerald-600 dark:text-emerald-500">New Tires</div>
            <div className="grid grid-cols-3 gap-3">
              <CompactInput id="t2w" label="Width" value={inputs.t2Width} onChange={(v: string) => handleChange("t2Width", v)} placeholder="275" />
              <CompactInput id="t2r" label="Ratio" value={inputs.t2Ratio} onChange={(v: string) => handleChange("t2Ratio", v)} placeholder="40" />
              <CompactInput id="t2d" label="Wheel" value={inputs.t2Wheel} onChange={(v: string) => handleChange("t2Wheel", v)} placeholder="19" />
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset Calculator
              </button>
            </div>

            {results.isDangerous && (
              <div className="mt-2 bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-destructive">Calibration Warning</div>
                  <div className="text-sm text-foreground">{results.dangerMessage}</div>
                </div>
              </div>
            )}
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
                <div className={`border-l-4 rounded-lg p-6 relative overflow-hidden ${isReadingSlow ? 'bg-orange-500/10 border-orange-500' : 'bg-primary/10 border-primary'}`}>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">When Speedometer reads 60 mph</div>
                  <div className="flex items-end gap-3 mb-1">
                    <div className="text-xs font-bold uppercase text-muted-foreground mb-2">You are actually traveling:</div>
                  </div>
                  <div className="flex items-end gap-3 mb-1">
                    <div className={`text-6xl font-black tracking-tighter ${isReadingSlow ? 'text-orange-500' : 'text-primary'}`}>
                      {format1(results.actualSpeedAt60)}
                    </div>
                    <div className="text-2xl font-bold text-muted-foreground mb-1">mph</div>
                  </div>
                  <div className="text-sm font-medium mt-2 text-foreground">
                    {isReadingSlow 
                      ? "⚠️ Your speedometer is reading too slow. You risk getting a speeding ticket." 
                      : "✅ Your speedometer is reading faster than you are actually traveling. Safe from tickets."}
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Factory Diameter</div>
                    <div className="text-2xl font-bold text-foreground">{format2(results.factoryDiameter)}"</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">New Diameter</div>
                    <div className="text-2xl font-bold text-foreground">{format2(results.newDiameter)}"</div>
                  </div>
                  <div className={`bg-card border-2 rounded-lg p-4 text-center shadow-sm ${results.isDangerous ? 'border-destructive/30' : 'border-emerald-500/30'}`}>
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Diameter Diff</div>
                    <div className={`text-2xl font-bold ${results.isDangerous ? 'text-destructive' : 'text-emerald-500'}`}>
                      {results.diameterDiffPct > 0 ? '+' : ''}{format2(results.diameterDiffPct)}%
                    </div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Speedometer Deviation Curve</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Speedometer Reading" tickFormatter={(val) => `${val} mph`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val} mph`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => [`${value} mph`, name]}
                          labelFormatter={(label) => `Speedo reads: ${label} mph`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', marginTop: '10px' }} />
                        <Line type="monotone" dataKey="Actual Speed" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: 'var(--background)', strokeWidth: 2}} activeDot={{r: 6}} />
                        <Line type="monotone" dataKey="Speedometer Reading" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeWidth={2} dot={false} activeDot={false} name="Perfect Calibration" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Calibration Matrix</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Speedo Reads</th>
                          <th className="px-4 py-3 font-semibold text-right text-blue-500">Actual Speed</th>
                          <th className="px-4 py-3 font-semibold text-right">Error Margin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.speedo} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{row.speedo} mph</td>
                            <td className="px-4 py-3 text-right text-blue-500 font-bold">{format1(row.actual)} mph</td>
                            <td className={`px-4 py-3 text-right font-medium ${row.diff > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
                              {row.diff > 0 ? '+' : ''}{format1(row.diff)} mph
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
          <article className="prose-finance text-[15.75px]">
            <h2>What Causes Speedometer Error?</h2>
            <p>Your vehicle's speedometer is calibrated at the factory to match the exact circumference of the original equipment (OEM) tires. When you drive, a speed sensor located in the transmission or wheel hub counts the number of revolutions per minute. The vehicle's computer multiplies these revolutions by the factory tire circumference to calculate your speed. If you replace your tires with a different size, you alter the circumference, completely destroying the mathematical foundation of your speedometer's accuracy. Our Speedometer Error Calculator instantly reveals how far off your dash reading is from reality.</p>

            <h2>The Danger of Oversized Tires</h2>
            <p>If you install larger (taller) tires than what came from the factory—a common modification for trucks, Jeeps, and SUVs—your new tires have a larger circumference. This means they travel farther across the asphalt with every single revolution. The speed sensor counts the same number of revolutions, but you are physically covering more ground. As a result, your speedometer will read <strong>slower</strong> than you are actually traveling. You might think you are cruising exactly at the 65 mph speed limit, but a radar gun will show you doing 72 mph, leading to an expensive speeding ticket.</p>

            <h2>The Effect of Undersized Tires</h2>
            <p>Conversely, if you install smaller (shorter) tires—or low-profile tires without increasing wheel size—the tires have a smaller circumference. They must rotate more times to cover the same distance. Your computer counts extra revolutions and thinks you are driving fast. Your speedometer will read <strong>faster</strong> than you are actually traveling. While this won't get you a speeding ticket, it is incredibly frustrating for highway driving and artificially inflates the mileage recorded on your odometer.</p>

            <h2>How Speedometer Error Scales</h2>
            <p>Speedometer error is not a fixed number; it is a percentage. If your new tires are 10% larger in circumference, your speedometer is off by 10%. At 10 mph, you are only off by 1 mph. However, at 70 mph, that same 10% error means you are physically traveling 77 mph. As you drive faster, the absolute error gap widens significantly, which is clearly visualized in our Speedometer Deviation Curve chart.</p>

            <h2>How to Fix Your Speedometer Calibration</h2>
            <p>You do not have to live with a broken speedometer. Modern vehicles use electronic speed sensors rather than mechanical cables. An automotive shop, dealership, or even a handheld aftermarket tuner (like a Flashcal) can plug into your vehicle's OBD-II diagnostic port. They simply update the Tire Size parameter in the Engine Control Unit (ECU) with the new circumference data, instantly restoring the accuracy of both your speedometer and odometer, and ensuring your Anti-lock Braking System (ABS) functions safely.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/speedometer-error-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
