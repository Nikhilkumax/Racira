"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Battery, RotateCcw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

// 1. TypeScript interfaces
interface BatteryResults {
  safeRuntimeHours: number;
  maxRuntimeHours: number;
  usableCapacityAh: number;
  chartData: any[];
  schedule: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateBattery = (inputs: typeof DEFAULTS): BatteryResults => {
  const capacityAh = parseFloat(inputs.capacityAh);
  const currentDrawAmps = parseFloat(inputs.currentDrawAmps);
  const batteryType = inputs.batteryType;

  if (isNaN(capacityAh) || capacityAh <= 0 || isNaN(currentDrawAmps) || currentDrawAmps <= 0) {
    return {
      safeRuntimeHours: 0, maxRuntimeHours: 0, usableCapacityAh: 0,
      chartData: [], schedule: [], isError: true, errorMsg: "Capacity and Current Draw must be valid positive numbers."
    };
  }

  // Determine Safe Discharge Depth
  // Lead-Acid (AGM/Gel/Flooded) should only be discharged to 50% to prevent permanent damage.
  // Lithium (LiFePO4) can be safely discharged to roughly 90-100%, but 90% is a safe operational limit.
  let safeDepth = 0.50; // Lead-Acid
  if (batteryType === "lithium") safeDepth = 0.90;

  const usableCapacityAh = capacityAh * safeDepth;

  // Max runtime (killing the battery 100%)
  const maxRuntimeHours = capacityAh / currentDrawAmps;
  // Safe runtime (stopping at the safe depth limit)
  const safeRuntimeHours = usableCapacityAh / currentDrawAmps;

  // Generate chart data mapping Capacity remaining over Time
  const chartData = [];
  const schedule = [];
  
  // We'll plot in 1-hour increments or fractional if total time is short
  const step = Math.max(0.5, Math.ceil(maxRuntimeHours / 20));
  
  for (let h = 0; h <= maxRuntimeHours + step; h += step) {
    let remaining = capacityAh - (currentDrawAmps * h);
    if (remaining < 0) remaining = 0;
    
    chartData.push({
      "Hours Run": Number(h.toFixed(1)),
      "Capacity Remaining (Ah)": Number(remaining.toFixed(1))
    });

    schedule.push({
      hour: Number(h.toFixed(1)),
      remaining: Number(remaining.toFixed(1)),
      pct: Math.round((remaining / capacityAh) * 100)
    });

    if (remaining === 0) break;
  }

  return {
    safeRuntimeHours: Number(safeRuntimeHours.toFixed(1)),
    maxRuntimeHours: Number(maxRuntimeHours.toFixed(1)),
    usableCapacityAh: Number(usableCapacityAh.toFixed(1)),
    chartData,
    schedule,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  capacityAh: "100",    // Typical Group 27/31 deep cycle battery
  currentDrawAmps: "5", // e.g. running a 12V portable fridge
  batteryType: "lead_acid" // "lead_acid" or "lithium"
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
        <input id={id} type="number" step="any" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      )}
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function BatteryLifeCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<BatteryResults>(calculateBattery(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateBattery(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleCalculate = () => {
    const r = calculateBattery(inputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateBattery(DEFAULTS));
  };

  const faqs = [
    { question: "What is an Amp-Hour (Ah)?", answer: "Amp-Hour (Ah) is the standard measurement of battery capacity. It tells you how much current the battery can supply for exactly one hour before dying. A 100Ah battery can provide 100 Amps for 1 hour, or 10 Amps for 10 hours, or 1 Amp for 100 hours. It is essentially the 'size of the gas tank' for your electrical system." },
    { question: "Why can't I use 100% of my Lead-Acid battery?", answer: "Standard Lead-Acid batteries (including AGM and Gel variants) are physically damaged if you drain them completely. To ensure the battery lasts for years without degrading, manufacturers strictly require that you never discharge a Lead-Acid battery below 50% capacity. Therefore, a 100Ah Lead-Acid battery only gives you 50Ah of truly usable power." },
    { question: "Why are Lithium batteries better?", answer: "Lithium Iron Phosphate (LiFePO4) batteries have a completely different internal chemistry. They can safely be discharged to 0% without sustaining permanent damage (though stopping at 10% is recommended for maximum lifespan). This means a 100Ah Lithium battery provides nearly twice as much usable power as a 100Ah Lead-Acid battery of the exact same size, while also weighing roughly half as much." },
    { question: "How do I calculate Amps from Watts?", answer: "If your device is rated in Watts (e.g., a 60W light bulb) instead of Amps, you can convert it using Ohm's Law: Amps = Watts / Volts. In a standard 12V automotive system, a 60W device draws exactly 5 Amps (60 / 12 = 5)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Battery Life Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Battery Life Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Calculate how long your deep-cycle battery will run your devices before dying or sustaining permanent damage.</p>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="type" label="Battery Chemistry" value={inputs.batteryType} onChange={(v: string) => handleChange("batteryType", v)} options={[
                { label: "Lead-Acid / AGM (50% Safe Discharge)", value: "lead_acid" },
                { label: "Lithium LiFePO4 (90% Safe Discharge)", value: "lithium" }
              ]} />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <CompactInput id="cap" label="Total Battery Capacity" value={inputs.capacityAh} onChange={(v: string) => handleChange("capacityAh", v)} suffix="Ah" placeholder="100" />
              <CompactInput id="draw" label="Total Device Draw" value={inputs.currentDrawAmps} onChange={(v: string) => handleChange("currentDrawAmps", v)} suffix="Amps" placeholder="5" />
            </div>

            <div className="text-[10px] text-muted-foreground mt-2">
              * Note: If you have multiple devices running simultaneously, add their Amperage together to get your Total Device Draw.
            </div>

            <div className="flex gap-2.5 mt-4">
              <button type="button" onClick={handleCalculate} className="flex-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="flex-1 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Safe Operational Runtime</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-6xl font-black text-primary tracking-tighter">{results.safeRuntimeHours}</div>
                      <div className="text-2xl font-bold text-primary mb-1">hrs</div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-destructive/80 mb-2 font-bold">Absolute Max (Battery Dead)</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-destructive tracking-tighter">{results.maxRuntimeHours}</div>
                      <div className="text-xl font-bold text-destructive/80 mb-1">hrs</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Total Capacity</div>
                    <div className="text-2xl font-bold text-foreground">{parseFloat(inputs.capacityAh)} Ah</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Safe Usable</div>
                    <div className="text-2xl font-bold text-blue-500">{results.usableCapacityAh} Ah</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Discharge Rate</div>
                    <div className="text-2xl font-bold text-emerald-500">{inputs.currentDrawAmps} A/hr</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Battery Drain Over Time</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorCap" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Hours Run" tickFormatter={(val) => `${val}h`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                        <YAxis tickFormatter={(val) => `${val} Ah`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, parseFloat(inputs.capacityAh)]} axisLine={false} tickLine={false} />
                        
                        <ReferenceLine y={parseFloat(inputs.capacityAh) - results.usableCapacityAh} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'DAMAGE ZONE (DO NOT CROSS)', fill: 'hsl(var(--destructive))', fontSize: 11, fontWeight: 'bold' }} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} Ah`, 'Remaining']}
                          labelFormatter={(label) => `Time: ${label} Hours`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Area type="monotone" name="Remaining Capacity" dataKey="Capacity Remaining (Ah)" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCap)" strokeWidth={3} activeDot={{r: 6}} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">Discharging past the red line causes permanent chemical damage to the battery.</div>
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-0 overflow-hidden border border-border bg-card shadow-sm mt-2">
                  <div className="px-4 py-3 bg-muted/30 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Discharge Schedule</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/10 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Hours Elapsed</th>
                          <th className="px-4 py-3 font-semibold text-right text-primary">Ah Remaining</th>
                          <th className="px-4 py-3 font-semibold text-right">Battery %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {results.schedule.map((row) => (
                          <tr key={row.hour} className={`hover:bg-muted/20 transition-colors ${row.remaining < (parseFloat(inputs.capacityAh) - results.usableCapacityAh) ? 'bg-destructive/10' : ''}`}>
                            <td className="px-4 py-3 text-foreground">{row.hour} hrs</td>
                            <td className="px-4 py-3 text-right text-primary font-bold">{row.remaining} Ah</td>
                            <td className={`px-4 py-3 text-right font-bold ${row.remaining < (parseFloat(inputs.capacityAh) - results.usableCapacityAh) ? 'text-destructive' : 'text-foreground'}`}>
                              {row.pct}%
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
            <h2 className="text-2xl font-bold mb-3">Understanding Battery Capacity (Amp-Hours)</h2>
            <p>Whether you are building a solar system for an RV, powering a portable fridge for overlanding, or setting up a trolling motor for a boat, your primary limitation is battery capacity. Deep cycle batteries are measured in <strong>Amp-Hours (Ah)</strong>. This metric tells you exactly how much electrical current the battery can hold. If a device draws 5 Amps of current, and you run it for 2 hours, you have consumed 10 Amp-Hours of battery capacity.</p>

            <h2 className="text-2xl font-bold mb-3">The Lead-Acid 50% Rule</h2>
            <p>The biggest mistake beginners make is assuming they can use all of the electricity inside their battery. If you own a traditional Lead-Acid battery (which includes Flooded, AGM, and Gel types), you can only use 50% of the battery's rated capacity.</p>
            <p>Why? Because of the internal chemistry. If you discharge a Lead-Acid battery below 50%, the chemical reaction inside the battery physically degrades the lead plates. The battery will permanently lose capacity and fail completely within a few months. Therefore, a massive, heavy 100Ah Lead-Acid battery only truly gives you 50Ah of usable power.</p>

            <h2 className="text-2xl font-bold mb-3">Why Lithium (LiFePO4) is the New Standard</h2>
            <p>In recent years, Lithium Iron Phosphate (LiFePO4) batteries have become the gold standard for off-grid power. Lithium chemistry is vastly superior to Lead-Acid because it does not suffer from deep-discharge damage. You can safely discharge a Lithium battery down to 10% (or even 0%) hundreds of times without hurting the battery.</p>
            <p>This means a 100Ah Lithium battery provides 90Ah of usable power—nearly double the usable power of a Lead-Acid battery of the exact same size. Furthermore, Lithium batteries weigh roughly half as much, making them significantly better for RVs and boats where weight is a major concern.</p>

            <h2 className="text-2xl font-bold mb-3">How to Calculate Total Device Draw</h2>
            <p>If you have multiple devices running at the same time, simply add their Amperages together. For example, if your portable fridge draws 4 Amps, your LED lights draw 1 Amp, and your phone charger draws 2 Amps, your Total Device Draw is 7 Amps. You plug that number into the calculator to see exactly how many hours your system will survive before shutting down.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/battery-life-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Battery Life Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Battery Life Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Battery Life Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Battery Life Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Battery Life Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
