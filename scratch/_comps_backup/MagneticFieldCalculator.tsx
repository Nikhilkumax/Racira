"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";

interface MagneticResult {
  current: number;
  distance: number;
  wires: number;
  bTesla: number;
  bMicro: number;
  bMilli: number;
  earthRatio: number;
  curve: { r: number; b: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const MU0 = 1.25663706212e-6;

function fmt(v: number, d = 4): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcField(current: number, distanceM: number, wires: number): MagneticResult {
  const bTesla = (MU0 * current * wires) / (2 * Math.PI * distanceM);
  const bMicro = bTesla * 1e6;
  const bMilli = bTesla * 1e3;
  const earthRatio = bTesla / 25e-6; // Earth's field ≈ 25-65 µT
  const curve: { r: number; b: number }[] = [];
  for (let i = 1; i <= 80; i++) {
    const r = distanceM * (i / 40);
    const b = (MU0 * current * wires) / (2 * Math.PI * r);
    curve.push({ r: Number((r * 100).toFixed(2)), b: Number((b * 1e6).toFixed(3)) });
  }
  const breakdown = [
    { label: "Current I", value: `${fmt(current)} A` },
    { label: "Distance from Wire", value: `${fmt(distanceM * 100, 1)} cm` },
    { label: "Conductors (n)", value: `${wires}` },
    { label: "Permeability μ₀", value: `${fmt(MU0, 6)} H/m` },
    { label: "Field Strength B", value: `${fmt(bMicro)} µT` },
    { label: "In Millitesla", value: `${fmt(bMilli, 6)} mT` },
    { label: "In Tesla", value: `${fmt(bTesla, 9)} T` },
    { label: "Compared to Earth's Field", value: `${fmt(earthRatio, 1)}×` },
  ];
  const summaryStats = [
    { label: "Field Strength", value: `${fmt(bMicro)} µT` },
    { label: "Millitesla", value: `${fmt(bMilli, 6)} mT` },
    { label: "Current", value: `${fmt(current)} A` },
    { label: "Distance", value: `${fmt(distanceM * 100, 1)} cm` },
    { label: "Conductors", value: `${wires}` },
    { label: "Earth Ratio", value: `${fmt(earthRatio, 1)}×` },
    { label: "Direction", value: "Right-hand rule around the wire" },
    { label: "Formula", value: "B = μ₀I / 2πr" },
  ];
  return { current, distance: distanceM, wires, bTesla, bMicro, bMilli, earthRatio, curve, breakdown, summaryStats };
}

const DEFAULTS = { current: "10", distance: "5", wires: "1" };

export default function MagneticFieldCalculator() {
  const [current, setCurrent] = useState(DEFAULTS.current);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [wires, setWires] = useState(DEFAULTS.wires);
  const [result, setResult] = useState<MagneticResult | null>(null);

  const i = parseFloat(current) || 0;
  const d = parseFloat(distance) || 0;
  const w = Math.round(parseFloat(wires) || 1);
  const errs: string[] = [];
  if (i <= 0) errs.push("Current must be greater than 0.");
  if (d <= 0) errs.push("Distance must be greater than 0.");
  if (w < 1 || w > 100) errs.push("Number of conductors must be between 1 and 100.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcField(i, d / 100, w)); };
  const reset = () => {
    setCurrent(DEFAULTS.current); setDistance(DEFAULTS.distance); setWires(DEFAULTS.wires);
    setResult(calcField(10, 0.05, 1));
  };
  useEffect(() => { setResult(calcField(10, 0.05, 1)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the field around a wire?", answer: "A current-carrying straight wire produces concentric circular magnetic field lines. Ampere's law gives the magnitude as B = μ₀I/(2πr) — proportional to current, inversely proportional to distance from the wire." },
    { question: "How strong are typical fields?", answer: "A 10 A household wire at 5 cm produces about 40 µT — comparable to Earth's background field. Fields drop quickly with distance (1/r), which is why moving 20 cm away roughly quarters the exposure." },
    { question: "What about multiple conductors?", answer: "Parallel conductors carrying the same current add their fields linearly, so n identical wires multiply the field by n. This is how busbars and coil windings build stronger fields than a single wire." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Science", href: "/calculator#science" }, { label: "Magnetic Field Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Magnetic Field Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Current I (A)</label>
                <div className={inp}><input type="number" value={current} onChange={e => setCurrent(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">A</span></div>
              </div>
              <div>
                <label className={lbl}>Distance from Wire (cm)</label>
                <div className={inp}><input type="number" value={distance} onChange={e => setDistance(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">cm</span></div>
              </div>
              <div className="col-span-2">
                <label className={lbl}>Parallel Conductors (n)</label>
                <div className={inp}><input type="number" value={wires} onChange={e => setWires(e.target.value)} className={ci} /></div>
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Magnetic Field Strength</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.bMicro)} µT</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.earthRatio, 1)}× Earth's background field · {fmt(result.bMilli, 6)} mT</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Millitesla`, `${fmt(result.bMilli, 6)} mT`], ["Current", `${fmt(result.current)} A`], ["Distance", `${fmt(result.distance * 100, 1)} cm`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 4 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 4 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Field vs Distance</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.curve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="r" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Distance (cm)", position: "insideBottom", offset: -4, fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number, _n: string, p: { payload?: { r?: number } }) => [`${fmt(v)} µT at ${fmt(Number(p?.payload?.r ?? 0), 1)} cm`, ""]} />
                    <Line type="monotone" dataKey="b" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <ReferenceDot x={result.distance * 100} y={result.bMicro} r={6} fill="#f59e0b" stroke="none" />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Field falls off as 1/r — the highlighted point is your distance</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Ampere's Law for a Straight Wire</h2>
            <p>This <strong>magnetic field calculator</strong> applies B = μ₀I/(2πr) around a long straight conductor. The field forms concentric circles, with the direction given by the right-hand rule — thumb along current, fingers curling in the field direction.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Numbers</h2>
            <p>Results are reported in microteslas, the natural scale for everyday fields. A 10 A wire at 5 cm gives roughly 40 µT — near Earth's own field — and doubling the distance halves the field because of the 1/r dependence.</p>
            <h2 className="text-2xl font-bold mb-3">Multiple Conductors</h2>
            <p>Entering n parallel conductors carrying the same current scales the field by n, modeling busbars and bundled wiring. Magnetic fields add linearly, so the total is simply n times the single-wire value.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/magnetic-field-calculator" />
          <PopularCalculators exclude="/calculator/magnetic-field-calculator" />
        </div>
      </div>
    </>
  );
}
