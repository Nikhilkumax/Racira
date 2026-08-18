"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Ruler } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface HeightResult {
  feet: number;
  inches: number;
  totalInches: number;
  cm: number;
  meters: number;
}

// 1 inch = 2.54 cm exactly
function fromCm(cm: number): HeightResult {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches - feet * 12;
  return { feet, inches, totalInches, cm, meters: cm / 100 };
}

function fromFtIn(feet: number, inches: number): HeightResult {
  const totalInches = feet * 12 + inches;
  const cm = totalInches * 2.54;
  return { feet, inches, totalInches, cm, meters: cm / 100 };
}

const DEFAULTS = { cm: "175" };

const faqs = [
  { question: "How do I convert height between systems?", answer: "1 inch = 2.54 cm exactly. To convert cm to feet: divide by 2.54 for total inches, then divide by 12 for feet with the remainder as inches. 175 cm → 68.9 in → 5 ft 8.9 in." },
  { question: "Why is 6 feet about 183 cm?", answer: "6 ft = 72 inches, and 72 × 2.54 = 182.88 cm. The 2.54 factor is defined exactly, so all conversions are precise — no rounding beyond your own preference." },
  { question: "Which countries use feet vs meters?", answer: "The US, Canada (partially), and the UK use feet/inches for personal height; most of the world uses centimeters. Medical records worldwide increasingly use cm, which is why dual display helps." },
];

export default function HeightCalculator() {
  const [cm, setCm] = useState(DEFAULTS.cm);
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("9");
  const [result, setResult] = useState<HeightResult>(() => fromCm(175));

  const handleCmToFt = () => {
    const c = parseFloat(cm);
    if (isNaN(c) || c <= 0) return;
    setResult(fromCm(c));
  };

  const handleFtToCm = () => {
    const f = parseInt(feet, 10) || 0;
    const i = parseFloat(inches) || 0;
    if (f < 0 || i < 0 || i >= 12) return;
    setResult(fromFtIn(f, i));
  };

  const reset = () => {
    setCm(DEFAULTS.cm); setFeet("5"); setInches("9");
    setResult(fromCm(175));
  };

  const fmtIn = (n: number) => `${Math.floor(n)}' ${(n - Math.floor(n)).toFixed(1).replace("0.", "")}"`;

  const breakdown = [
    { label: "Feet & Inches", value: `${result.feet} ft ${result.inches.toFixed(1)} in`, highlight: true },
    { label: "Total Inches", value: `${result.totalInches.toFixed(1)} in`, highlight: false },
    { label: "Centimeters", value: `${result.cm.toFixed(1)} cm`, highlight: false },
    { label: "Meters", value: `${result.meters.toFixed(3)} m`, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Height Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Height Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Ruler className="w-4 h-4" /> cm ⇄ Feet & Inches
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Height in Centimeters</label>
              <div className="flex gap-2">
                <input type="number" value={cm} onChange={(e) => setCm(e.target.value)} className="input-calc flex-1" placeholder="175" min={0} />
                <button onClick={handleCmToFt} className="btn-calculate px-4">Calculate</button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Height in Feet & Inches</label>
              <div className="flex gap-2">
                <input type="number" value={feet} onChange={(e) => setFeet(e.target.value)} className="input-calc w-24" placeholder="5" min={0} />
                <span className="self-center text-sm text-muted-foreground">ft</span>
                <input type="number" value={inches} onChange={(e) => setInches(e.target.value)} className="input-calc w-24" placeholder="9" min={0} max={11} />
                <span className="self-center text-sm text-muted-foreground">in</span>
                <button onClick={handleFtToCm} className="btn-calculate px-4 flex-1">Calculate</button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Converted Height</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.feet} ft {result.inches.toFixed(1)} in</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.cm.toFixed(1)} cm · {result.meters.toFixed(2)} m · {result.totalInches.toFixed(1)} in total
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Total Inches", `${result.totalInches.toFixed(1)} in`],
                ["Centimeters", `${result.cm.toFixed(1)} cm`],
                ["Meters", `${result.meters.toFixed(3)} m`],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
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

            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Your Height vs Common References</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[{ name: "Your Height", cm: Math.round(result.cm), selected: true }, { name: "5' 0\"", cm: 152, selected: false }, { name: "5' 6\"", cm: 168, selected: false }, { name: "5' 10\"", cm: 178, selected: false }, { name: "6' 0\"", cm: 183, selected: false }, { name: "6' 2\"", cm: 188, selected: false }]} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => `${v} cm`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="cm" radius={[4, 4, 0, 0]}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--primary) / 0.25)" />
                    <Cell fill="hsl(var(--primary) / 0.25)" />
                    <Cell fill="hsl(var(--primary) / 0.25)" />
                    <Cell fill="hsl(var(--primary) / 0.25)" />
                    <Cell fill="hsl(var(--primary) / 0.25)" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Highlighted bar is your height; the US male average is 175.3 cm (5' 9").</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Feet & Inches", value: `${result.feet} ft ${result.inches.toFixed(1)} in` },
                  { label: "Total Inches", value: `${result.totalInches.toFixed(1)} in` },
                  { label: "Centimeters", value: `${result.cm.toFixed(1)} cm` },
                  { label: "Meters", value: `${result.meters.toFixed(3)} m` },
                  { label: "US Avg Male / Female", value: "175.3 / 161.5 cm" },
                  { label: "6 ft Reference", value: "182.9 cm" },
                ].map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Height Calculator</h2>
            <p>Height conversion rests on a single exact definition: 1 inch = 2.54 centimeters. Converting centimeters to imperial goes through total inches — 175 cm ÷ 2.54 = 68.9 inches — then splits into whole feet and remainder: 5 feet and 8.9 inches. The reverse multiplies feet by 12, adds the inches, and scales by 2.54.</p>
            <h3>Why both systems persist</h3>
            <p>Personal height is one of the last everyday measures still commonly given in feet and inches — in the US, the UK, and much of the English-speaking world — while medicine, international documents, and most of the planet use centimeters. The calculator converts in both directions so a travel form, a medical record, or a conversation with an international friend never needs a second lookup.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/height-calculator" />
          <PopularCalculators exclude="/calculator/height-calculator" />
        </div>
      </div>
    </>
  );
}
