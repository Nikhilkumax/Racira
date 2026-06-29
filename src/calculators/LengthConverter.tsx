"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Ruler } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CompactInput = ({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground" />
    </div>
  </div>
);

type LengthUnit = "mm" | "cm" | "m" | "km" | "in" | "ft" | "yd" | "mi" | "nm";
const units: { key: LengthUnit; label: string; short: string; toMeters: number }[] = [
  { key: "mm", label: "Millimeters", short: "mm", toMeters: 0.001 },
  { key: "cm", label: "Centimeters", short: "cm", toMeters: 0.01 },
  { key: "m", label: "Meters", short: "m", toMeters: 1 },
  { key: "km", label: "Kilometers", short: "km", toMeters: 1000 },
  { key: "in", label: "Inches", short: "in", toMeters: 0.0254 },
  { key: "ft", label: "Feet", short: "ft", toMeters: 0.3048 },
  { key: "yd", label: "Yards", short: "yd", toMeters: 0.9144 },
  { key: "mi", label: "Miles", short: "mi", toMeters: 1609.344 },
  { key: "nm", label: "Nautical Miles", short: "nm", toMeters: 1852 },
];

const fmt = (n: number) => {
  if (n === 0) return "0";
  if (Math.abs(n) >= 0.001 && Math.abs(n) < 1e9) return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
  return n.toExponential(4);
};

export default function LengthConverter() {
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState<LengthUnit>("m");
  const [to, setTo] = useState<LengthUnit>("ft");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const v = parseFloat(value) || 0;
  const fromUnit = units.find(u => u.key === from)!;
  const toUnit = units.find(u => u.key === to)!;
  const meters = v * fromUnit.toMeters;
  const result = meters / toUnit.toMeters;
  const chartData = units.slice(0, 6).map(u => ({ name: u.short, value: parseFloat((meters / u.toMeters).toFixed(4)) }));
  const reset = () => { setValue("1"); setFrom("m"); setTo("ft"); };

  const faqs = [
    { question: "How do I convert meters to feet?", answer: "Multiply the meter value by 3.28084. For example, 5 meters = 16.4042 feet. Alternatively, divide meters by 0.3048. This converter handles all unit pairs automatically and shows all conversions simultaneously." },
    { question: "How many centimeters are in an inch?", answer: "There are exactly 2.54 centimeters in one inch. This is an exact, internationally defined conversion established in 1959. To convert inches to cm, multiply by 2.54; to convert cm to inches, divide by 2.54." },
    { question: "What is the difference between a nautical mile and a regular mile?", answer: "A nautical mile (nm) equals 1,852 meters — approximately one minute of arc of latitude. A statute mile is 1,609.344 meters. Nautical miles are used in aviation and maritime navigation because they relate directly to Earth's coordinate system." },
    { question: "How do I convert kilometers to miles?", answer: "Multiply kilometers by 0.621371. For example, 100 km ≈ 62.14 miles. To convert miles to km, multiply by 1.60934. A useful approximation: 5 miles ≈ 8 kilometers (accurate to 1.6%)." },
    { question: "What is a yard in meters?", answer: "One yard equals exactly 0.9144 meters. This is a defined conversion: 1 yard = 3 feet = 36 inches = 91.44 cm. Yards are commonly used in American football and textile measurements." },
    { question: "How many millimeters are in a foot?", answer: "One foot equals 304.8 millimeters. This follows from: 1 foot = 12 inches, 1 inch = 25.4 mm, so 1 foot = 12 × 25.4 = 304.8 mm." },
    { question: "What is the metric system based on?", answer: "The metric system is based on powers of ten with the meter as the base length unit. Prefixes like milli- (÷1000), centi- (÷100), and kilo- (×1000) systematically scale the base unit. This makes arithmetic conversions much simpler than the imperial system." },
    { question: "Which length units are used in science?", answer: "Science uses nanometers (nm = 10⁻⁹ m) for light wavelengths and nanotechnology, micrometers (μm = 10⁻⁶ m) for microscopy, angstroms (Å = 10⁻¹⁰ m) for atomic scales, astronomical units (AU ≈ 150 million km) for solar distances, and light-years for interstellar distances." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Converters", href: "/calculator#converters" }, { label: "Length Converter" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Length Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Convert Length Units</h2>
            <CompactInput id="len-value" label="Value to Convert" value={value} onChange={setValue} />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-foreground">From Unit</label>
                <select value={from} onChange={e => setFrom(e.target.value as LengthUnit)} className="h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  {units.map(u => <option key={u.key} value={u.key}>{u.label} ({u.short})</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-foreground">To Unit</label>
                <select value={to} onChange={e => setTo(e.target.value as LengthUnit)} className="h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  {units.map(u => <option key={u.key} value={u.key}>{u.label} ({u.short})</option>)}
                </select>
              </div>
            </div>
            <button type="button" onClick={reset} className="flex items-center justify-center gap-2 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h2 className="text-2xl font-bold mb-3">Conversion Result</h2>
                <Ruler className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">{fromUnit.label} → {toUnit.label}</div>
                <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmt(result)}</div>
                <div className="text-sm font-semibold text-muted-foreground">{toUnit.short}</div>
              </div>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Unit</th><th className="p-2.5 pr-3 text-right">Value</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border/50">
                    {units.map(u => (
                      <tr key={u.key} className={`hover:bg-secondary/20 ${u.key === to ? "bg-primary/5" : ""}`}>
                        <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{u.label} ({u.short})</td>
                        <td className="p-2.5 pr-3 text-right font-bold text-foreground">{fmt(meters / u.toMeters)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {mounted && (<>

                <div className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="text-sm font-bold text-foreground mb-3">Scale Comparison (common units)</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: any) => [`${val}`, "Value"]} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              
</>)}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>Complete Guide to Length Unit Conversion</h2>
            <p>Length conversion is one of the most common mathematical operations in everyday life, science, engineering, and international commerce. Whether converting room dimensions from feet to meters for a renovation project, calculating a running route in kilometers versus miles, or working with microscopic measurements in engineering, understanding length units and converting between them is an essential skill.</p>
            <p>The world uses two primary measurement systems: the International System of Units (SI — the metric system) and the Imperial/US Customary system. While most countries use metric exclusively, the United States continues to use Imperial for everyday measurements, creating a constant need for conversion in international contexts.</p>
            <h2>The Metric System</h2>
            <p>The metric system is built on the meter as a base unit, with prefixes denoting powers of ten. Millimeter (mm = 0.001 m) is used for small engineering and machining measurements. Centimeter (cm = 0.01 m) is standard for clothing, human body measurements, and interior design. The meter (m) is the base unit for room sizes, fabric lengths, and athletic distances. The kilometer (km = 1,000 m) measures road distances, geographic separations, and flight paths.</p>
            <p>The meter was originally defined as one ten-millionth of the distance from the North Pole to the equator along the Paris meridian. Today it is defined as the distance light travels in vacuum in exactly 1/299,792,458 seconds — making it reproducible anywhere with sufficient instrumentation.</p>
            <h2>The Imperial and US Customary System</h2>
            <p>The Imperial system evolved from historical English measurements. The inch traces to the Latin "uncia" (twelfth). The foot (ft = 12 in) was the length of a human foot. The yard (yd = 3 ft) was standardized as the distance from King Henry I's nose to his outstretched thumb. The mile (mi = 5,280 ft) derives from the Roman "mille passuum" — a thousand double-paces.</p>
            <p>The exact conversion 1 inch = 2.54 cm was internationally agreed in 1959 and underpins all metric-imperial conversions with complete mathematical precision.</p>
            <h2>Nautical Miles in Navigation</h2>
            <p>The nautical mile (nm = 1,852 m) equals one minute of arc of latitude on Earth's surface. This makes it ideal for navigation: distances in nautical miles correspond directly to degrees and minutes of latitude on charts. One degree of latitude equals 60 nautical miles. Speed in nautical miles per hour is called knots — the standard unit in aviation and maritime operations worldwide.</p>
            <h2>Practical Length Conversion Examples</h2>
            <p>Common conversions that arise in daily life: A standard door is 6 feet 8 inches (203.2 cm) tall. A marathon is 42.195 km (26.219 miles). A football field is 100 yards (91.44 m). A sheet of A4 paper is 29.7 cm × 21 cm (11.69 in × 8.27 in). A credit card is 85.6 mm × 54 mm (3.37 in × 2.13 in). The average human walking step is about 0.762 m (2.5 ft). Understanding these reference points helps build intuition for length conversions in everyday contexts.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/length-converter" />
          <PopularCalculators exclude="/calculator/length-converter" />
        </div>
      </div>
    </>
  );
}
