"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Link2, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

// 1. TypeScript interfaces
interface TongueResults {
  minWeight: number;
  maxWeight: number;
  targetWeight: number; // The sweet spot
  targetPercentage: number;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateTongue = (inputs: typeof DEFAULTS): TongueResults => {
  const trailerWeight = parseFloat(inputs.trailerWeight);
  const hitchType = inputs.hitchType;

  if (isNaN(trailerWeight) || trailerWeight <= 0) {
    return {
      minWeight: 0, maxWeight: 0, targetWeight: 0, targetPercentage: 0,
      chartData: [], isError: true, errorMsg: "Trailer weight must be a valid positive number."
    };
  }

  // Determine percentage range based on hitch type
  // Conventional: 10% - 15% (Target ~12%)
  // Gooseneck / 5th Wheel: 15% - 25% (Target ~20%)
  let minPct = 0.10;
  let maxPct = 0.15;
  let targetPct = 0.12;

  if (hitchType === "fifth_wheel" || hitchType === "gooseneck") {
    minPct = 0.15;
    maxPct = 0.25;
    targetPct = 0.20;
  }

  const minWeight = trailerWeight * minPct;
  const maxWeight = trailerWeight * maxPct;
  const targetWeight = trailerWeight * targetPct;

  // Generate chart data: Show the safe zone vs the danger zones
  const chartData = [
    {
      name: "Danger: Sway",
      Weight: Math.round(trailerWeight * (minPct - 0.05)),
      fill: "hsl(var(--destructive))"
    },
    {
      name: "Safe Minimum",
      Weight: Math.round(minWeight),
      fill: "hsl(var(--orange-500))"
    },
    {
      name: "Ideal Target",
      Weight: Math.round(targetWeight),
      fill: "hsl(var(--primary))"
    },
    {
      name: "Safe Maximum",
      Weight: Math.round(maxWeight),
      fill: "hsl(var(--orange-500))"
    },
    {
      name: "Danger: Overload",
      Weight: Math.round(trailerWeight * (maxPct + 0.05)),
      fill: "hsl(var(--destructive))"
    }
  ];

  return {
    minWeight: Math.round(minWeight),
    maxWeight: Math.round(maxWeight),
    targetWeight: Math.round(targetWeight),
    targetPercentage: targetPct * 100,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  trailerWeight: "7000", // A medium-large travel trailer
  hitchType: "conventional" // "conventional", "fifth_wheel", "gooseneck"
};

const CompactInput = ({ id, label, value, onChange, placeholder, suffix, options }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {options ? (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium">
          {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input id={id} type="number" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function TrailerTongueWeightCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<TongueResults>(calculateTongue(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateTongue(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateTongue(DEFAULTS));
  };

  const faqs = [
    { question: "What is Tongue Weight?", answer: "Tongue weight is the downward physical force that the tongue of the trailer applies to the hitch of the tow vehicle. If you disconnect the trailer from the truck and rest the front of the trailer on a standard bathroom scale, the number on the scale is the tongue weight." },
    { question: "Why is Tongue Weight so important?", answer: "It is the single most critical factor in towing safely. If the tongue weight is too low, the trailer acts like a seesaw, lifting the rear tires of the truck off the ground and causing terrifying, uncontrollable trailer sway. If the tongue weight is too high, it violently pushes the rear of the truck down, lifting the front steering tires into the air, making the truck impossible to steer or brake." },
    { question: "How do I change the Tongue Weight?", answer: "You change the tongue weight by shifting cargo inside the trailer. To increase tongue weight, move heavy items toward the front of the trailer (closer to the truck). To decrease tongue weight, move heavy items behind the axles (toward the back bumper of the trailer)." },
    { question: "What is the correct percentage?", answer: "For a standard conventional bumper-pull trailer, the tongue weight must be between 10% and 15% of the total loaded trailer weight. For a 5th Wheel or Gooseneck trailer (which mounts over the rear axle of the truck), the tongue weight should be between 15% and 25%." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Trailer Tongue Weight Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Trailer Tongue Weight Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Determine the required downward force your trailer must apply to the hitch to prevent dangerous swaying or steering loss.</p>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="weight" label="Total Loaded Trailer Weight" value={inputs.trailerWeight} onChange={(v: string) => handleChange("trailerWeight", v)} suffix="lbs" placeholder="7000" />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <CompactInput id="hitch" label="Hitch Connection Type" value={inputs.hitchType} onChange={(v: string) => handleChange("hitchType", v)} options={[
                { label: "Conventional (Bumper Pull)", value: "conventional" },
                { label: "Fifth-Wheel (Bed Mount)", value: "fifth_wheel" },
                { label: "Gooseneck (Bed Mount)", value: "gooseneck" }
              ]} />
            </div>

            <div className="text-[10px] text-muted-foreground mt-2">
              * Note: For bumper-pull trailers, engineers mandate that 10-15% of the total weight must rest on the hitch ball to prevent catastrophic trailer sway.
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Ideal Target Weight ({results.targetPercentage}%)</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.targetWeight.toLocaleString()}</div>
                      <div className="text-2xl font-bold text-primary mb-1">lbs</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Safe Operating Range</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-4xl font-black text-foreground tracking-tighter">{results.minWeight.toLocaleString()} <span className="text-2xl font-medium text-muted-foreground">-</span> {results.maxWeight.toLocaleString()}</div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">lbs</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Trailer Weight</div>
                    <div className="text-2xl font-bold text-foreground">{parseFloat(inputs.trailerWeight).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">lbs</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Minimum Needed</div>
                    <div className="text-2xl font-bold text-orange-500">{results.minWeight.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">To prevent sway</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Maximum Safe</div>
                    <div className="text-2xl font-bold text-destructive">{results.maxWeight.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">To prevent overload</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Tongue Weight Safety Zones</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value.toLocaleString()} lbs`, 'Tongue Weight']}
                          cursor={{fill: 'transparent'}}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Bar dataKey="Weight" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {
                            results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">Too little weight causes the trailer to fishtail. Too much weight crushes the truck's rear suspension.</div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Physics of a Trailer</h2>
            <p>Towing a trailer is an incredibly complex balancing act of physics. A trailer is essentially a giant seesaw balancing on its central axles. When you hook the front of the trailer (the tongue) onto the back of your truck (the hitch), the trailer pushes down on the truck. This downward force is called <strong>Tongue Weight</strong>, and it is the single most important factor determining whether you will arrive at your destination safely.</p>

            <h2 className="text-2xl font-bold mb-3">The Danger of Low Tongue Weight (Trailer Sway)</h2>
            <p>If you load all of your heavy cargo in the back of the trailer, behind the axles, the trailer becomes tail-heavy. This lifts the tongue upward, pulling the rear end of your truck off the ground. </p>
            <p>When you reach highway speeds, a sudden gust of wind or a passing semi-truck will push the trailer slightly to the side. Because there is not enough weight pinning the tongue to the hitch, the trailer will begin to violently fishtail left and right. This is known as "Trailer Sway," and it is the number one cause of horrific towing accidents. Once sway begins, it acts like a pendulum, magnifying in violence until the trailer inevitably flips both itself and the truck.</p>

            <h2 className="text-2xl font-bold mb-3">The Danger of High Tongue Weight (Suspension Crush)</h2>
            <p>If you load all of your heavy cargo in the front of the trailer, the tongue becomes incredibly heavy. This massive downward force crushes the rear suspension of the truck. While this prevents trailer sway, it creates a new, equally terrifying problem.</p>
            <p>When the rear of the truck is pushed down, the front of the truck acts like a lever and lifts into the air. The front tires are responsible for 100% of your steering and roughly 70% of your braking power. With the front tires barely touching the asphalt, the truck will not turn when you turn the steering wheel, and it will not stop when you press the brakes.</p>

            <h2 className="text-2xl font-bold mb-3">Finding the Sweet Spot</h2>
            <p>To tow safely, the tongue weight must be perfectly balanced.</p>
            <ul>
              <li><strong>Conventional (Bumper) Hitches:</strong> The tongue must hold between 10% and 15% of the total trailer weight. A 7,000 lb trailer MUST drop 700 to 1,050 lbs onto the hitch.</li>
              <li><strong>Fifth-Wheel and Gooseneck Hitches:</strong> Because these hitches mount directly over the rear axle of the truck (rather than on the back bumper), they can safely handle significantly more weight. The safe zone is 15% to 25% of the total trailer weight.</li>
            </ul>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/trailer-tongue-weight-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
