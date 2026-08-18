"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface FuelBurnInputs {
  burnRate: number;
  flightHours: number;
  fuelPrice: number;
  capacity: number;
  reservePct: number;
}

interface FuelBurnResult {
  tripFuel: number;
  reserveFuel: number;
  totalFuelNeeded: number;
  fuelCost: number;
  reserveRemaining: number;
  enduranceHours: number;
  adequate: boolean;
  fuelPerHourCost: number;
  chartData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calcFuelBurn(inputs: FuelBurnInputs): FuelBurnResult {
  const tripFuel = inputs.burnRate * inputs.flightHours;
  const reserveFuel = tripFuel * (inputs.reservePct / 100);
  const totalFuelNeeded = tripFuel + reserveFuel;
  const fuelCost = totalFuelNeeded * inputs.fuelPrice;
  const reserveRemaining = Math.max(0, inputs.capacity - tripFuel);
  const enduranceHours = inputs.burnRate > 0 ? inputs.capacity / inputs.burnRate : 0;
  const adequate = inputs.capacity >= totalFuelNeeded;
  const fuelPerHourCost = inputs.burnRate * inputs.fuelPrice;

  const chartData = [
    { name: "Trip Fuel", value: tripFuel, color: "hsl(var(--primary))" },
    { name: "Reserve Fuel", value: reserveFuel, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  const breakdown = [
    { label: "Fuel Burn Rate", value: `${inputs.burnRate} gal/hr` },
    { label: "Flight Duration", value: `${inputs.flightHours} hrs` },
    { label: "Trip Fuel", value: `${tripFuel.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal`, highlight: true },
    { label: `Reserve (${inputs.reservePct}%)`, value: `${reserveFuel.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal` },
    { label: "Total Fuel Required", value: `${totalFuelNeeded.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal` },
    { label: "Fuel Price", value: `$${inputs.fuelPrice.toFixed(2)}/gal` },
    { label: "Total Fuel Cost", value: `$${fuelCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, highlight: true },
    { label: "Fuel Cost per Hour", value: `$${fuelPerHourCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Tank Capacity Check", value: adequate ? "Adequate" : "EXCEEDS CAPACITY", highlight: true },
  ];

  const summaryStats = [
    { label: "Trip Fuel", value: `${tripFuel.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal` },
    { label: "Total Fuel Cost", value: `$${fuelCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Fuel Cost per Hour", value: `$${fuelPerHourCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}` },
    { label: "Reserve Remaining at Landing", value: `${reserveRemaining.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal` },
    { label: "Max Endurance", value: `${enduranceHours.toFixed(1)} hrs` },
    { label: "Tank Capacity Check", value: adequate ? "Adequate" : "Exceeds capacity" },
  ];

  return { tripFuel, reserveFuel, totalFuelNeeded, fuelCost, reserveRemaining, enduranceHours, adequate, fuelPerHourCost, chartData, breakdown, summaryStats };
}

const DEFAULTS: FuelBurnInputs = { burnRate: 400, flightHours: 2.5, fuelPrice: 5.5, capacity: 1200, reservePct: 10 };

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

const CustomTooltip = ({ active, payload }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
    <p className="font-bold text-muted-foreground mb-0.5">{payload[0].name}</p>
    <p className="text-primary font-extrabold text-sm">{payload[0].value.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal</p>
  </div>
) : null;

export default function FuelBurnRateCalculator() {
  const [burnRate, setBurnRate] = useState("400");
  const [flightHours, setFlightHours] = useState("2.5");
  const [fuelPrice, setFuelPrice] = useState("5.5");
  const [capacity, setCapacity] = useState("1200");
  const [reservePct, setReservePct] = useState("10");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<FuelBurnResult | null>(null);

  const calculate = () =>
    setResult(calcFuelBurn({
      burnRate: parseFloat(burnRate) || 0,
      flightHours: parseFloat(flightHours) || 0,
      fuelPrice: parseFloat(fuelPrice) || 0,
      capacity: parseFloat(capacity) || 0,
      reservePct: parseFloat(reservePct) || 0,
    }));
  const reset = () => { setBurnRate(DEFAULTS.burnRate.toString()); setFlightHours(DEFAULTS.flightHours.toString()); setFuelPrice(DEFAULTS.fuelPrice.toString()); setCapacity(DEFAULTS.capacity.toString()); setReservePct(DEFAULTS.reservePct.toString()); setShowAdvanced(false); calculate(); };
  useEffect(() => { calculate(); }, []);

  const faqs = [
    { question: "What is fuel burn rate?", answer: "Fuel burn rate is the amount of fuel an aircraft (or engine) consumes per hour of operation, usually expressed in gallons or pounds per hour. Trip fuel is simply burn rate multiplied by flight duration, and planning adds reserve fuel on top." },
    { question: "Why is reserve fuel required?", answer: "Aviation regulations require carrying fuel beyond the planned trip — typically enough for a missed approach, alternate airport, and 30–45 minutes of holding (often modeled as a 10% reserve). Reserve fuel is the safety margin between a routine flight and an emergency diversion." },
    { question: "What is specific fuel consumption?", answer: "SFC measures fuel burned per unit of thrust or power — pounds of fuel per pound of thrust per hour. It is the efficiency metric used in performance planning. A lower SFC means more range and payload for the same fuel load." },
    { question: "How does fuel load affect planning?", answer: "Fuel is heavy: roughly 6 pounds per gallon. Extra fuel reduces payload and range efficiency, so flight planning balances carrying enough fuel against carrying too much. The tank-capacity check here tells you whether your planned trip plus reserve physically fits." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Engineering", href: "/calculator/engineering" }, { label: "Fuel Burn Rate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fuel Burn Rate Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="burn" label="Fuel Burn Rate" value={burnRate} onChange={setBurnRate} suffix="gal/hr" />
              <CompactInput id="hours" label="Flight Duration" value={flightHours} onChange={setFlightHours} suffix="hrs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="price" label="Fuel Price" value={fuelPrice} onChange={setFuelPrice} prefix="$" suffix="/gal" />
              <CompactInput id="capacity" label="Fuel Capacity" value={capacity} onChange={setCapacity} suffix="gal" />
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background mt-3">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block font-medium">Reserve Planning</label>
                    <CompactInput id="reserve" label="Reserve Fuel (of trip fuel)" value={reservePct} onChange={setReservePct} suffix="%" />
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
                <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Total Fuel Cost</div>
                <div className="text-4xl font-extrabold mb-1 tracking-tight text-foreground">${result.fuelCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground font-medium">{result.tripFuel.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal trip fuel + {result.reserveFuel.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal reserve</div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Trip Fuel", `${result.tripFuel.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal`], ["Reserve Remaining", `${result.reserveRemaining.toLocaleString("en-US", { maximumFractionDigits: 0 })} gal`], ["Max Endurance", `${result.enduranceHours.toFixed(1)} hrs`]].map(([l, v], i) => (
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

              <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center min-h-[280px]">
                <h3 className="text-base font-bold mb-2 w-full text-left">Fuel Load Allocation</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie data={result.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value">
                      {result.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 w-full">
                  {result.chartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />{d.name}
                    </div>
                  ))}
                </div>
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
            <h2 className="text-2xl font-bold mb-3">Planning a Flight's Fuel</h2>
            <p>Every flight plan starts with burn rate: how many gallons the aircraft consumes per hour. Multiply by flight time for trip fuel, add reserve for the legal and practical safety margin, and you have the fuel load. This <strong>fuel burn rate calculator</strong> performs that chain of calculations and checks the result against your tank capacity.</p>
            <h2 className="text-2xl font-bold mb-3">The Reserve Is Non-Negotiable</h2>
            <p>Regulations require reserve fuel beyond the planned trip — typically enough for an alternate airport plus 30–45 minutes of holding. Modeling it as a percentage of trip fuel (10% is a common planning figure) keeps the math simple while preserving the safety intent. Never plan a trip that consumes your entire capacity.</p>
            <h2 className="text-2xl font-bold mb-3">Fuel Is the Cost of Lift</h2>
            <p>At typical prices, a 400 gal/hr aircraft burns over $2,200 per hour. That figure drives charter pricing, route economics, and payload decisions. Track burn rate per hour alongside trip cost to keep operating economics visible on every leg.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fuel-burn-rate-calculator" />
          <PopularCalculators exclude="/calculator/fuel-burn-rate-calculator" />
        </div>
      </div>
    </>
  );
}
