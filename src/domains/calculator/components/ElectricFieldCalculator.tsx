"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface FieldResult {
  charge: number;
  distance: number;
  k: number;
  field: number;
  potential: number;
  chartData: { r: number; field: number }[];
}

function calcField(chargeUc: number, distanceM: number): FieldResult {
  const k = 8.99e9;
  const q = chargeUc * 1e-6;
  const field = distanceM > 0 ? (k * q) / (distanceM * distanceM) : 0;
  const potential = distanceM > 0 ? (k * q) / distanceM : 0;
  const chartData: { r: number; field: number }[] = [];
  for (let i = 1; i <= 20; i++) {
    const r = (distanceM * i) / 20;
    chartData.push({ r: Number(r.toFixed(4)), field: Number(((k * q) / (r * r)).toFixed(1)) });
  }
  return { charge: chargeUc, distance: distanceM, k, field, potential, chartData };
}

const DEFAULTS = { charge: "1", distance: "0.5" };

const fmtSci = (n: number) => n >= 1000 || (n > 0 && n < 0.01) ? n.toExponential(2) : n.toLocaleString("en-US", { maximumFractionDigits: 1 });

const faqs = [
  { question: "What is an electric field?", answer: "The electric field is the force per unit charge a test charge would feel: E = kQ/r². It is a vector pointing away from positive charges and toward negative ones, measured in N/C or V/m." },
  { question: "Why does the field drop as 1/r²?", answer: "Field lines spread over the surface of a sphere, whose area grows as r². The same total flux spread over a larger sphere means less field per point — Coulomb's law has the same inverse-square shape as gravity." },
  { question: "What is electric potential?", answer: "Potential V = kQ/r is the work per unit charge to bring a test charge from infinity. Unlike the field, it drops as 1/r, not 1/r². Field is the slope (negative gradient) of potential." },
];

export default function ElectricFieldCalculator() {
  const [charge, setCharge] = useState(DEFAULTS.charge);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [result, setResult] = useState<FieldResult>(() => calcField(1, 0.5));

  useEffect(() => {
    const q = parseFloat(charge);
    const r = parseFloat(distance);
    if (!isNaN(q) && !isNaN(r) && r > 0) setResult(calcField(q, r));
  }, [charge, distance]);

  const reset = () => { setCharge(DEFAULTS.charge); setDistance(DEFAULTS.distance); };
  const invalid = isNaN(parseFloat(charge)) || isNaN(parseFloat(distance)) || parseFloat(distance) <= 0;

  const breakdown = [
    { label: "Charge Q", value: `${result.charge.toFixed(2)} µC` },
    { label: "Distance r", value: `${result.distance.toFixed(3)} m` },
    { label: "Coulomb Constant k", value: "8.99 × 10⁹ N·m²/C²" },
    { label: "Electric Field E", value: `${fmtSci(result.field)} N/C`, highlight: true },
    { label: "Field (V/m)", value: `${fmtSci(result.field)} V/m` },
    { label: "Electric Potential V", value: `${fmtSci(result.potential)} V` },
    { label: "Force on 1 C Test Charge", value: `${fmtSci(result.field)} N` },
  ];

  const summaryStats = [
    { label: "Electric Field", value: `${fmtSci(result.field)} N/C` },
    { label: "Potential", value: `${fmtSci(result.potential)} V` },
    { label: "Charge", value: `${result.charge.toFixed(2)} µC` },
    { label: "Distance", value: `${result.distance.toFixed(3)} m` },
    { label: "Field at 2r", value: `${fmtSci(result.field / 4)} N/C` },
    { label: "Field at r/2", value: `${fmtSci(result.field * 4)} N/C` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Electric Field Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Electric Field Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="ef-charge" className="block text-sm font-medium mb-1 text-foreground">Charge Q (µC)</label>
              <input id="ef-charge" type="number" step="0.1" value={charge} onChange={(e) => setCharge(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label htmlFor="ef-dist" className="block text-sm font-medium mb-1 text-foreground">Distance r (m)</label>
              <input id="ef-dist" type="number" min="0.001" step="0.01" value={distance} onChange={(e) => setDistance(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Zap className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a numeric charge and a positive distance.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Electric Field E</div>
              <div className="text-4xl font-extrabold text-primary">{fmtSci(result.field)} N/C</div>
              <div className="text-sm text-muted-foreground mt-1">{result.charge.toFixed(2)} µC at {result.distance.toFixed(2)} m · V = {fmtSci(result.potential)}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Potential V</div>
                <div className="text-lg font-bold text-primary">{fmtSci(result.potential)} V</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Force on 1 C</div>
                <div className="text-lg font-bold text-primary">{fmtSci(result.field)} N</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Field at 2r</div>
                <div className="text-lg font-bold text-primary">{fmtSci(result.field / 4)} N/C</div>
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
              <h3 className="text-base font-bold mb-3">Field Strength vs Distance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="r" tick={{ fontSize: 11 }} type="number" domain={["dataMin", "dataMax"]} label={{ value: "r (m)", position: "insideBottom", fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${fmtSci(v)} N/C`, "Field"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="field" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-muted-foreground -mt-2">Inverse-square: doubling r quarters the field</p>
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
            <h2 className="text-2xl font-bold mb-3">About the Electric Field Calculator</h2>
            <p>Coulomb's law gives the field of a point charge: E = kQ/r², with k = 8.99 × 10⁹ N·m²/C². A 1 µC charge at 0.5 m produces E = 8.99×10⁹ × 10⁻⁶ ÷ 0.25 ≈ 35,960 N/C — strong enough to visibly move a small test charge. The potential at the same point is V = kQ/r ≈ 17,980 V.</p>
            <h3>The Inverse-Square Shape</h3>
            <p>Halve the distance and the field quadruples; double it and the field drops to a quarter. This steep falloff is why electrostatic forces dominate at atomic scales but vanish over everyday distances — and why shielding and grounding are practical.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/electric-field-calculator" />
          <PopularCalculators exclude="/calculator/electric-field-calculator" />
        </div>
      </div>
    </>
  );
}
