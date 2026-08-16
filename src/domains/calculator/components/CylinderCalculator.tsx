"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Cylinder } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CylinderResult {
  radius: number;
  height: number;
  volumeCm3: number;
  volumeL: number;
  lateralArea: number;
  baseArea: number;
  totalArea: number;
  chartData: { name: string; value: number }[];
}

function calcCylinder(radius: number, height: number): CylinderResult {
  const baseArea = Math.PI * radius * radius;
  const lateralArea = 2 * Math.PI * radius * height;
  const totalArea = lateralArea + 2 * baseArea;
  const volumeCm3 = baseArea * height;
  const chartData = [
    { name: "Lateral Surface", value: lateralArea },
    { name: "Two Bases", value: 2 * baseArea },
  ];
  return { radius, height, volumeCm3, volumeL: volumeCm3 / 1000, lateralArea, baseArea, totalArea, chartData };
}

const DEFAULTS = { radius: "5", height: "15" };

const COLORS = ["hsl(var(--primary))", "hsl(38 92% 50%)"];

const faqs = [
  { question: "How is cylinder volume calculated?", answer: "Volume = π × r² × h, where r is the base radius and h is the height. It is the base circle's area multiplied by the height." },
  { question: "What is the difference between lateral and total surface area?", answer: "Lateral surface area (2πrh) covers only the curved side. Total surface area adds both circular bases: 2πrh + 2πr²." },
  { question: "What units should I use?", answer: "Enter radius and height in the same unit (cm recommended). Volume comes out in cubic centimeters (cm³) and liters; areas in square centimeters (cm²)." },
];

export default function CylinderCalculator() {
  const [radius, setRadius] = useState(DEFAULTS.radius);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [result, setResult] = useState<CylinderResult>(() => calcCylinder(5, 15));

  useEffect(() => {
    const r = parseFloat(radius);
    const h = parseFloat(height);
    if (!isNaN(r) && !isNaN(h) && r > 0 && h > 0) setResult(calcCylinder(r, h));
  }, [radius, height]);

  const reset = () => { setRadius(DEFAULTS.radius); setHeight(DEFAULTS.height); };
  const invalid = isNaN(parseFloat(radius)) || isNaN(parseFloat(height)) || parseFloat(radius) <= 0 || parseFloat(height) <= 0;

  const breakdown = [
    { label: "Radius", value: `${result.radius.toFixed(2)} cm` },
    { label: "Height", value: `${result.height.toFixed(2)} cm` },
    { label: "Base Area (πr²)", value: `${result.baseArea.toFixed(2)} cm²` },
    { label: "Lateral Area (2πrh)", value: `${result.lateralArea.toFixed(2)} cm²` },
    { label: "Total Surface Area", value: `${result.totalArea.toFixed(2)} cm²`, highlight: true },
    { label: "Volume", value: `${result.volumeCm3.toFixed(1)} cm³` },
    { label: "Volume (liters)", value: `${result.volumeL.toFixed(3)} L` },
  ];

  const summaryStats = [
    { label: "Volume", value: `${result.volumeCm3.toFixed(1)} cm³` },
    { label: "Volume (L)", value: `${result.volumeL.toFixed(3)} L` },
    { label: "Total Surface Area", value: `${result.totalArea.toFixed(2)} cm²` },
    { label: "Lateral Area", value: `${result.lateralArea.toFixed(2)} cm²` },
    { label: "Base Area", value: `${result.baseArea.toFixed(2)} cm²` },
    { label: "Shape", value: "Right circular cylinder" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cylinder Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cylinder Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cyl-r" className="block text-sm font-medium mb-1 text-foreground">Radius (cm)</label>
                <input id="cyl-r" type="number" min="0.01" step="0.1" value={radius} onChange={(e) => setRadius(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="cyl-h" className="block text-sm font-medium mb-1 text-foreground">Height (cm)</label>
                <input id="cyl-h" type="number" min="0.01" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Cylinder className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter positive values for radius and height.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Volume</div>
              <div className="text-4xl font-extrabold text-primary">{result.volumeCm3.toFixed(1)} cm³</div>
              <div className="text-sm text-muted-foreground mt-1">{result.volumeL.toFixed(3)} L · r = {result.radius.toFixed(2)} cm, h = {result.height.toFixed(2)} cm</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Total Area</div>
                <div className="text-lg font-bold text-primary">{result.totalArea.toFixed(1)} cm²</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Lateral Area</div>
                <div className="text-lg font-bold text-primary">{result.lateralArea.toFixed(1)} cm²</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Base Area</div>
                <div className="text-lg font-bold text-primary">{result.baseArea.toFixed(1)} cm²</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Surface Area Split</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {result.chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)} cm²`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Cylinder Calculator</h2>
            <p>A right circular cylinder is defined by its base radius r and height h. Its volume is the base area times the height (V = πr²h); its lateral surface unrolls into a rectangle of width 2πr and height h, giving 2πrh, plus two circular bases for the total.</p>
            <h3>Common Applications</h3>
            <p>Volume answers how much a can, pipe, or tank holds; surface area answers how much material its walls need. Doubling the radius quadruples the volume at fixed height — capacity scales with the square of the radius.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cylinder-calculator" />
          <PopularCalculators exclude="/calculator/cylinder-calculator" />
        </div>
      </div>
    </>
  );
}
