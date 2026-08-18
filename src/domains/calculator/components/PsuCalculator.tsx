"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Typical power draw (watts) per component class — build-adjusted defaults
const PARTS: { key: string; label: string; base: number }[] = [
  { key: "cpu", label: "CPU", base: 105 },
  { key: "gpu", label: "GPU", base: 250 },
  { key: "motherboard", label: "Motherboard", base: 50 },
  { key: "ram", label: "RAM", base: 15 },
  { key: "ssd", label: "SSD / NVMe", base: 8 },
  { key: "hdd", label: "HDD", base: 10 },
  { key: "fans", label: "Case fans", base: 6 },
  { key: "pump", label: "AIO / water pump", base: 18 },
  { key: "leds", label: "RGB / LED strips", base: 12 },
];

const DEFAULTS: Record<string, string> = {
  cpu: "105", gpu: "250", motherboard: "50", ram: "15", ssd: "8", hdd: "10", fans: "6", pump: "18", leds: "12",
};

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

export default function PsuCalculator() {
  const [values, setValues] = useState<Record<string, string>>(DEFAULTS);
  const [overclock, setOverclock] = useState(false);
  const [aging, setAging] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const set = (k: string, v: string) => setValues(prev => ({ ...prev, [k]: v }));
  const total = PARTS.reduce((acc, p) => acc + (parseFloat(values[p.key]) || 0), 0);
  const loadFactor = 1 + (overclock ? 0.15 : 0) + (aging ? 0.1 : 0);
  const load = total * loadFactor;
  const recommended = Math.ceil(load * 1.3 / 50) * 50; // 30% headroom, rounded to 50W
  const peak = Math.ceil(load * 1.2 / 50) * 50;

  const chartData = [
    ...PARTS.map(p => ({ name: p.label, value: parseFloat(values[p.key]) || 0, fill: "hsl(var(--primary))" })),
    { name: "Headroom", value: recommended - load, fill: "#10b981" },
  ].filter(d => d.value > 0);

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setValues(DEFAULTS); setOverclock(false); setAging(false); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How much headroom should I add?", answer: "A PSU runs most efficiently around 50–80% of its rated load. This calculator targets about 30% headroom over your estimated load, which keeps the unit out of its loudest, hottest zone and leaves room for transient power spikes from the GPU." },
    { question: "Why does the recommended wattage matter?", answer: "An undersized PSU can trigger shutdowns during gaming spikes, and running near max load shortens capacitor life and increases fan noise. Oversizing by more than ~50% wastes money because efficiency drops at very low loads." },
    { question: "Should I include overclocking?", answer: "Yes — an overclocked CPU or GPU can draw 10–20% more than stock under load. Toggle the option on if you plan to overclock so the recommendation accounts for it instead of finding out during a benchmark crash." },
    { question: "Do PSUs degrade over time?", answer: "Capacitors age, especially under heat. The aging option adds 10% to the estimated load, which is a reasonable allowance for a PSU you plan to keep for 5+ years." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "PC Power Supply Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">PC Power Supply Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              {PARTS.map(p => (
                <div key={p.key}>
                  <label className={lbl}>{p.label}</label>
                  <input type="number" min={0} value={values[p.key]} onChange={e => set(p.key, e.target.value)} className={inp} placeholder={String(p.base)} />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={overclock} onChange={e => setOverclock(e.target.checked)} className="h-4 w-4" /> Overclocking CPU/GPU (+15%)</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={aging} onChange={e => setAging(e.target.checked)} className="h-4 w-4" /> Aging allowance (+10%)</label>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Values are typical TDP-style draws; adjust them to match your exact parts. The recommendation targets ~30% headroom for efficiency and transient spikes.</p>
          </div>

          {calculated && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Recommended PSU Wattage</div>
                <div className="text-3xl font-extrabold tracking-tight">{fmt(recommended)} W</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(load)} W estimated load · {fmt(peak)} W peak-safe rating</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Estimated load", `${fmt(load)} W`, "full system draw"], ["Recommended", `${fmt(recommended)} W`, "30% headroom"], ["Peak-safe", `${fmt(peak)} W`, "transient allowance"]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Power Draw by Component</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [`${fmt(Number(v))} W`, ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">GPU + CPU dominate a modern build — the rest is usually under 150 W combined</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Build Summary</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Components draw:</span><span className="font-semibold">{fmt(total)} W</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Load factor:</span><span className="font-semibold">×{(loadFactor * 100).toFixed(0)}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Adjusted load:</span><span className="font-semibold">{fmt(load)} W</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Headroom:</span><span className="font-semibold">{fmt(recommended - load)} W</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Gold-class sweet spot:</span><span className="font-semibold">{fmt(Math.round(load / 0.7 / 50) * 50)}–{fmt(Math.round(load / 0.5 / 50) * 50)} W</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Pick:</span><span className="font-semibold">{fmt(recommended)} W or higher</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Size the Supply, Not the Spec Sheet</h2>
            <p>Every component lists a TDP or typical draw, but adding them up is only the start. This <strong>PC power supply calculator</strong> applies load-factor and headroom logic so the number you buy is the number that keeps the build quiet, cool, and stable.</p>
            <h2 className="text-2xl font-bold mb-3">Why 30% Headroom</h2>
            <p>PSUs peak in efficiency between roughly 50% and 80% of rated load, and GPUs can momentarily draw far more than their sustained TDP. Targeting 30% headroom covers both: the unit idles in its efficient band and never hits its limit during transient spikes.</p>
            <h2 className="text-2xl font-bold mb-3">Match the Recommendation</h2>
            <p>Read the recommended wattage, then pick a reputable unit of that size or the next step up. Higher-rated bronze/gold/platinum tiers mostly reflect efficiency at load — the wattage figure itself is what protects the hardware.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/power-supply-calculator" />
          <PopularCalculators exclude="/calculator/power-supply-calculator" />
        </div>
      </div>
    </>
  );
}
