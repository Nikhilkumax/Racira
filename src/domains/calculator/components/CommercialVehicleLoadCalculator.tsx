"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Truck, RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine, Cell } from "recharts";

// 1. TypeScript interfaces
interface LoadResults {
  maxTotalPayload: number;
  availableSteerCapacity: number;
  availableDriveCapacity: number;
  isOverweight: boolean;
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateLoad = (inputs: typeof DEFAULTS): LoadResults => {
  const gvwr = parseFloat(inputs.gvwr);
  
  const steerLimit = parseFloat(inputs.steerLimit);
  const driveLimit = parseFloat(inputs.driveLimit);
  
  const steerEmpty = parseFloat(inputs.steerEmpty);
  const driveEmpty = parseFloat(inputs.driveEmpty);
  
  const intendedPayload = parseFloat(inputs.intendedPayload);

  if (isNaN(gvwr) || gvwr <= 0 || isNaN(steerLimit) || steerLimit <= 0 || isNaN(driveLimit) || driveLimit <= 0 ||
      isNaN(steerEmpty) || steerEmpty <= 0 || isNaN(driveEmpty) || driveEmpty <= 0 || isNaN(intendedPayload) || intendedPayload < 0) {
    return {
      maxTotalPayload: 0, availableSteerCapacity: 0, availableDriveCapacity: 0, isOverweight: false,
      chartData: [], isError: true, errorMsg: "All weights must be valid positive numbers."
    };
  }

  const emptyTotal = steerEmpty + driveEmpty;
  
  if (emptyTotal >= gvwr) {
    return {
      maxTotalPayload: 0, availableSteerCapacity: 0, availableDriveCapacity: 0, isOverweight: true,
      chartData: [], isError: true, errorMsg: "Empty weight exceeds GVWR. The vehicle is inherently overweight."
    };
  }

  // Max payload based purely on total GVWR
  const maxTotalPayload = gvwr - emptyTotal;

  // Max payload available on specific axles
  const availableSteerCapacity = steerLimit - steerEmpty;
  const availableDriveCapacity = driveLimit - driveEmpty;

  // For the chart, we will assume the intended payload is distributed 20% to Steer and 80% to Drive (typical box truck)
  // Or, if user sets payload to 0, we just show empty vs limit
  const currentSteerWeight = steerEmpty + (intendedPayload * 0.20);
  const currentDriveWeight = driveEmpty + (intendedPayload * 0.80);
  const currentTotalWeight = emptyTotal + intendedPayload;

  const isOverweight = currentTotalWeight > gvwr || currentSteerWeight > steerLimit || currentDriveWeight > driveLimit;

  // Generate chart data: Comparing Steer, Drive, and Total weights against limits
  const chartData = [
    {
      name: "Steer Axle",
      "Current Weight": Math.round(currentSteerWeight),
      "Legal Limit": steerLimit,
      fill: currentSteerWeight > steerLimit ? "hsl(var(--destructive))" : "hsl(var(--primary))"
    },
    {
      name: "Drive Axle(s)",
      "Current Weight": Math.round(currentDriveWeight),
      "Legal Limit": driveLimit,
      fill: currentDriveWeight > driveLimit ? "hsl(var(--destructive))" : "hsl(var(--primary))"
    },
    {
      name: "Total Vehicle",
      "Current Weight": Math.round(currentTotalWeight),
      "Legal Limit": gvwr,
      fill: currentTotalWeight > gvwr ? "hsl(var(--destructive))" : "hsl(var(--blue-500))"
    }
  ];

  return {
    maxTotalPayload: Math.round(maxTotalPayload),
    availableSteerCapacity: Math.round(availableSteerCapacity),
    availableDriveCapacity: Math.round(availableDriveCapacity),
    isOverweight,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  gvwr: "26000", // Non-CDL Box Truck
  steerLimit: "10000",
  driveLimit: "19000",
  steerEmpty: "6000",
  driveEmpty: "8000",
  intendedPayload: "10000"
};

const CompactInput = ({ id, label, value, onChange, placeholder, prefix, suffix }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{prefix}</span>}
      <input id={id} type="number" step="any" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-sm bg-transparent outline-none border-none text-foreground font-medium" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0 font-semibold">{suffix}</span>}
    </div>
  </div>
);

// 4. Component
export default function CommercialVehicleLoadCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<LoadResults>(calculateLoad(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateLoad(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateLoad(DEFAULTS));
  };

  const faqs = [
    { question: "What is the Federal Bridge Law?", answer: "The Federal Bridge Formula is a law designed to protect highways and bridges from being destroyed by heavy commercial trucks. It dictates that you cannot simply look at the total weight of the truck (GVWR); you must also measure exactly how much weight is pushing down on each specific axle. If a truck's total weight is legal, but all the heavy cargo is stacked directly over the rear axle, that specific axle might be overweight, and the driver will be ticketed." },
    { question: "What is an Axle Weight Rating?", answer: "The Gross Axle Weight Rating (GAWR) is the absolute maximum weight that a single axle (or set of axles) is legally and physically allowed to support. A commercial truck has a Steer Axle (the front tires that turn) and Drive Axles (the rear tires that push). The DOT scales at weigh stations measure these axles individually." },
    { question: "Why do I need to weigh the truck empty?", answer: "To know how much cargo you can load, you must know how much of the axle's capacity is already being consumed by the truck itself. The heavy diesel engine sits directly over the front Steer Axle, meaning the front axle is already holding thousands of pounds before you even load a single box into the back." },
    { question: "What happens if I get caught overweight at a weigh station?", answer: "The Department of Transportation (DOT) treats overweight vehicles very aggressively. If you pull into a weigh station and either your Total GVWR or any individual Axle GAWR is over the limit, the DOT officer will immediately red-tag the truck. You will receive a massive fine (often thousands of dollars), and the truck will not be allowed to move until another truck arrives to physically offload the excess cargo." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Commercial Vehicle Load Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Commercial Vehicle Load Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Ensure your commercial box truck or semi-truck is compliant with DOT individual axle weight limits.</p>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Maximum Legal Limits</div>
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="gvwr" label="Total Vehicle GVWR" value={inputs.gvwr} onChange={(v: string) => handleChange("gvwr", v)} suffix="lbs" placeholder="26000" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-1">
              <CompactInput id="slimit" label="Steer Axle Limit" value={inputs.steerLimit} onChange={(v: string) => handleChange("steerLimit", v)} suffix="lbs" placeholder="10000" />
              <CompactInput id="dlimit" label="Drive Axle Limit" value={inputs.driveLimit} onChange={(v: string) => handleChange("driveLimit", v)} suffix="lbs" placeholder="19000" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Empty Vehicle Weight (From Scale)</div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="sempty" label="Empty Steer Axle" value={inputs.steerEmpty} onChange={(v: string) => handleChange("steerEmpty", v)} suffix="lbs" placeholder="6000" />
              <CompactInput id="dempty" label="Empty Drive Axle" value={inputs.driveEmpty} onChange={(v: string) => handleChange("driveEmpty", v)} suffix="lbs" placeholder="8000" />
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1 mt-2">Current Load</div>
            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="payload" label="Intended Cargo Payload" value={inputs.intendedPayload} onChange={(v: string) => handleChange("intendedPayload", v)} suffix="lbs" placeholder="10000" />
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
                  <div className={`border-l-4 rounded-lg p-6 relative overflow-hidden shadow-sm ${results.isOverweight ? 'bg-destructive/10 border-destructive ring-2 ring-destructive ring-offset-2 ring-offset-background' : 'bg-primary/10 border-primary'}`}>
                    <div className={`text-xs uppercase tracking-wide mb-2 font-bold ${results.isOverweight ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {results.isOverweight ? "WARNING: DOT VIOLATION" : "DOT Compliant Status"}
                    </div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className={`text-4xl font-black tracking-tighter ${results.isOverweight ? 'text-destructive' : 'text-primary'}`}>
                        {results.isOverweight ? "OVERWEIGHT" : "LEGAL"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 relative overflow-hidden shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Total Max Payload Capacity</div>
                    <div className="flex items-end gap-3 mb-1">
                      <div className="text-5xl font-black text-foreground tracking-tighter">{results.maxTotalPayload.toLocaleString()}</div>
                      <div className="text-xl font-bold text-muted-foreground mb-1">lbs</div>
                    </div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Steer Axle Margin</div>
                    <div className={`text-2xl font-bold ${results.availableSteerCapacity < 0 ? 'text-destructive' : 'text-foreground'}`}>{results.availableSteerCapacity.toLocaleString()} lbs</div>
                    <div className="text-xs text-muted-foreground">Remaining capacity</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Drive Axle Margin</div>
                    <div className={`text-2xl font-bold ${results.availableDriveCapacity < 0 ? 'text-destructive' : 'text-foreground'}`}>{results.availableDriveCapacity.toLocaleString()} lbs</div>
                    <div className="text-xs text-muted-foreground">Remaining capacity</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Intended Load</div>
                    <div className="text-2xl font-bold text-orange-500">{parseFloat(inputs.intendedPayload).toLocaleString()} lbs</div>
                    <div className="text-xs text-muted-foreground">Will distribute over axles</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Estimated Loaded Weights vs DOT Limits</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `${val/1000}k`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number, name: string) => {
                            if (name === "fill") return [];
                            return [`${value.toLocaleString()} lbs`, name];
                          }}
                          cursor={{fill: 'transparent'}}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', marginTop: '10px' }} />
                        
                        <Bar dataKey="Current Weight" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {
                            results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))
                          }
                        </Bar>
                        
                        {/* Transparent bar with thick border to show the limit */}
                        <Bar dataKey="Legal Limit" fill="transparent" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="3 3" maxBarSize={60} />

                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-3">This assumes the payload is distributed 80% to the rear and 20% to the front. You must shift cargo to balance the axles.</div>
                </div>

              </>
            )}
          </div>
        </div>
        
        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Complexity of Commercial Weight Limits</h2>
            <p>If you rent a standard U-Haul moving truck, you only have to worry about one number: The GVWR (Gross Vehicle Weight Rating). As long as the total weight of the truck plus your furniture is under the limit, you are legally fine. However, for commercial trucks (like 26,000 lb Box Trucks or 80,000 lb Semi-Tractor Trailers), the rules are drastically more complex.</p>
            <p>The Department of Transportation (DOT) does not just weigh the entire truck at once. They force the truck to drive slowly over segmented scales that measure exactly how much weight is pushing down on the front tires (Steer Axle) and the rear tires (Drive Axles) individually.</p>

            <h2 className="text-2xl font-bold mb-3">The Danger of Bad Cargo Distribution</h2>
            <p>It is incredibly common for a commercial truck to be legally under its total GVWR limit, but illegally overweight on a specific axle. This happens due to poor cargo loading.</p>
            <p>Imagine a Box Truck with a 10,000 lb Steer Limit and a 19,000 lb Drive Limit. The driver loads a massive, heavy pallet of machinery into the truck and pushes it all the way to the front wall, directly behind the cab. While the total weight of the truck is fine, that massive weight is now pressing almost entirely down on the front Steer Axle, pushing it over its 10,000 lb legal limit.</p>
            <p>If this truck pulls into a DOT weigh station, the officer will immediately flag the overweight front axle. The driver will receive a massive fine and will be forced to physically climb into the back of the truck and slide the pallet backward until the weight shifts off the Steer Axle and onto the Drive Axles.</p>

            <h2 className="text-2xl font-bold mb-3">Why Axle Limits Exist</h2>
            <p>The DOT strictly enforces individual axle limits (via the Federal Bridge Formula) because concentrated weight destroys asphalt and bridge structures. If an 80,000 lb semi-truck has all of its weight perfectly distributed across 18 wheels, the road surface can handle it. If that same 80,000 lbs is concentrated entirely on the rear axles, it will physically crack the highway pavement and severely compromise bridge integrity.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/commercial-vehicle-load-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Commercial Vehicle Load Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Commercial Vehicle Load Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Commercial Vehicle Load Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Commercial Vehicle Load Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Commercial Vehicle Load Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
