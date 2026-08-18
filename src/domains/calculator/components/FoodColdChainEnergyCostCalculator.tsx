"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface ColdChainInputs {
  dailyKwh: number;
  ratePerKwh: number;
  operatingDays: number;
  units: number;
  escalationPct: number;
}

interface ColdChainResult {
  annualKwh: number;
  annualCost: number;
  monthlyCost: number;
  costPerUnit: number;
  dailyCost: number;
  fiveYearCost: number;
  chartData: { year: number; cost: number }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcColdChain(inputs: ColdChainInputs): ColdChainResult {
  const annualKwh = inputs.dailyKwh * inputs.operatingDays;
  const annualCost = annualKwh * inputs.ratePerKwh;
  const monthlyCost = annualCost / 12;
  const dailyCost = inputs.dailyKwh * inputs.ratePerKwh;
  const costPerUnit = inputs.units > 0 ? annualCost / inputs.units : 0;

  const chartData: { year: number; cost: number }[] = [];
  let cost = annualCost;
  for (let y = 1; y <= 5; y++) {
    if (y > 1) cost *= 1 + inputs.escalationPct / 100;
    chartData.push({ year: y, cost: Math.round(cost) });
  }
  const fiveYearCost = chartData.reduce((sum, d) => sum + d.cost, 0);

  const breakdown = [
    { label: "Daily Energy Use", value: `${inputs.dailyKwh} kWh` },
    { label: "Electricity Rate", value: `$${inputs.ratePerKwh.toFixed(3)}/kWh` },
    { label: "Operating Days / Year", value: `${inputs.operatingDays} days` },
    { label: "Refrigeration Units", value: `${inputs.units}` },
    { label: "Annual Energy Use", value: `${annualKwh.toLocaleString()} kWh`, highlight: true },
    { label: "Annual Energy Cost", value: `$${annualCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, highlight: true },
    { label: "Monthly Energy Cost", value: `$${monthlyCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Daily Energy Cost", value: `$${dailyCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Cost per Refrigeration Unit", value: `$${costPerUnit.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "5-Year Projected Cost", value: `$${fiveYearCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Annual Energy Cost", value: `$${annualCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Monthly Energy Cost", value: `$${monthlyCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Daily Energy Cost", value: `$${dailyCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Annual Energy Use", value: `${annualKwh.toLocaleString()} kWh` },
    { label: "Cost per Unit", value: `$${costPerUnit.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "5-Year Projected Cost", value: `$${fiveYearCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return { annualKwh, annualCost, monthlyCost, costPerUnit, dailyCost, fiveYearCost, chartData, breakdown, summaryStats };
}

const DEFAULTS: ColdChainInputs = { dailyKwh: 500, ratePerKwh: 0.15, operatingDays: 365, units: 4, escalationPct: 3 };

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">Year {label}</p>
    <p className="text-primary font-extrabold text-sm">${payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
  </div>
) : null;

export default function FoodColdChainEnergyCostCalculator() {
  const [dailyKwh, setDailyKwh] = useState("500");
  const [ratePerKwh, setRatePerKwh] = useState("0.15");
  const [operatingDays, setOperatingDays] = useState("365");
  const [units, setUnits] = useState("4");
  const [escalationPct, setEscalationPct] = useState("3");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<ColdChainResult | null>(null);

  const calculate = () =>
    setResult(calcColdChain({
      dailyKwh: parseFloat(dailyKwh) || 0,
      ratePerKwh: parseFloat(ratePerKwh) || 0,
      operatingDays: parseFloat(operatingDays) || 0,
      units: parseFloat(units) || 1,
      escalationPct: parseFloat(escalationPct) || 0,
    }));
  const reset = () => { setDailyKwh(DEFAULTS.dailyKwh.toString()); setRatePerKwh(DEFAULTS.ratePerKwh.toString()); setOperatingDays(DEFAULTS.operatingDays.toString()); setUnits(DEFAULTS.units.toString()); setEscalationPct(DEFAULTS.escalationPct.toString()); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const faqs = [
    { question: "What is the food cold chain?", answer: "The cold chain is the temperature-controlled journey food takes from harvest or processing through storage, transport, and retail. Each link — walk-in coolers, refrigerated trucks, display cases — consumes electricity 24/7, which is why energy is a major operating cost for food businesses." },
    { question: "How much energy does cold storage use?", answer: "A commercial walk-in cooler can draw 10–60 kWh per day depending on size, insulation, and door traffic; larger distribution warehouses consume far more. Refrigeration typically accounts for 40–60% of a food facility's electricity bill." },
    { question: "How can I cut cold-chain energy costs?", answer: "Insulate and seal doors, add strip curtains and air locks, maintain condenser coils, install variable-speed compressors, and raise set points within food-safety limits. Each 1°F a cooler is over-set can cut energy use by roughly 2–3%." },
    { question: "Why does energy cost escalation matter?", answer: "Electricity prices tend to rise faster than general inflation, and refrigeration demand grows with climate warming. Modeling a 3% annual escalation turns a $27,375 annual bill into about $145,000 over five years — a number that belongs in any facility business plan." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator/environment" }, { label: "Food Cold Chain Energy Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Food Cold Chain Energy Cost Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="kwh" label="Daily Energy Use" value={dailyKwh} onChange={setDailyKwh} suffix="kWh" />
              <CompactInput id="rate" label="Electricity Rate" value={ratePerKwh} onChange={setRatePerKwh} prefix="$" suffix="/kWh" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="days" label="Operating Days / Year" value={operatingDays} onChange={setOperatingDays} suffix="days" />
              <CompactInput id="units" label="Refrigeration Units" value={units} onChange={setUnits} />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Rate Projection</label>
                    <CompactInput id="escalation" label="Annual Energy Cost Escalation" value={escalationPct} onChange={setEscalationPct} suffix="%" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Annual Energy Cost</div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">${result.annualCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground font-medium">${result.annualKwh.toLocaleString()} kWh/yr · ${result.monthlyCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}/month</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Monthly Cost", `$${result.monthlyCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Daily Cost", `$${result.dailyCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`], ["Cost per Unit", `$${result.costPerUnit.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 ${r.highlight ? "text-amber-700 font-semibold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">5-Year Cost Projection</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="cost" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">The Energy Behind Cold Food</h2>
            <p>Every link in the food cold chain — farm coolers, distribution warehouses, refrigerated trucks, and retail cases — runs on continuous electricity. For most food businesses, refrigeration is the single largest energy line item. This <strong>food cold chain energy cost calculator</strong> turns daily consumption into the annual and multi-year numbers that belong in an operating budget.</p>
            <h2 className="text-2xl font-bold mb-3">From kWh to Real Dollars</h2>
            <p>The math is a straight conversion: daily kWh × operating days × rate per kWh. A 500 kWh/day facility at $0.15/kWh costs $27,375 a year — before the 3% annual escalation most commercial tariffs experience. The calculator projects that compounding cost across five years so capital decisions are made against the full picture.</p>
            <h2 className="text-2xl font-bold mb-3">Efficiency Is the Lever</h2>
            <p>Energy use is not fixed: better insulation, door seals, coil maintenance, and set-point discipline each cut consumption by single-digit percentages that compound. Every 10% reduction here saves roughly $2,700 a year on the default facility — a return that justifies most retrofits within a couple of years.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/food-cold-chain-energy-cost-calculator" />
          <PopularCalculators exclude="/calculator/food-cold-chain-energy-cost-calculator" />
        </div>
      </div>
    </>
  );
}
