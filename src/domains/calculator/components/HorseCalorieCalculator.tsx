"use client";
import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface EquineInputs {
  weightLbs: number;
  workload: "maint_min" | "maint_avg" | "maint_high" | "light" | "moderate" | "heavy" | "very_heavy";
  forageEnergy: number; // Mcal per lb of hay (default 0.9)
}

interface EquineResults {
  digestibleEnergyMcal: number; // Daily Mcal
  dailyKcal: number; // Equivalent kcal
  forageMcal: number;
  grainMcal: number;
  lbsHayNeeded: number; // if fed 100% forage, how much hay?
  recommendedHayMinLbs: number; // Absolute minimum hay (1.5% of body weight)
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateEquineDiet = (inputs: EquineInputs): EquineResults => {
  const { weightLbs, workload, forageEnergy } = inputs;
  const safeWeight = weightLbs > 0 ? weightLbs : 0;
  const safeForageEnergy = forageEnergy > 0 ? forageEnergy : 0.9;

  const weightKg = safeWeight / 2.20462;

  // NRC Equations for Adult Horses (Digestible Energy in Mcal/day)
  const multipliers = {
    maint_min: 0.0303,
    maint_avg: 0.0333,
    maint_high: 0.0363,
    light: 0.0433,     // 1-3 hrs/wk riding
    moderate: 0.050,   // 3-5 hrs/wk schooling
    heavy: 0.060,      // 4-5 hrs/wk intense
    very_heavy: 0.070  // Elite racing/eventing
  };

  const digestibleEnergyMcal = weightKg * multipliers[workload];
  const dailyKcal = digestibleEnergyMcal * 1000;

  // A horse MUST eat at least 1.5% of its body weight in forage daily
  const recommendedHayMinLbs = safeWeight * 0.015;
  const maxForageIntakeLbs = safeWeight * 0.025;

  let lbsHayNeeded = digestibleEnergyMcal / safeForageEnergy;

  let forageMcal = digestibleEnergyMcal;
  let grainMcal = 0;

  // If the Mcal requirement exceeds what they can physically eat in hay, they need grain
  if (lbsHayNeeded > maxForageIntakeLbs) {
    const maxForageMcal = maxForageIntakeLbs * safeForageEnergy;
    forageMcal = maxForageMcal;
    grainMcal = digestibleEnergyMcal - maxForageMcal;
    lbsHayNeeded = maxForageIntakeLbs;
  }

  // Elite athletes often need a 60/40 or 50/50 split
  if (workload === "heavy" || workload === "very_heavy") {
    const maxForageRatio = workload === "heavy" ? 0.65 : 0.50;
    if (digestibleEnergyMcal > 0 && (forageMcal / digestibleEnergyMcal) > maxForageRatio) {
      forageMcal = digestibleEnergyMcal * maxForageRatio;
      grainMcal = digestibleEnergyMcal * (1 - maxForageRatio);
      lbsHayNeeded = forageMcal / safeForageEnergy;
    }
  }

  const chartData = [
    { name: "Forage (Hay/Pasture)", value: Math.round(forageMcal), color: "#10b981" },
    { name: "Concentrates (Grain)", value: Math.round(grainMcal), color: "#f59e0b" }
  ];

  const dietType = grainMcal > 0 ? "Mixed Forage/Concentrate Diet" : "100% Forage Diet";

  const summaryStats = [
    { label: "Daily Digestible Energy", value: `${digestibleEnergyMcal.toFixed(1)} Mcal`, colorClass: "text-primary font-bold" },
    { label: "Kilocalorie Equivalent", value: `${Math.round(dailyKcal).toLocaleString("en-US")} kcal` },
    { label: "Minimum Hay Requirement", value: `${recommendedHayMinLbs.toFixed(1)} lbs/day` },
    { label: "Estimated Hay Needed", value: `${lbsHayNeeded.toFixed(1)} lbs/day` },
    { label: "Concentrate Mcal Needed", value: `${grainMcal.toFixed(1)} Mcal/day`, colorClass: grainMcal > 0 ? "text-amber-500 font-medium" : "text-muted-foreground" },
    { label: "Diet Classification", value: dietType }
  ];

  return {
    digestibleEnergyMcal,
    dailyKcal,
    forageMcal,
    grainMcal,
    lbsHayNeeded,
    recommendedHayMinLbs,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  weightLbs: "1100", // Average Quarter Horse / Thoroughbred
  workload: "maint_avg" as const,
  forageEnergy: "0.9" // Avg Mcal per lb of grass hay
};

const fmt = (n: number, dec = 1) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    if (payload[0].value === 0) return null;
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-0.5" style={{ color: payload[0].payload.color }}>{payload[0].name}</p>
        <p className="text-muted-foreground">{payload[0].value.toFixed(0)} Mcal / day</p>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  error
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  min?: string;
  error?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="number"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
    {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}
  </div>
);

export default function HorseCalorieCalculator() {
  // 4. Component State
  const [weightLbs, setWeightLbs] = useState(DEFAULTS.weightLbs);
  const [workload, setWorkload] = useState<EquineInputs["workload"]>(DEFAULTS.workload);
  const [forageEnergy, setForageEnergy] = useState(DEFAULTS.forageEnergy);

  const getInputs = (): EquineInputs => ({
    weightLbs: parseFloat(weightLbs) || 0,
    workload,
    forageEnergy: parseFloat(forageEnergy) || 0.9
  });

  const [results, setResults] = useState<EquineResults>(() => calculateEquineDiet(getInputs()));
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(calculateEquineDiet(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wl = parseFloat(weightLbs) || 0;
  const hasErrors = wl <= 0;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResults(calculateEquineDiet(getInputs()));
  };

  const handleReset = () => {
    setWeightLbs(DEFAULTS.weightLbs);
    setWorkload(DEFAULTS.workload);
    setForageEnergy(DEFAULTS.forageEnergy);
    setResults(calculateEquineDiet(getInputs()));
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Equine Diet Results</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const breakdown = [
    { label: "Daily DE Requirement", value: `${fmt(results.digestibleEnergyMcal)} Mcal` },
    { label: "Kilocalorie Equivalent", value: `${Math.round(results.dailyKcal).toLocaleString("en-US")} kcal` },
    { label: "Forage Allocation", value: `${fmt(results.forageMcal)} Mcal`, highlight: true },
    { label: "Concentrate Allocation", value: results.grainMcal > 0 ? `${fmt(results.grainMcal)} Mcal` : "None needed" },
    { label: "Minimum Hay (1.5% BW)", value: `${fmt(results.recommendedHayMinLbs)} lbs/day` },
    { label: "Estimated Hay Needed", value: `${fmt(results.lbsHayNeeded)} lbs/day` },
    { label: "Total Daily DE", value: `${fmt(results.digestibleEnergyMcal)} Mcal`, isTotal: true }
  ];

  const faqs = [
    { question: "What is a Megacalorie (Mcal)?", answer: "A Megacalorie is equal to 1,000 kilocalories (the standard 'Calories' humans use). Because horses are massive animals that consume tens of thousands of kilocalories a day, equine nutritionists use Mcal to keep the numbers manageable. An average 1,100 lb horse needs about 16.6 Mcal per day at maintenance." },
    { question: "Why is forage so important?", answer: "A horse's digestive system evolved to constantly process roughage over 16-18 hours a day. Without a minimum intake of 1.5% of their body weight in long-stem forage (hay or pasture), they are at extreme risk for gastric ulcers, colic, and psychological distress (cribbing/weaving)." },
    { question: "When does a horse actually need grain?", answer: "Most pleasure and maintenance horses do not need grain at all; good quality pasture or hay will meet 100% of their energy needs. Grain (concentrates) should only be fed to growing horses, pregnant/lactating mares, hard keepers, or sport horses in heavy work whose caloric needs exceed what they can physically consume in hay." },
    { question: "How do I know my hay's Mcal value?", answer: "The only definitive way is to have your hay tested by an agricultural laboratory (like Equi-Analytical). Generally, late-maturity grass hay is around 0.8 Mcal/lb, average grass hay is 0.9 Mcal/lb, and high-quality alfalfa can be 1.0 to 1.2 Mcal/lb." },
    { question: "What is the difference between Light and Moderate work?", answer: "Light work is generally 1 to 3 hours per week of walking and some trotting (e.g., occasional trail riding). Moderate work is 3 to 5 hours per week involving walking, trotting, and some cantering or jumping (e.g., regular dressage schooling or amateur roping)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Horse Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Horse Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput
                id="weight"
                label="Horse's Weight"
                value={weightLbs}
                onChange={setWeightLbs}
                suffix="lbs"
                min="1"
                error={wl <= 0 ? "Must be > 0" : undefined}
              />
              <div className="flex flex-col">
                <label htmlFor="workload" className="flex items-center text-sm font-semibold text-foreground mb-1">
                  Workload / Life Stage
                </label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <select
                    id="workload"
                    value={workload}
                    onChange={(e) => setWorkload(e.target.value as EquineInputs["workload"])}
                    className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground cursor-pointer font-medium"
                  >
                    <option value="maint_min">Maintenance - Minimum (Easy Keeper)</option>
                    <option value="maint_avg">Maintenance - Average</option>
                    <option value="maint_high">Maintenance - Elevated (Nervous/Active)</option>
                    <option value="light">Light Work (1-3 hrs/wk: Pleasure/Trail)</option>
                    <option value="moderate">Moderate Work (3-5 hrs/wk: Schooling/Ranch)</option>
                    <option value="heavy">Heavy Work (4-5 hrs/wk: Polo/Low-level Racing)</option>
                    <option value="very_heavy">Very Heavy Work (Elite Racing/3-Day Eventing)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput
                id="forage"
                label="Forage Energy Density"
                value={forageEnergy}
                onChange={setForageEnergy}
                suffix="Mcal / lb"
                min="0.1"
              />
              <p className="text-[11px] text-muted-foreground -mt-1">Standard grass hay is ~0.9 Mcal/lb. High-quality Alfalfa is ~1.1 Mcal/lb.</p>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                disabled={hasErrors}
                onClick={handleCalculate}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >Calculate</button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start" ref={printRef}>
            {/* 1. Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Daily Digestible Energy Requirement</div>
              <div className="text-4xl font-extrabold text-primary mb-1 tracking-tight">
                {fmt(results.digestibleEnergyMcal)} <span className="text-xl font-bold text-muted-foreground">Mcal</span>
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Equivalent to {Math.round(results.dailyKcal).toLocaleString("en-US")} kilocalories per day.
              </div>
            </div>

            {/* 2. 3-Stat Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Minimum Hay</span>
                <span className="font-extrabold text-emerald-600">{fmt(results.recommendedHayMinLbs)} lbs/day</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hay Needed</span>
                <span className="font-extrabold text-foreground">{fmt(results.lbsHayNeeded)} lbs/day</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Concentrates</span>
                <span className={`font-extrabold ${results.grainMcal > 0 ? "text-amber-600" : "text-emerald-600"}`}>{fmt(results.grainMcal)} Mcal</span>
              </div>
            </div>

            {/* 3. Breakdown Table */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Breakdown</th>
                    <th className="p-2.5 pr-3 text-right w-[160px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-secondary/20 transition-colors ${row.isTotal ? "font-bold bg-secondary/30 border-t-2 border-border" : ""} ${row.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`p-2.5 pr-3 text-right ${row.highlight ? "text-amber-700 font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Chart */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Forage vs Concentrate Balance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={results.chartData.filter(d => d.value > 0)}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={85}
                    paddingAngle={3} dataKey="value"
                  >
                    {results.chartData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 mt-2">
                {results.chartData.map((d, i) => {
                  const total = results.forageMcal + results.grainMcal;
                  const pct = total > 0 ? (d.value / total) * 100 : 0;
                  return (
                    <div key={i} className="flex justify-between items-center text-xs font-medium">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }}></span>
                        <span className={d.value === 0 ? "opacity-40 line-through" : ""}>{d.name}</span>
                      </div>
                      {d.value > 0 && <span className="font-bold">{pct.toFixed(0)}% · {d.value} Mcal</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Nutritional Allocation</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {results.summaryStats.map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{stat.label}</span>
                    <span className={`text-base font-extrabold ${stat.colorClass || "text-foreground"}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Equine Dietary Requirements</h2>
            <p>Feeding a 1,200-pound animal is a complex science. A horse's digestive system is a marvel of evolutionary engineering, designed to constantly trickle-feed on low-quality, fibrous roughage for 16 to 18 hours a day. When we remove horses from open pasture and place them into stalls, domesticating them for athletic competition, we completely disrupt this natural balance. The <strong>Horse Calorie Calculator</strong> is designed to help owners bridge the gap between nature and domestication by providing precise, mathematically sound feeding guidelines based on the National Research Council (NRC) equations.</p>
            <p>This tool translates complex veterinary nutritional data—such as Digestible Energy (DE) and Megacalories (Mcal)—into actionable figures. By understanding exactly how much energy your horse requires based on their weight and workload, you can prevent both the severe metabolic consequences of obesity and the dangerous performance drops associated with malnutrition.</p>

            <h2 className="text-2xl font-bold mb-3">Megacalories vs. Kilocalories</h2>
            <p>If you look at the nutritional label on a human protein bar, you will see it listed in "Calories" (which are technically kilocalories, or kcal). Because horses are massive hindgut fermenters, their energy requirements are exponentially larger than ours. If we used standard kilocalories to measure a horse's diet, the numbers would be wildly unmanageable—a typical horse eats between 15,000 and 35,000 kcal per day.</p>
            <p>To simplify this, equine nutritionists use the <strong>Megacalorie (Mcal)</strong>. One Megacalorie is equal to 1,000 kilocalories. When using our calculator, you will notice that an average 1,100-pound pleasure horse requires roughly 16.6 Mcal per day to maintain its weight. This is the equivalent of 16,600 human calories!</p>

            <h2 className="text-2xl font-bold mb-3">The Foundation: Forage First</h2>
            <p>The golden rule of equine nutrition is "Forage First." A horse is a monogastric herbivore with a massive fermentation vat called the cecum. The microbes in the cecum require constant fiber to stay alive and produce volatile fatty acids, which the horse uses for energy.</p>
            <p>If a horse's stomach is empty for too long, the continuous production of gastric acid will quickly burn holes in the stomach lining, leading to Equine Gastric Ulcer Syndrome (EGUS). To prevent this, a horse <strong>must consume an absolute minimum of 1.5% of its body weight in long-stem forage (hay or pasture) every single day</strong>. Ideally, this number should be closer to 2.0%.</p>
            <p>Our calculator explicitly outputs this "Minimum Hay Requirement." If your horse weighs 1,000 pounds, they must eat at least 15 pounds of hay daily, regardless of what concentrates or supplements they are receiving. Failure to meet this baseline will almost certainly result in colic or ulcers.</p>

            <h2 className="text-2xl font-bold mb-3">When Do Horses Need Grain?</h2>
            <p>Walk through any boarding barn at dinner time, and you will hear the clanking of grain buckets. There is a persistent myth in the equestrian community that every horse needs a scoop of sweet feed or pelleted grain to be healthy. This is mathematically and biologically false.</p>
            <p>Most horses at maintenance (those not being ridden) or in "Light Work" (ridden 1-3 times a week) can meet 100% of their Digestible Energy requirements through good quality hay or pasture alone. Adding calorie-dense grain to the diet of a horse that does not need it is the primary cause of Equine Metabolic Syndrome (EMS) and laminitis—a devastating, often fatal hoof disease.</p>
            <p><strong>Grain (concentrates) should only be fed when the horse's caloric requirements exceed what they can physically consume in hay.</strong> A horse can only comfortably eat about 2.5% of its body weight in hay per day. If a racehorse requires 35 Mcal a day, it would have to eat nearly 40 pounds of hay to meet that need—which is physically impossible. In these scenarios, grain is added to provide a concentrated energy source without overwhelming the gut capacity.</p>

            <h2 className="text-2xl font-bold mb-3">Decoding Workloads</h2>
            <p>Accurately assessing your horse's workload is the most common area where owners make mistakes. It is human nature to overestimate how hard our horses are working. The NRC defines workloads rigidly:</p>
            <ul>
              <li><strong>Maintenance:</strong> The horse is living in a pasture or stall and is not being ridden or driven. They are merely maintaining their vital organs and body temperature.</li>
              <li><strong>Light Work:</strong> 1 to 3 hours of riding per week. The work consists mostly of walking with some trotting. Example: A weekend trail horse.</li>
              <li><strong>Moderate Work:</strong> 3 to 5 hours per week. The work involves walking, trotting, and some cantering or light jumping. Example: A horse in standard dressage or hunter/jumper training programs.</li>
              <li><strong>Heavy Work:</strong> 4 to 5 hours per week of intense cardiovascular exertion. Example: Polo ponies, low-level eventers, or ranch horses working cattle all day.</li>
              <li><strong>Very Heavy Work:</strong> The absolute elite tier of equine athletes. Example: Active racehorses (Thoroughbreds/Standardbreds), endurance horses racing 50+ miles, or Olympic-level 3-Day Eventers.</li>
            </ul>
            <p>Be honest when selecting the workload in the calculator. Selecting "Heavy Work" for a horse that is only ridden an hour a day will result in a massive caloric surplus and rapid, dangerous weight gain.</p>

            <h2 className="text-2xl font-bold mb-3">The Importance of Hay Testing</h2>
            <p>Our calculator uses a default value of 0.9 Mcal per pound of hay, which is the national average for standard grass hay (like Timothy or Coastal Bermuda). However, hay is an agricultural crop, and its nutritional value varies wildly depending on soil quality, weather, and when it was harvested.</p>
            <p>Late-maturity hay (cut after it has gone to seed) is highly fibrous but low in calories, sometimes dropping to 0.7 Mcal/lb. Conversely, early-cut Alfalfa (a legume) is incredibly rich and can exceed 1.1 Mcal/lb. If you feed 20 pounds of Alfalfa instead of 20 pounds of late-cut Timothy, you are feeding an extra 8 Megacalories a day—the equivalent of 8,000 extra kilocalories! If you manage a barn, it is highly recommended to send a core sample of your hay to an agricultural lab for nutritional testing, then input that exact Mcal value into our calculator for perfect precision.</p>

            <h2 className="text-2xl font-bold mb-3">Managing the "Easy Keeper"</h2>
            <p>Certain breeds—such as Quarter Horses, Morgans, Mustangs, and ponies—are genetically predisposed to survive on sparse, nutrient-poor terrain. In the modern world, where they are fed high-quality hay and rich pasture, they become what equestrians call "Easy Keepers." These horses become obese very quickly.</p>
            <p>If you own an easy keeper, you must select "Maintenance - Minimum" in the calculator. You may also need to utilize slow-feed hay nets to make their minimum 1.5% hay requirement last longer throughout the day, preventing them from eating it all in an hour and standing with an empty stomach.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion</h2>
            <p>Equine nutrition does not have to be a guessing game based on how many "scoops" the previous owner fed. By applying the scientific principles of Digestible Energy, strictly enforcing the 1.5% minimum forage rule, and accurately assessing your horse's workload, you can create a diet that supports optimal gut health, peak athletic performance, and long-term metabolic stability.</p>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/horse-calorie-calculator" />
          <PopularCalculators exclude="/calculator/horse-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
