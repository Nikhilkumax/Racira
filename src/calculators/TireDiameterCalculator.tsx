"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Circle, RotateCcw, Ruler } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript interfaces
interface TireDimensions {
  widthMm: number;
  widthIn: number;
  sidewallIn: number;
  sidewallMm: number;
  diameterIn: number;
  diameterMm: number;
  circumferenceIn: number;
  revsPerMile: number;
  isError: boolean;
  errorMsg?: string;
}

// 2. Pure calculation function
const calculateDiameter = (inputs: typeof DEFAULTS): TireDimensions => {
  const w = parseFloat(inputs.width);
  const ar = parseFloat(inputs.ratio);
  const d = parseFloat(inputs.wheel);

  if (!w || !ar || !d || w <= 0 || ar <= 0 || d <= 0) {
    return {
      widthMm: 0, widthIn: 0, sidewallIn: 0, sidewallMm: 0, 
      diameterIn: 0, diameterMm: 0, circumferenceIn: 0, revsPerMile: 0,
      isError: true, errorMsg: "Please enter valid tire dimensions."
    };
  }

  const widthIn = w / 25.4;
  const sidewallMm = w * (ar / 100);
  const sidewallIn = sidewallMm / 25.4;
  
  const wheelMm = d * 25.4;
  const diameterMm = wheelMm + (sidewallMm * 2);
  const diameterIn = d + (sidewallIn * 2);
  
  const circumferenceIn = diameterIn * Math.PI;
  const revsPerMile = 63360 / circumferenceIn;

  return {
    widthMm: w,
    widthIn,
    sidewallIn,
    sidewallMm,
    diameterIn,
    diameterMm,
    circumferenceIn,
    revsPerMile,
    isError: false
  };
};

// 3. DEFAULTS object
const DEFAULTS = {
  width: "275",
  ratio: "60",
  wheel: "20"
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
export default function TireDiameterCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [results, setResults] = useState<TireDimensions>(calculateDiameter(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (key: keyof typeof DEFAULTS, val: string) => {
    const newInputs = { ...inputs, [key]: val };
    setInputs(newInputs);
    // Auto calculate on change
    const r = calculateDiameter(newInputs);
    if (!r.isError) setResults(r);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateDiameter(DEFAULTS));
  };

  const format2 = (val: number) => val.toFixed(2);
  const format1 = (val: number) => val.toFixed(1);

  const chartData = [
    { name: "Wheel (in)", value: parseFloat(inputs.wheel) },
    { name: "Sidewall x2", value: parseFloat((results.sidewallIn * 2).toFixed(2)) },
    { name: "Total Diameter", value: parseFloat(results.diameterIn.toFixed(2)) },
  ];

  const faqs = [
    { question: "How do you calculate tire diameter?", answer: "Tire diameter is calculated by adding the wheel (rim) diameter to the height of the two sidewalls (top and bottom). To find the sidewall height, multiply the tire width (in millimeters) by the aspect ratio percentage, then divide by 25.4 to convert it to inches. Finally, multiply that sidewall height by 2 and add the wheel diameter in inches." },
    { question: "What does '35 inch tires' mean?", answer: "In the off-road and truck community, tires are often referred to by their overall diameter in inches rather than the metric width/ratio system. '35 inch tires' simply means the entire tire, from the ground to the top of the tread, measures roughly 35 inches across." },
    { question: "How wide is a 275 tire in inches?", answer: "To convert metric tire width to inches, divide the number by 25.4. Therefore, a 275mm tire is approximately 10.83 inches wide." },
    { question: "Does a larger diameter tire improve gas mileage?", answer: "Usually, no. While a larger diameter tire lowers engine RPM at highway speeds (which theoretically could improve MPG), larger tires are almost always heavier and wider. The increased rotational mass and aerodynamic drag typically cause a noticeable decrease in fuel economy." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Automobile", href: "/calculator#automobile" }, { label: "Tire Diameter Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tire Diameter Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* LEFT 460px */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-2">
              <h4 className="text-sm font-bold text-primary mb-1">Enter Tire Code</h4>
              <p className="text-xs text-muted-foreground">Example: 275 / 60 R 20</p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <CompactInput id="w" label="Section Width (mm)" value={inputs.width} onChange={(v: string) => handleChange("width", v)} placeholder="275" />
              <CompactInput id="r" label="Aspect Ratio (%)" value={inputs.ratio} onChange={(v: string) => handleChange("ratio", v)} placeholder="60" />
              <CompactInput id="d" label="Wheel Diameter (in)" value={inputs.wheel} onChange={(v: string) => handleChange("wheel", v)} placeholder="20" />
            </div>

            <div className="flex gap-2.5 mt-6">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold h-11 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                <RotateCcw className="h-4 w-4" /> Reset Calculator
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Overall Tire Diameter</div>
                  <div className="flex items-end gap-3 mb-1">
                    <div className="text-6xl font-black text-primary tracking-tighter">{format2(results.diameterIn)}"</div>
                    <div className="text-2xl font-bold text-muted-foreground mb-1">({format1(results.diameterMm)} mm)</div>
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Tread Width</div>
                    <div className="text-2xl font-bold text-foreground">{format2(results.widthIn)}"</div>
                    <div className="text-sm text-muted-foreground">{results.widthMm} mm</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Sidewall Height</div>
                    <div className="text-2xl font-bold text-foreground">{format2(results.sidewallIn)}"</div>
                    <div className="text-sm text-muted-foreground">{format1(results.sidewallMm)} mm</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Circumference</div>
                    <div className="text-2xl font-bold text-blue-500">{format2(results.circumferenceIn)}"</div>
                    <div className="text-sm text-muted-foreground">Distance per revolution</div>
                  </div>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-semibold text-foreground mb-4">Diameter Composition</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} />
                        
                        <RechartsTooltip 
                          formatter={(value: number) => [`${value} inches`, 'Value']}
                          cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                          contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} 
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 2 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.4)"} />
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
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>Why Calculate Tire Diameter?</h2>
            <p>Tire diameter is the most critical metric when modifying your vehicle's stance, installing a lift kit, or ensuring speedometer accuracy. Unfortunately, the metric tire code printed on the sidewall (e.g., 275/60R20) is notoriously difficult to parse into a straightforward overall diameter. A Tire Diameter Calculator bypasses the complex math to instantly provide the true height of the tire in both inches and millimeters.</p>

            <h2>The Math Behind the Tire Code</h2>
            <p>Tire codes use a mix of metric and imperial measurements, making mental math nearly impossible. Here is how the calculation works:</p>
            <ol>
              <li><strong>Width:</strong> The first number (275) is the tread width in millimeters.</li>
              <li><strong>Aspect Ratio:</strong> The second number (60) is the sidewall height expressed as a percentage of the width. So, the sidewall is 60% of 275mm.</li>
              <li><strong>Wheel Diameter:</strong> The last number (20) is the diameter of the metal wheel rim, measured in inches.</li>
            </ol>
            <p>To find the total diameter, you must convert the sidewall height into inches, multiply it by two (because there is sidewall above and below the wheel), and add it to the wheel diameter.</p>

            <h2>Understanding Circumference</h2>
            <p>While diameter dictates whether a tire will physically fit inside your wheel wells without rubbing, <strong>Circumference</strong> (the distance around the outside edge of the tire) dictates how your vehicle's computers function. Every time your tire completes one full revolution, it travels a distance equal to its circumference. If you install a tire with a larger circumference, your vehicle covers more ground per revolution than the factory computer expects, resulting in a speedometer reading that is slower than your actual speed.</p>

            <h2>Truck Tires: Metric vs. Flotation Sizes</h2>
            <p>If you own an off-road truck or Jeep, you may notice that some tires do not use the metric system. Instead, they use "Flotation Sizes," such as 35x12.50R17. This system is much easier to read: the tire is 35 inches in diameter, 12.5 inches wide, and fits a 17-inch wheel. However, the majority of street-legal tires still use the metric system, making a calculator necessary to figure out if a 285/70R17 metric tire is equivalent to a 33-inch flotation tire.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tire-diameter-calculator" />
          <PopularCalculators />
        </div>
      </div>
    </>
  );
}
