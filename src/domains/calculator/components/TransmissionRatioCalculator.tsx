"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Gauge, RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface RatioResults {
  speedMph: number;
  speedKmh: number;
  totalReduction: number;
  tireCircumferenceIn: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateSpeed = (inputs: typeof DEFAULTS): RatioResults => {
  const rpm = parseFloat(inputs.rpm);
  const gearRatio = parseFloat(inputs.gearRatio);
  const finalDrive = parseFloat(inputs.finalDrive);
  const tireDiameter = parseFloat(inputs.tireDiameter);

  if (isNaN(rpm) || rpm <= 0 || isNaN(gearRatio) || gearRatio <= 0 || isNaN(finalDrive) || finalDrive <= 0 || isNaN(tireDiameter) || tireDiameter <= 0) {
    return {
      speedMph: 0, speedKmh: 0, totalReduction: 0, tireCircumferenceIn: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "All inputs must be valid positive numbers."
    };
  }

  // Total Reduction Ratio = Transmission Gear Ratio * Final Drive Ratio (Differential)
  const totalReduction = gearRatio * finalDrive;

  // Tire Circumference
  const tireCircumferenceIn = tireDiameter * Math.PI;

  // Wheel RPM = Engine RPM / Total Reduction
  const wheelRpm = rpm / totalReduction;

  // Speed (Inches per minute) = Wheel RPM * Tire Circumference
  const inchesPerMinute = wheelRpm * tireCircumferenceIn;

  // MPH = (Inches/min * 60) / 63360 (inches in a mile)
  const speedMph = (inchesPerMinute * 60) / 63360;
  const speedKmh = speedMph * 1.60934;

  // Generate chart data: RPM vs Speed from 1000 to 8000 RPM
  const chartData = [];
  const schedule = [];
  
  for (let r = 1000; r <= 8000; r += 500) {
    const wRpm = r / totalReduction;
    const ipm = wRpm * tireCircumferenceIn;
    const mph = (ipm * 60) / 63360;
    
    chartData.push({
      "Engine RPM": r,
      "Vehicle Speed (MPH)": Math.round(mph * 10) / 10
    });
    
    if (r % 1000 === 0) {
      schedule.push({
        rpm: r,
        mph: Number(mph.toFixed(1)),
        kmh: Number((mph * 1.60934).toFixed(1))
      });
    }
  }

  return {
    speedMph: Number(speedMph.toFixed(1)),
    speedKmh: Number(speedKmh.toFixed(1)),
    totalReduction: Number(totalReduction.toFixed(3)),
    tireCircumferenceIn: Number(tireCircumferenceIn.toFixed(1)),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  rpm: "3000",
  gearRatio: "1.00", // 1:1 is typically 4th gear
  finalDrive: "3.73", // Common rear diff ratio
  tireDiameter: "26.5" // Typical passenger car tire height
};

const CompactInput = ({ id, label, value, onChange, placeholder, suffix, step }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" step={step || "any"} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function TransmissionRatioCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<RatioResults>(calculateSpeed(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateSpeed(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateSpeed(DEFAULTS));
  };

  const faqs = [
    { question: "What does a Transmission Gear Ratio mean?", answer: "A gear ratio represents how many times the input shaft (connected to the engine) must turn to rotate the output shaft (connected to the driveshaft) exactly one time. A ratio of 3.00:1 means the engine turns 3 times for every 1 turn of the driveshaft (multiplying torque but reducing speed). A ratio of 1.00:1 is a direct drive (usually 4th gear). A ratio of 0.70:1 is an overdrive gear, where the driveshaft spins faster than the engine (saving fuel at highway speeds)." },
    { question: "What is a Final Drive or Differential Ratio?", answer: "After power leaves the transmission, it travels down the driveshaft to the differential (the pumpkin on the rear axle). The differential contains a ring and pinion gear set that creates a second layer of gear reduction before the power reaches the wheels. A common ratio is 3.73:1, meaning the driveshaft must spin 3.73 times to rotate the tires exactly once." },
    { question: "What is the Total Reduction Ratio?", answer: "The Total Reduction Ratio is the mathematical combination of your transmission gear and your rear differential. You calculate it by multiplying the two ratios together. If your transmission is in 1st gear (3.00:1) and your rear diff is 4.10:1, your Total Reduction is 12.3:1. The engine must turn 12.3 times to rotate the tire once." },
    { question: "How does Tire Diameter affect speed?", answer: "Your engine and transmission determine how fast the axle rotates (Wheel RPM), but the tire diameter determines how much physical ground is covered per rotation. A taller tire covers more ground per revolution. Therefore, if you install larger tires without changing your gear ratios, your vehicle will travel faster at the same engine RPM (but you will lose acceleration torque)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Transmission Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Transmission Ratio Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Calculate exactly how fast your vehicle will travel at a specific engine RPM based on your gear and differential ratios.</p>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="rpm" label="Engine Speed" value={inputs.rpm} onChange={(v: string) => handleChange("rpm", v)} suffix="RPM" placeholder="3000" />
              <CompactInput id="tire" label="Tire Diameter" value={inputs.tireDiameter} onChange={(v: string) => handleChange("tireDiameter", v)} suffix="in" placeholder="26.5" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Drivetrain Gearing</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="gear" label="Trans Gear Ratio" value={inputs.gearRatio} onChange={(v: string) => handleChange("gearRatio", v)} suffix=": 1" placeholder="1.00" step="0.01" />
              <CompactInput id="diff" label="Final Drive (Diff) Ratio" value={inputs.finalDrive} onChange={(v: string) => handleChange("finalDrive", v)} suffix=": 1" placeholder="3.73" step="0.01" />
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
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Vehicle Speed at {inputs.rpm} RPM</div>
                  <div className="flex items-end gap-3 mb-1">
                    <div className="text-7xl font-black text-primary tracking-tighter">{results.speedMph}</div>
                    <div className="text-2xl font-bold text-primary mb-1">MPH</div>
                  </div>
                  <div className="text-sm font-medium mt-2 text-foreground">
                    Or <strong className="text-primary">{results.speedKmh} km/h</strong> based on a total gear reduction of {results.totalReduction}:1.
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Trans Ratio</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.gearRatio}:1</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Differential</div>
                    <div className="text-2xl font-bold text-foreground">{inputs.finalDrive}:1</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Reduction</div>
                    <div className="text-2xl font-bold text-blue-500">{results.totalReduction}:1</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Speed Curve (Current Gear)</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Engine RPM" tickFormatter={(val) => `${val}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} type="number" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val} MPH`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                        <ReferenceLine x={parseFloat(inputs.rpm)} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'top', value: 'Target RPM', fill: 'hsl(var(--primary))', fontSize: 12, fontWeight: 'bold' }} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} MPH`, 'Speed']}
                          labelFormatter={(label) => `Engine RPM: ${label}`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Line type="monotone" dataKey="Vehicle Speed (MPH)" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 3, fill: 'var(--background)', strokeWidth: 2}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">RPM to Speed Matrix</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Engine RPM</th>
                          <th className="px-4 py-3 font-semibold text-right">Speed (MPH)</th>
                          <th className="px-4 py-3 font-semibold text-right">Speed (km/h)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.rpm} className={`hover:bg-muted/20 transition-colors ${row.rpm == inputs.rpm ? 'bg-primary/5 font-medium' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.rpm} RPM</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">{row.mph}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">{row.kmh}</td>
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
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Vehicle Speed</h2>
            <p>Have you ever wondered exactly how fast your car will go if you bounce it off the 7,000 RPM rev limiter in 4th gear? Or maybe you are planning to install massive 35-inch off-road tires and want to know how badly it will affect your highway cruising RPM. The Transmission Ratio Calculator removes the guesswork by applying strict mechanical physics to your drivetrain specifications. By linking your engine's rotational speed (RPM) to the physical circumference of your tires through a series of gear reductions, this tool calculates your exact road velocity.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding the Total Reduction Ratio</h2>
            <p>The power generated by your engine does not go directly to the wheels; it must pass through two major sets of gears first:</p>
            <ul>
              <li><strong>The Transmission (Gearbox):</strong> A transmission contains multiple gear sets. 1st gear has a high ratio (e.g., 3.00:1) to multiply torque and get the heavy car moving from a dead stop. 4th gear is usually a direct 1.00:1 ratio. 5th and 6th gears are usually "overdrive" ratios (e.g., 0.70:1), meaning the output shaft spins faster than the engine to save fuel on the highway.</li>
              <li><strong>The Differential (Final Drive):</strong> Located on the rear axle (or inside a front transaxle), the differential contains a ring and pinion gear that permanently multiplies torque one final time before it reaches the wheels. Common ratios are 3.08, 3.55, 3.73, and 4.10.</li>
            </ul>
            <p>If you multiply your current transmission gear ratio by your differential ratio, you get the <strong>Total Reduction Ratio</strong>. This tells you exactly how many times the engine must rotate to spin the wheels exactly one time.</p>

            <h2 className="text-2xl font-bold mb-3">How Tire Diameter Changes Your Gearing</h2>
            <p>Gears handle the rotational math, but the tires handle the physical distance. A tire with a 26.5-inch diameter has a physical circumference of roughly 83.2 inches. This means every time the wheel completes one full rotation, the car moves exactly 83.2 inches forward. </p>
            <p>If you install larger 30-inch tires on a truck, the circumference jumps to 94.2 inches. Because the new tire covers significantly more ground per rotation, the truck will travel faster at the same engine RPM. However, because the larger tire acts as a longer physical lever against the axle, the engine will have to work much harder to turn it, resulting in a noticeable loss of acceleration and torque. This is why off-road enthusiasts must install higher numerically (shorter) differential gears (like a 4.56 or 4.88) to compensate for massive tires and regain their acceleration.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/transmission-ratio-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
