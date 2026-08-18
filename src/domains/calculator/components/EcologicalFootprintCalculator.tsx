"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 text-sm text-muted-foreground font-medium shrink-0">{suffix}</span>}
    </div>
  </div>
);

const SelectInput = ({ id, label, value, onChange, options }: {
  id: string; label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  </div>
);

const DIET_GHA: Record<string, number> = { meat_daily: 2.5, meat_often: 1.8, vegetarian: 1.2, vegan: 0.8 };
const HOUSE_GHA: Record<string, number> = { small: 1.0, medium: 1.5, large: 2.5, xl: 3.5 };
const SHOP_GHA: Record<string, number> = { minimalist: 0.5, average: 1.5, high: 3.0 };
const DIET_LABELS: Record<string, string> = { meat_daily: "Meat Daily", meat_often: "Meat 2-3×/wk", vegetarian: "Vegetarian", vegan: "Vegan" };
const HOUSE_LABELS: Record<string, string> = { small: "Small", medium: "Medium", large: "Large", xl: "Extra Large" };
const SHOP_LABELS: Record<string, string> = { minimalist: "Minimalist", average: "Average", high: "High" };

interface Inputs { diet: string; houseSize: string; householdSize: string; driveHours: string; flightHours: string; shopping: string; }

interface Result {
  dietGha: number;
  housingGha: number;
  transportGha: number;
  goodsGha: number;
  totalGha: number;
  earthEquivalent: number;
  deficit: number;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { diet: "meat_daily", houseSize: "medium", householdSize: "2", driveHours: "10", flightHours: "4", shopping: "average" };

function calculate(inputs: Inputs): Result {
  const dietGha = DIET_GHA[inputs.diet] ?? 2.5;
  const housingGha = (HOUSE_GHA[inputs.houseSize] ?? 1.5) / Math.max(1, parseFloat(inputs.householdSize) || 1);
  const drive = Math.max(0, parseFloat(inputs.driveHours) || 0);
  const flight = Math.max(0, parseFloat(inputs.flightHours) || 0);
  const transportGha = drive * 0.1 + flight * 0.05;
  const goodsGha = (SHOP_GHA[inputs.shopping] ?? 1.5) + 1.0; // consumption + baseline services
  const totalGha = dietGha + housingGha + transportGha + goodsGha;
  const earthEquivalent = totalGha / 1.6;
  const deficit = 1.6 - totalGha;
  return {
    dietGha,
    housingGha,
    transportGha,
    goodsGha,
    totalGha,
    earthEquivalent,
    deficit,
    chart: [
      { name: "Food", value: Math.round(dietGha * 100) / 100 },
      { name: "Housing", value: Math.round(housingGha * 100) / 100 },
      { name: "Transport", value: Math.round(transportGha * 100) / 100 },
      { name: "Goods & Other", value: Math.round(goodsGha * 100) / 100 },
    ],
  };
}

const EcologicalFootprintCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.householdSize) < 1 || num(inputs.driveHours) < 0 || num(inputs.flightHours) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Diet (" + (DIET_LABELS[inputs.diet] ?? inputs.diet) + ")", value: fmt(result.dietGha, 2) + " gha", highlight: true },
    { label: "Housing (" + (HOUSE_LABELS[inputs.houseSize] ?? inputs.houseSize) + ", ÷" + fmt(Math.max(1, num(inputs.householdSize))) + " people)", value: fmt(result.housingGha, 2) + " gha", highlight: true },
    { label: "Transport (" + fmt(num(inputs.driveHours)) + "h drive/wk + " + fmt(num(inputs.flightHours)) + "h fly/yr)", value: fmt(result.transportGha, 2) + " gha", highlight: true },
    { label: "Goods & Services (" + (SHOP_LABELS[inputs.shopping] ?? inputs.shopping) + ")", value: fmt(result.goodsGha, 2) + " gha", highlight: true },
    { label: "Total Footprint", value: fmt(result.totalGha, 2) + " gha", total: true },
  ];

  const faqs = [
    { question: "What is an Ecological Footprint?", answer: "It measures the biologically productive land and water area needed to produce what you consume and absorb what you waste, expressed in global hectares (gha) — world-average productive hectares." },
    { question: "What is a global hectare (gha)?", answer: "One gha is a hectare with world-average biological productivity. Earth's annual biocapacity is about 1.6 gha per person — the fair-share budget this calculator compares you against." },
    { question: "How many Earths are available?", answer: "One. If everyone lived like the average US resident, we'd need roughly 4-5 Earths. Keeping the world's footprint at or below 1 Earth requires the global average to stay near 1.6 gha per person." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Ecological Footprint Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ecological Footprint Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Food</div>
            <div>
              <SelectInput id="diet" label="Diet Type" value={inputs.diet} onChange={set("diet")} options={[
                { value: "meat_daily", label: "Meat Daily (High Impact)" },
                { value: "meat_often", label: "Meat 2-3 Times a Week" },
                { value: "vegetarian", label: "Vegetarian (No Meat)" },
                { value: "vegan", label: "Vegan (No Animal Products)" },
              ]} />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Housing</div>
            <div className="grid grid-cols-2 gap-3">
              <SelectInput id="houseSize" label="House Size" value={inputs.houseSize} onChange={set("houseSize")} options={[
                { value: "small", label: "Small (Apartment)" },
                { value: "medium", label: "Medium (Avg Home)" },
                { value: "large", label: "Large (4+ Bedrooms)" },
                { value: "xl", label: "Extra Large" },
              ]} />
              <NumInput id="householdSize" label="People in Household" value={inputs.householdSize} onChange={set("householdSize")} min="1" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Transportation</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="driveHours" label="Driving (hrs/week)" value={inputs.driveHours} onChange={set("driveHours")} min="0" />
              <NumInput id="flightHours" label="Flying (hrs/year)" value={inputs.flightHours} onChange={set("flightHours")} min="0" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Goods & Services</div>
            <div>
              <SelectInput id="shopping" label="Shopping Habits" value={inputs.shopping} onChange={set("shopping")} options={[
                { value: "minimalist", label: "Minimalist (Second-hand mostly)" },
                { value: "average", label: "Average (Replace when broken)" },
                { value: "high", label: "High (Buy new trends often)" },
              ]} />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Household size must be ≥ 1 and hours ≥ 0.</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">If Everyone Lived Like You, We'd Need</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.earthEquivalent, 1)} <span className="text-2xl">Earths</span></div>
              <div className="text-sm text-muted-foreground font-medium"><span className="font-bold text-foreground">{fmt(result.totalGha, 1)} gha</span> vs the 1.6 gha fair share per person</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Food</span>
                <span className="font-extrabold text-primary">{fmt(result.dietGha, 2)} gha</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Housing</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.housingGha, 2)} gha</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Transport</span>
                <span className="font-extrabold text-foreground">{fmt(result.transportGha, 2)} gha</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Global Hectares</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Footprint Breakdown (gha)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.chart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} label={({ name, value }: { name: string; value: number }) => `${name}: ${fmt(value, 1)}`} labelLine={false}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--secondary))" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip formatter={(v: number) => [fmt(v, 2) + " gha", ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Food", value: fmt(result.dietGha, 2) + " gha", bold: true },
                  { label: "Housing", value: fmt(result.housingGha, 2) + " gha", bold: true },
                  { label: "Transport", value: fmt(result.transportGha, 2) + " gha" },
                  { label: "Goods & Other", value: fmt(result.goodsGha, 2) + " gha" },
                  { label: "Total Footprint", value: fmt(result.totalGha, 2) + " gha", bold: true },
                  { label: "Earths Needed", value: fmt(result.earthEquivalent, 1) },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                    <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What the Numbers Mean</h2>
            <p>With the defaults (meat daily, medium house shared by 2, 10 h/wk driving, 4 h/yr flying, average shopping), the footprint is <strong>6.95 gha — about 4.3 Earths</strong>. Food (2.5 gha) and goods (2.5 gha) dominate, followed by transport (1.2) and housing (0.75).</p>
            <h2 className="text-2xl font-bold mb-3">The 1.6 gha Budget</h2>
            <p>Earth's biocapacity works out to roughly 1.6 gha per person. Every gha over that is overshoot — funded by depleting natural capital. The biggest levers are diet (drop 1.3-1.7 gha), shopping habits (up to 2.5 gha), and driving (0.1 gha per hour/week).</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ecological-footprint-calculator" />
          <PopularCalculators exclude="/calculator/ecological-footprint-calculator" />
        </div>
      </div>
    </>
  );
};
export default EcologicalFootprintCalculator;
