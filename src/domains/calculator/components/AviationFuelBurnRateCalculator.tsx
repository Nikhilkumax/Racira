"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// ── 1. TypeScript interfaces — no 'any' ──────────────────────────────────
interface AviationInputs {
  burnRate: number;
  flightHours: number;
  fuelPrice: number;
  cruiseSpeed: number;
  reservePercent: number;
}

interface AviationResult {
  totalFuel: number;
  totalCost: number;
  costPerHour: number;
  distance: number;
  reserveFuel: number;
  hourlyCostBreakdown: { label: string; value: number; color: string }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summary: { label: string; value: string }[];
}

// ── 2. Pure calculation function — zero React, fully typed ───────────────
function calculateAviationFuel(inputs: AviationInputs): AviationResult {
  const { burnRate, flightHours, fuelPrice, cruiseSpeed, reservePercent } = inputs;
  const totalFuel = burnRate * flightHours;
  const totalCost = totalFuel * fuelPrice;
  const costPerHour = burnRate * fuelPrice;
  const distance = cruiseSpeed * flightHours;
  const reserveFuel = totalFuel * (reservePercent / 100);

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmt0 = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const breakdown = [
    { label: "Fuel Burn Rate", value: `${burnRate.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal/hr` },
    { label: "Flight Time", value: `${flightHours} hours` },
    { label: "Fuel Price", value: `$${fuelPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/gal` },
    { label: "Total Fuel Used", value: `${fmt0(totalFuel)} gal`, highlight: true },
    { label: "Fuel Cost per Hour", value: `$${fmt(costPerHour)}` },
    { label: "Total Trip Fuel Cost", value: `$${fmt0(totalCost)}`, isTotal: true },
  ];

  const summary = [
    { label: "Fuel Burn Rate", value: `${burnRate.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal/hr` },
    { label: "Flight Hours", value: `${flightHours} hrs` },
    { label: "Cruise Speed", value: `${cruiseSpeed.toLocaleString("en-US", { maximumFractionDigits: 0 })} kts` },
    { label: "Trip Distance", value: `${distance.toLocaleString("en-US", { maximumFractionDigits: 0 })} nm` },
    { label: "Total Fuel Used", value: `${fmt0(totalFuel)} gal` },
    { label: "Reserve Fuel", value: `${fmt0(reserveFuel)} gal` },
    { label: "Cost per Hour", value: `$${fmt(costPerHour)}` },
    { label: "Total Trip Cost", value: `$${fmt0(totalCost)}` },
  ];

  return { totalFuel, totalCost, costPerHour, distance, reserveFuel, hourlyCostBreakdown: [], breakdown, summary };
}

// ── 3. DEFAULTS object — realistic values ────────────────────────────────
const DEFAULTS: AviationInputs = { burnRate: 150, flightHours: 4, fuelPrice: 6, cruiseSpeed: 460, reservePercent: 10 };

// ── Shared UI helpers (typed, no 'any') ──────────────────────────────────
const fmtMoney = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  min?: string;
  error?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, min, error }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${error ? "border-red-500" : "border-input"}`}>
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input
        id={id}
        type="number"
        min={min}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
    {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}
  </div>
);

interface ChartTooltipProps {
  active?: boolean;
  payload?: { name?: string | number; value?: number | string }[];
}

const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  return (
    <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
      <p className="font-bold text-muted-foreground mb-0.5">{String(p.name)}</p>
      <p className="text-primary font-extrabold text-sm">{typeof p.value === "number" ? p.value.toLocaleString("en-US", { maximumFractionDigits: 0 }) : String(p.value)}</p>
    </div>
  );
};

// ── 4. Component ─────────────────────────────────────────────────────────
export default function AviationFuelBurnRateCalculator() {
  const [burnRate, setBurnRate] = useState(String(DEFAULTS.burnRate));
  const [flightHours, setFlightHours] = useState(String(DEFAULTS.flightHours));
  const [fuelPrice, setFuelPrice] = useState(String(DEFAULTS.fuelPrice));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cruiseSpeed, setCruiseSpeed] = useState(String(DEFAULTS.cruiseSpeed));
  const [reservePercent, setReservePercent] = useState(String(DEFAULTS.reservePercent));
  const [results, setResults] = useState<AviationResult>(() => calculateAviationFuel(DEFAULTS));

  const getInputs = (): AviationInputs => ({
    burnRate: parseFloat(burnRate) || 0,
    flightHours: parseFloat(flightHours) || 0,
    fuelPrice: parseFloat(fuelPrice) || 0,
    cruiseSpeed: parseFloat(cruiseSpeed) || 0,
    reservePercent: parseFloat(reservePercent) || 0,
  });

  useEffect(() => {
    setResults(calculateAviationFuel(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valErrors: Record<string, string> = {};
  if ((parseFloat(burnRate) || 0) <= 0) valErrors.burnRate = "Burn rate must be greater than 0";
  if ((parseFloat(flightHours) || 0) <= 0 || (parseFloat(flightHours) || 0) > 24) valErrors.flightHours = "Flight time must be 0–24 hours";
  if ((parseFloat(fuelPrice) || 0) <= 0) valErrors.fuelPrice = "Price must be greater than 0";
  if ((parseFloat(cruiseSpeed) || 0) <= 0) valErrors.cruiseSpeed = "Speed must be greater than 0";
  if ((parseFloat(reservePercent) || 0) < 0 || (parseFloat(reservePercent) || 0) > 50) valErrors.reservePercent = "Reserve must be 0%–50%";
  const hasErrors = Object.keys(valErrors).length > 0;

  const calc = () => {
    if (hasErrors) return;
    setResults(calculateAviationFuel(getInputs()));
  };

  const reset = () => {
    setBurnRate(String(DEFAULTS.burnRate));
    setFlightHours(String(DEFAULTS.flightHours));
    setFuelPrice(String(DEFAULTS.fuelPrice));
    setCruiseSpeed(String(DEFAULTS.cruiseSpeed));
    setReservePercent(String(DEFAULTS.reservePercent));
    setShowAdvanced(false);
    setResults(calculateAviationFuel(DEFAULTS));
  };

  const handlePrint = () => window.print();

  const pieTotal = results.totalFuel + results.reserveFuel;
  const rawPcts = [
    pieTotal > 0 ? (results.totalFuel / pieTotal) * 100 : 0,
    pieTotal > 0 ? (results.reserveFuel / pieTotal) * 100 : 0,
  ];
  const rounded = rawPcts.map((p) => Math.round(p * 10) / 10);
  const sum = rounded.reduce((a, b) => a + b, 0);
  if (pieTotal > 0 && sum !== 100) {
    const diff = Math.round((100 - sum) * 10) / 10;
    const maxIdx = rounded[0] >= rounded[1] ? 0 : 1;
    rounded[maxIdx] = Math.round((rounded[maxIdx] + diff) * 10) / 10;
  }
  const chartData = [
    { name: "Planned Fuel", value: results.totalFuel, color: "hsl(var(--primary))", pct: rounded[0] },
    { name: "Reserve Fuel", value: results.reserveFuel, color: "#f59e0b", pct: rounded[1] },
  ];

  const faqs = [
    {
      question: "What is a typical fuel burn rate for an aircraft?",
      answer: "Fuel burn varies widely by aircraft class. A small piston single burns around 10–15 gallons per hour, a turboprop 40–80, a midsize business jet 120–180, and a wide-body airliner 800–1,200 gallons per hour. Use your aircraft's POH or flight-planning app figure for the most accurate estimate.",
    },
    {
      question: "Why does reserve fuel matter?",
      answer: "Regulators require aircraft to carry extra fuel beyond the planned trip — typically enough for 45 minutes at holding speed (IFR) or a diversion to an alternate airport. This calculator shows your planned fuel and the reserve volume so you can confirm you have enough total fuel on board before departure.",
    },
    {
      question: "How do I reduce my fuel burn rate?",
      answer: "Higher cruise altitudes and slower long-range cruise speeds lower burn per mile. Reducing payload weight, flying at optimum altitude, and using a proper power mixture (in piston aircraft) are the most effective levers. Track burn rate over several flights to spot the configuration that minimizes cost per hour.",
    },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Transportation", href: "/calculator/transportation" }, { label: "Aviation Fuel Burn Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Aviation Fuel Burn Rate Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="burn-rate" label="Fuel Burn Rate" value={burnRate} onChange={setBurnRate} suffix="gal/hr" error={valErrors.burnRate} />
              <CompactInput id="flight-hours" label="Flight Time" value={flightHours} onChange={setFlightHours} suffix="hrs" min="0.1" error={valErrors.flightHours} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="fuel-price" label="Fuel Price" value={fuelPrice} onChange={setFuelPrice} prefix="$" suffix="/gal" error={valErrors.fuelPrice} />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Flight Profile</div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput id="cruise-speed" label="Cruise Speed" value={cruiseSpeed} onChange={setCruiseSpeed} suffix="kts" min="1" error={valErrors.cruiseSpeed} />
                      <CompactInput id="reserve-percent" label="Reserve Fuel" value={reservePercent} onChange={setReservePercent} suffix="%" min="0" error={valErrors.reservePercent} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calc}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"}`}
              >Calculate</button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {hasErrors && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                ⚠️ Please fix the errors above before calculating.
              </div>
            )}
          </div>

          {/* RIGHT — RESULTS */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Trip Fuel Cost</div>
              <div className="text-4xl font-bold text-primary tracking-tight">${results.totalCost.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                {results.totalFuel.toLocaleString("en-US", { maximumFractionDigits: 0 })} gallons over {parseFloat(flightHours) || 0} hours.
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Fuel</span>
                <span className="font-extrabold text-foreground">{results.totalFuel.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Hour</span>
                <span className="font-extrabold text-foreground">${fmtMoney(results.costPerHour)}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Trip Distance</span>
                <span className="font-extrabold text-emerald-600">{results.distance.toLocaleString("en-US", { maximumFractionDigits: 0 })} nm</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-right w-[180px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.breakdown.map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${row.isTotal ? "font-bold bg-secondary/30 border-t-2 border-border" : row.highlight ? "bg-amber-500/10" : "hover:bg-secondary/20"}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right ${row.highlight ? "text-amber-700 font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center">
              <h3 className="text-base font-bold mb-2 w-full text-left">Trip Cost Composition</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RechartsPieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name">
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                {chartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                    {d.name} — {d.pct}%
                  </div>
                ))}
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-3 text-foreground">Summary</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {results.summary.map((row, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{row.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Aviation Fuel Burn Rate Calculator?</h2>
            <p>Fuel is typically the largest direct operating cost in aviation. This calculator converts your aircraft's fuel burn rate and flight time into the two numbers pilots and operators actually plan around: total fuel required for the trip and the dollar cost of that fuel. Add your cruise speed and reserve percentage to estimate distance flown and the extra fuel you must carry for safety.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Total fuel used is simply burn rate multiplied by flight time. Multiply that by the current fuel price to get total cost, and divide by flight time for the cost per hour. The advanced options add cruise speed (distance = speed × time) and reserve fuel (a percentage of planned fuel), which mirrors how a flight plan accounts for holding and alternate-airport requirements.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary result is the total fuel cost for the trip. The three-stat bar gives you total fuel, cost per hour, and trip distance. The breakdown table and summary block present the same figures in table form — burn rate, flight time, price, total fuel, cost per hour, and total cost — so you can cross-check the headline number against the details before every departure.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/aviation-fuel-burn-rate-calculator" />
          <PopularCalculators exclude="/calculator/aviation-fuel-burn-rate-calculator" />
        </div>
      </div>
    </>
  );
}
