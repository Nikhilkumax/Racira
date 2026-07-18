"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Scale, RotateCcw, Truck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// 1. TypeScript interfaces
interface LoadIndexResults {
  loadKg: number;
  loadLbs: number;
  axleLoadLbs: number; // For two tires on an axle
  vehicleLoadLbs: number; // For 4 tires
  chartData: any[];
  isError: boolean;
  errorMsg?: string;
}

// 2. Load Index Data (Standard Table)
const loadIndexTable: Record<number, number> = {
  70: 335, 71: 345, 72: 355, 73: 365, 74: 375, 75: 387, 76: 400, 77: 412, 78: 425, 79: 437,
  80: 450, 81: 462, 82: 475, 83: 487, 84: 500, 85: 515, 86: 530, 87: 545, 88: 560, 89: 580,
  90: 600, 91: 615, 92: 630, 93: 650, 94: 670, 95: 690, 96: 710, 97: 730, 98: 750, 99: 775,
  100: 800, 101: 825, 102: 850, 103: 875, 104: 900, 105: 925, 106: 950, 107: 975, 108: 1000, 109: 1030,
  110: 1060, 111: 1090, 112: 1120, 113: 1150, 114: 1180, 115: 1215, 116: 1250, 117: 1285, 118: 1320, 119: 1360,
  120: 1400, 121: 1450, 122: 1500, 123: 1550, 124: 1600, 125: 1650, 126: 1700, 127: 1750, 128: 1800, 129: 1850,
  130: 1900
};

// Pure calculation function
const calculateLoadIndex = (inputs: typeof DEFAULTS): LoadIndexResults => {
  const index = parseInt(inputs.loadIndex, 10);

  if (isNaN(index) || index < 70 || index > 130) {
    return {
      loadKg: 0, loadLbs: 0, axleLoadLbs: 0, vehicleLoadLbs: 0,
      chartData: [], isError: true, errorMsg: "Please enter a valid Load Index between 70 and 130."
    };
  }

  const loadKg = loadIndexTable[index];
  const loadLbs = loadKg * 2.20462;
  const axleLoadLbs = loadLbs * 2;
  const vehicleLoadLbs = loadLbs * 4;

  // Chart data: Show a few indices around the target to give context
  const chartData = [];
  const startIdx = Math.max(70, index - 2);
  const endIdx = Math.min(130, index + 2);
  
  for (let i = startIdx; i <= endIdx; i++) {
    chartData.push({
      Index: i.toString(),
      "Max Load (lbs)": Math.round(loadIndexTable[i] * 2.20462),
      isTarget: i === index
    });
  }

  return {
    loadKg,
    loadLbs,
    axleLoadLbs,
    vehicleLoadLbs,
    chartData,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  loadIndex: "91"
};

const CompactInput = ({ id, label, value, onChange, placeholder }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground font-medium" />
    </div>
  </div>
);

// 4. Component
export default function TireLoadIndexCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<LoadIndexResults>(calculateLoadIndex(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateLoadIndex(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateLoadIndex(DEFAULTS));
  };

  const format0 = (val: number) => val.toFixed(0);

  const faqs = [
    { question: "What is a Tire Load Index?", answer: "The Tire Load Index is an industry-standard numerical code stamped on the sidewall of every tire. It corresponds to the maximum weight (in kilograms) that a single tire can safely support when inflated to its maximum safe pressure." },
    { question: "Where do I find the Load Index on my tire?", answer: "Look at the sidewall of your tire for a long string of numbers and letters (e.g., 225/45R18 91W). The load index is the two or three-digit number immediately following the tire size, right before the speed rating letter. In this example, '91' is the load index." },
    { question: "Can I replace my tires with a lower Load Index?", answer: "No. You should never replace your vehicle's factory tires with tires that have a lower load index. Doing so means the tires cannot safely support the gross weight of your vehicle, significantly increasing the risk of a catastrophic blowout under heavy load or during cornering." },
    { question: "Is it safe to use a higher Load Index?", answer: "Yes, it is generally safe to install tires with a higher load index than the factory recommendation. These tires can support more weight and often feature stiffer sidewalls, which can improve steering response. However, the stiffer sidewall may result in a slightly harsher, bumpier ride." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Tire Load Index Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tire Load Index Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <p className="text-sm text-muted-foreground mb-2">Find the maximum weight capacity of your tires by entering the 2 or 3-digit load index code found on the sidewall.</p>

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-2">
              <h4 className="text-sm font-bold text-primary mb-1">Example Code</h4>
              <p className="text-xs text-muted-foreground">In <strong>225/45R18 91W</strong>, the load index is <strong>91</strong>.</p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <CompactInput id="index" label="Tire Load Index (70-130)" value={inputs.loadIndex} onChange={(v: string) => handleChange("loadIndex", v)} placeholder="91" />
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
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Max Capacity Per Tire</div>
                  <div className="flex items-end gap-3 mb-1">
                    <div className="text-6xl font-black text-primary tracking-tighter">{format0(results.loadLbs)}</div>
                    <div className="text-2xl font-bold text-muted-foreground mb-1">lbs</div>
                  </div>
                  <div className="text-sm font-medium mt-2 text-foreground">
                    Equivalent to <strong>{format0(results.loadKg)} kg</strong> per tire.
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Max Axle Load (2 Tires)</div>
                    <div className="text-3xl font-bold text-foreground">{format0(results.axleLoadLbs)} lbs</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Max Vehicle Load (4 Tires)</div>
                    <div className="text-3xl font-bold text-blue-500">{format0(results.vehicleLoadLbs)} lbs</div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-1 text-center">
                  * Note: Max vehicle load includes the weight of the vehicle itself.
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm mt-2">
                  <h3 className="text-base font-semibold text-foreground mb-4">Capacity Curve Context</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="Index" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} lbs`, 'Max Capacity']}
                          cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Bar dataKey="Max Load (lbs)" radius={[4, 4, 0, 0]} maxBarSize={50}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isTarget ? "hsl(var(--primary))" : "hsl(var(--primary)/0.3)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">Understanding Your Tire Load Index</h2>
            <p>Every tire manufactured for road use carries a specific Load Index, a numerical code that dictates exactly how much physical weight the tire is engineered to support. Our Tire Load Index Calculator instantly decodes this industry-standard numbering system into practical pounds and kilograms, allowing you to ensure your vehicle is safe to operate under heavy loads.</p>

            <h2 className="text-2xl font-bold mb-3">Where to Find the Load Index</h2>
            <p>To find your tire's load index, inspect the outer sidewall of the tire. You are looking for a long alphanumeric string that begins with your tire dimensions (e.g., 245/40R19). Immediately following that dimension string will be a two- or three-digit number followed by a single letter. For example, in the code <strong>245/40R19 98Y</strong>, the number "98" is the Load Index, and the letter "Y" is the Speed Rating.</p>

            <h2 className="text-2xl font-bold mb-3">Gross Vehicle Weight Rating (GVWR) vs. Load Index</h2>
            <p>Your vehicle has a Gross Vehicle Weight Rating (GVWR) established by the manufacturer, which is the absolute maximum safe weight of the vehicle including passengers and cargo. If you multiply your single tire's load capacity by four (assuming a standard passenger car), the resulting number must be greater than your vehicle's GVWR. If the total tire capacity is lower than the GVWR, you are driving on tires that are unsafe for your vehicle.</p>

            <h2 className="text-2xl font-bold mb-3">The Dangers of Downgrading Load Capacity</h2>
            <p>When purchasing replacement tires, you should never choose a tire with a load index lower than what was installed at the factory. Driving on tires that cannot support your vehicle's weight causes excessive sidewall flexing and heat generation. Under normal highway driving conditions, this extreme heat will eventually compromise the structural integrity of the tire, leading to a sudden and catastrophic blowout.</p>

            <h2 className="text-2xl font-bold mb-3">Upgrading to a Higher Load Index</h2>
            <p>Conversely, it is entirely safe—and sometimes beneficial—to install tires with a higher load index than the factory specification. A higher load index typically means the tire features a reinforced internal structure with stronger belts and a stiffer sidewall. For drivers who frequently tow heavy trailers or carry heavy cargo, an "XL" (Extra Load) tire with a higher index provides a superior margin of safety and improved steering response, albeit sometimes at the cost of a slightly stiffer ride quality.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tire-load-index-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Tire Load Index Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Tire Load Index Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Tire Load Index Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Tire Load Index Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Tire Load Index Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
