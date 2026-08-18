"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// base unit: watt
const UNITS: { key: string; label: string; toW: number }[] = [
  { key: "w", label: "Watts (W)", toW: 1 },
  { key: "kw", label: "Kilowatts (kW)", toW: 1e3 },
  { key: "mw", label: "Megawatts (MW)", toW: 1e6 },
  { key: "gw", label: "Gigawatts (GW)", toW: 1e9 },
  { key: "hp", label: "Horsepower (mech.)", toW: 745.699872 },
  { key: "hp-m", label: "Horsepower (metric)", toW: 735.49875 },
  { key: "hp-e", label: "Horsepower (electrical)", toW: 746 },
  { key: "btu-h", label: "BTU/hour", toW: 0.29307107 },
  { key: "kcal-h", label: "kcal/hour", toW: 1.163 },
];

function fmt(n: number, digits = 4): string {
  if (Math.abs(n) >= 1e9 || (Math.abs(n) > 0 && Math.abs(n) < 1e-4)) return n.toExponential(3);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
}

const DEFAULTS = { value: "1000", from: "w", to: "kw" };

export default function PowerConverter() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [from, setFrom] = useState(DEFAULTS.from);
  const [to, setTo] = useState(DEFAULTS.to);
  const [calculated, setCalculated] = useState(false);

  const v = parseFloat(value);
  const f = UNITS.find(u => u.key === from);
  const t = UNITS.find(u => u.key === to);
  const valid = !isNaN(v) && !!f && !!t;

  const watts = valid ? v * f.toW : 0;
  const result = valid ? watts / t.toW : 0;

  const chartData = UNITS.map(u => ({
    name: u.key,
    value: Number((watts / u.toW).toFixed(3)),
    fill: u.key === to ? "#f59e0b" : "hsl(var(--primary))",
  }));

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setValue(DEFAULTS.value); setFrom(DEFAULTS.from); setTo(DEFAULTS.to); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the difference between horsepower variants?", answer: "Mechanical horsepower is 745.7 W (the original steam-engine definition), metric horsepower is 735.5 W, and electrical horsepower is exactly 746 W. Car ads in different countries quote different variants — a metric 'hp' is about 1.4% smaller than a mechanical one." },
    { question: "How do I convert watts to horsepower?", answer: "Divide by 745.7 for mechanical horsepower. A 1,000 W motor delivers about 1.34 hp; conversely, a 150 hp car engine produces roughly 112 kW of mechanical output — before drivetrain losses, which typically eat another 10–15%." },
    { question: "What is a kilowatt-hour?", answer: "Energy, not power: 1 kWh is 1 kW sustained for one hour — 3.6 megajoules. Your utility bills kilowatt-hours; power (kW) tells you the rate of consumption, energy (kWh) the total. An 1,800 W kettle running 10 minutes uses 0.3 kWh." },
    { question: "Why convert BTU/hour?", answer: "Heating and cooling equipment is still rated in BTU/hour in many markets. Since 1 BTU/h ≈ 0.293 W, a 12,000 BTU/h air conditioner draws about 3.5 kW of heating capacity — a useful comparison when sizing appliances against electrical budgets." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Utilities", href: "/calculator#utilities" }, { label: "Power Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Power Converter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className={lbl}>Value</label>
              <input type="number" step="any" value={value} onChange={e => setValue(e.target.value)} className={inp} placeholder="1000" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>From</label>
                <select value={from} onChange={e => setFrom(e.target.value)} className={inp}>
                  {UNITS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>To</label>
                <select value={to} onChange={e => setTo(e.target.value)} className={inp}>
                  {UNITS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {calculated && valid && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Converted Power</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result)} <span className="text-2xl">{t.label.split(" (")[0]}</span></div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(v)} {f.label.split(" (")[0]} = {fmt(watts)} W</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Watts", fmt(watts), "base unit"], ["Kilowatts", fmt(watts / 1e3), "×10⁻³"], ["Horsepower", fmt(watts / 745.699872), "mechanical"]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Same Power in Every Unit</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(n: number) => fmt(Number(n), 1)} />
                    <Tooltip formatter={(n: number) => [fmt(Number(n), 4), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Each bar is the same physical power expressed in a different unit — amber is your target</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Common Equivalents</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">1 kW =</span><span className="font-semibold">1.341 hp</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">1 hp =</span><span className="font-semibold">745.7 W</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">1 MW =</span><span className="font-semibold">1,000 kW</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">1 BTU/h =</span><span className="font-semibold">0.293 W</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">1 kcal/h =</span><span className="font-semibold">1.163 W</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">1 GW =</span><span className="font-semibold">≈ 1.34M hp</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">One Power, Many Units</h2>
            <p>Watts, kilowatts, horsepower, BTU/hour — different fields use different units for the same physical quantity. This <strong>power converter</strong> normalizes everything through the watt and converts between nine common units with exact factors.</p>
            <h2 className="text-2xl font-bold mb-3">Pick the Right Horse</h2>
            <p>Horsepower comes in three flavors because the original definition was an estimate of a horse's work rate. Car manufacturers now quote metric or mechanical horsepower depending on market, and electrical equipment uses yet another value — the conversion table keeps them straight.</p>
            <h2 className="text-2xl font-bold mb-3">Power vs. Energy</h2>
            <p>Remember the distinction when you see results: power is the rate (watts), energy is the total (watt-hours). The converter handles rates only — multiply by time to get energy, which is what your electricity bill actually charges.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/power-converter" />
          <PopularCalculators exclude="/calculator/power-converter" />
        </div>
      </div>
    </>
  );
}
