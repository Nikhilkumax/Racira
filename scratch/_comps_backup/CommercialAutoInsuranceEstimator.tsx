"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type VehicleType = "van" | "pickup" | "boxTruck";
type BusinessUse = "trades" | "delivery" | "other";
type Limit = "500k" | "1m" | "2m";

interface Inputs {
  vehicles: number;
  vehicleType: VehicleType;
  use: BusinessUse;
  annualMiles: number;
  drivers: number;
  claims: number;
  limit: Limit;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  monthlyPremium: number;
  annualPremium: number;
  perVehicleAnnual: number;
  vehicleBasis: number;
  donutData: { name: string; value: number; color: string }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const PIE_COLORS = ["hsl(var(--primary))", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const VEHICLE_BASES: Record<VehicleType, { label: string; annual: number }> = {
  van: { label: "Cargo Van", annual: 3100 },
  pickup: { label: "Pickup Truck", annual: 2700 },
  boxTruck: { label: "Box Truck", annual: 4400 },
};

const USE_FACTORS: Record<BusinessUse, { label: string; f: number }> = {
  trades: { label: "Contractor / Trades", f: 1.15 },
  delivery: { label: "Delivery / Route", f: 1.4 },
  other: { label: "Other Business Use", f: 1 },
};

const LIMIT_FACTORS: Record<Limit, { label: string; f: number }> = {
  "500k": { label: "$500,000", f: 0.85 },
  "1m": { label: "$1,000,000", f: 1 },
  "2m": { label: "$2,000,000", f: 1.2 },
};

const claimsFactor = (c: number) => (c <= 0 ? 1 : c === 1 ? 1.3 : c === 2 ? 1.55 : 1.8);
const milesFactor = (m: number) => (m <= 15000 ? 0.95 : m <= 25000 ? 1 : m <= 50000 ? 1.15 : 1.3);
const driverFactor = (drivers: number, vehicles: number) =>
  vehicles <= 0 ? 1 : drivers <= vehicles * 1.2 ? 1 : drivers <= vehicles * 1.8 ? 1.1 : 1.2;

function calc(inp: Inputs): Result {
  const base = VEHICLE_BASES[inp.vehicleType].annual;
  const vehicleBasis = base * Math.max(1, inp.vehicles);
  const fUse = USE_FACTORS[inp.use].f;
  const fMiles = milesFactor(inp.annualMiles);
  const fClaims = claimsFactor(inp.claims);
  const fLimit = LIMIT_FACTORS[inp.limit].f;
  const fDrivers = driverFactor(inp.drivers, inp.vehicles);
  const annualPremium = vehicleBasis * fUse * fMiles * fClaims * fLimit * fDrivers;
  const monthlyPremium = annualPremium / 12;
  const perVehicleAnnual = annualPremium / Math.max(1, inp.vehicles);

  // Typical commercial auto premium split (liability / physical damage / medical+UM)
  const liability = annualPremium * 0.44;
  const physical = annualPremium * 0.41;
  const medical = annualPremium * 0.15;
  const donutData = [
    { name: "Liability", value: Math.round(liability), color: PIE_COLORS[0] },
    { name: "Physical Damage", value: Math.round(physical), color: PIE_COLORS[1] },
    { name: "Medical & Uninsured", value: Math.round(medical), color: PIE_COLORS[2] },
  ].filter((d) => d.value > 0);

  const breakdown: Row[] = [
    { label: "Vehicles in Fleet", value: String(inp.vehicles) + " × " + VEHICLE_BASES[inp.vehicleType].label, sum: true },
    { label: "Vehicle Basis (Annual)", value: money(vehicleBasis), sum: true },
    { label: "Business Use — " + USE_FACTORS[inp.use].label, value: fUse.toFixed(2).replace(/\.?0+$/, "") + "×" },
    { label: "Annual Miles per Vehicle — " + inp.annualMiles.toLocaleString("en-US"), value: fMiles.toFixed(2).replace(/\.?0+$/, "") + "×" },
    { label: `Claims (3 yrs) — ${inp.claims}`, value: fClaims.toFixed(2) + "×" },
    { label: "Combined Single Limit — " + LIMIT_FACTORS[inp.limit].label, value: fLimit.toFixed(2).replace(/\.?0+$/, "") + "×" },
    { label: `Drivers — ${inp.drivers} across ${inp.vehicles} vehicle${inp.vehicles === 1 ? "" : "s"}`, value: fDrivers.toFixed(2).replace(/\.?0+$/, "") + "×" },
    { label: "Estimated Annual Premium", value: money(annualPremium), isTotal: true, sum: true },
    { label: "Per-Vehicle Annual Cost", value: money(perVehicleAnnual), highlight: true, sum: true },
  ];

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return { monthlyPremium, annualPremium, perVehicleAnnual, vehicleBasis, donutData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { vehicles: 2, vehicleType: "van", use: "trades", annualMiles: 25000, drivers: 3, claims: 0, limit: "1m" };

export default function CommercialAutoInsuranceEstimator() {
  const [vehicles, setVehicles] = useState(String(DEFAULTS.vehicles));
  const [vehicleType, setVehicleType] = useState<VehicleType>(DEFAULTS.vehicleType);
  const [use, setUse] = useState<BusinessUse>(DEFAULTS.use);
  const [annualMiles, setAnnualMiles] = useState(String(DEFAULTS.annualMiles));
  const [drivers, setDrivers] = useState(String(DEFAULTS.drivers));
  const [claims, setClaims] = useState(String(DEFAULTS.claims));
  const [limit, setLimit] = useState<Limit>(DEFAULTS.limit);
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    vehicles: parseInt(vehicles) || 0,
    vehicleType,
    use,
    annualMiles: parseFloat(annualMiles) || 0,
    drivers: parseInt(drivers) || 0,
    claims: parseInt(claims) || 0,
    limit,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setVehicles(String(DEFAULTS.vehicles));
    setVehicleType(DEFAULTS.vehicleType);
    setUse(DEFAULTS.use);
    setAnnualMiles(String(DEFAULTS.annualMiles));
    setDrivers(String(DEFAULTS.drivers));
    setClaims(String(DEFAULTS.claims));
    setLimit(DEFAULTS.limit);
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const v = parseInt(vehicles) || 0;
  const mi = parseFloat(annualMiles) || 0;
  const dr = parseInt(drivers) || 0;
  const cl = parseInt(claims) || 0;

  const valErrors: Record<string, string> = {};
  if (vehicles === "" || isNaN(parseInt(vehicles))) valErrors.vehicles = "Enter number of vehicles";
  else if (v < 1) valErrors.vehicles = "At least 1 vehicle";
  else if (v > 50) valErrors.vehicles = "Max 50 vehicles";
  if (annualMiles === "" || isNaN(parseFloat(annualMiles))) valErrors.annualMiles = "Enter annual miles";
  else if (mi <= 0) valErrors.annualMiles = "Miles must be greater than 0";
  else if (mi > 200000) valErrors.annualMiles = "Miles look too high";
  if (drivers === "" || isNaN(parseInt(drivers))) valErrors.drivers = "Enter number of drivers";
  else if (dr < 1) valErrors.drivers = "At least 1 driver";
  else if (dr > 200) valErrors.drivers = "Driver count looks too high";
  if (claims === "" || isNaN(parseInt(claims))) valErrors.claims = "Enter claims";
  else if (cl < 0) valErrors.claims = "Claims cannot be negative";
  else if (cl > 5) valErrors.claims = "Max 5 claims";
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const selectCls =
    "w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  const res = result;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Commercial Auto Insurance Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Commercial Auto Insurance Estimator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ca-vehicles" className="text-sm font-medium mb-1 block">Vehicles in Fleet</label>
                <div className={inputCls}>
                  <input id="ca-vehicles" type="number" min="1" max="50" step="1" value={vehicles} onChange={(e) => setVehicles(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.vehicles && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.vehicles}</p>}
              </div>
              <div>
                <label htmlFor="ca-type" className="text-sm font-medium mb-1 block">Vehicle Type</label>
                <div className="relative h-10">
                  <select id="ca-type" value={vehicleType} onChange={(e) => setVehicleType(e.target.value as VehicleType)} className={selectCls}>
                    <option value="van">Cargo Van</option>
                    <option value="pickup">Pickup Truck</option>
                    <option value="boxTruck">Box Truck</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ca-use" className="text-sm font-medium mb-1 block">Business Use</label>
                <div className="relative h-10">
                  <select id="ca-use" value={use} onChange={(e) => setUse(e.target.value as BusinessUse)} className={selectCls}>
                    <option value="trades">Contractor / Trades</option>
                    <option value="delivery">Delivery / Route</option>
                    <option value="other">Other Business Use</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="ca-miles" className="text-sm font-medium mb-1 block">Annual Miles per Vehicle</label>
                <div className={inputCls}>
                  <input id="ca-miles" type="number" min="1" step="500" value={annualMiles} onChange={(e) => setAnnualMiles(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.annualMiles && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.annualMiles}</p>}
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center justify-center gap-1.5 py-1 text-sm text-primary font-medium hover:underline">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Drivers &amp; History</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ca-drivers" className="text-sm font-medium mb-1 block">Number of Drivers</label>
                      <div className={inputCls}>
                        <input id="ca-drivers" type="number" min="1" max="200" step="1" value={drivers} onChange={(e) => setDrivers(e.target.value)} className={fieldCls} />
                      </div>
                      {valErrors.drivers && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.drivers}</p>}
                    </div>
                    <div>
                      <label htmlFor="ca-claims" className="text-sm font-medium mb-1 block">Claims (Past 3 Yrs)</label>
                      <div className={inputCls}>
                        <input id="ca-claims" type="number" min="0" max="5" step="1" value={claims} onChange={(e) => setClaims(e.target.value)} className={fieldCls} />
                      </div>
                      {valErrors.claims && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.claims}</p>}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Coverage</div>
                  <div>
                    <label htmlFor="ca-limit" className="text-sm font-medium mb-1 block">Combined Single Limit</label>
                    <div className="relative h-10">
                      <select id="ca-limit" value={limit} onChange={(e) => setLimit(e.target.value as Limit)} className={selectCls}>
                        <option value="500k">$500,000</option>
                        <option value="1m">$1,000,000</option>
                        <option value="2m">$2,000,000</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button type="button" disabled={hasErrors} onClick={calcNow} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
            </div>
            {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {res && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Premium</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money2(res.monthlyPremium)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {v} {VEHICLE_BASES[vehicleType].label.toLowerCase()}{v > 1 ? "s" : ""} · {USE_FACTORS[use].label} · ≈ {money(res.annualPremium)}/yr fleet-wide
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Annual Premium", money(res.annualPremium), "text-primary"],
                    ["Per-Vehicle Annual", money(res.perVehicleAnnual), res.perVehicleAnnual < 2500 ? "text-emerald-600" : res.perVehicleAnnual <= 4000 ? "text-amber-600" : "text-red-600"],
                    ["Vehicles Insured", String(v), "text-foreground"],
                  ].map(([l, vv, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{vv}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Where the Premium Goes</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <RPie>
                      <Pie data={res.donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {res.donutData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [money(Number(value)), name]} />
                    </RPie>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2 text-center">Typical commercial auto split: liability, physical damage (collision + comprehensive), and medical / uninsured coverage. Percentages sum to 100%.</p>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Premium Build-Up</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {res.breakdown.map((r, idx) => (
                        <tr key={idx} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold" : ""} ${r.highlight ? "bg-primary/5" : ""}`}>
                          <td className={`py-2.5 px-3 ${r.highlight || r.isTotal ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                          <td className={`py-2.5 px-3 text-right ${r.highlight || r.isTotal ? "font-bold text-primary" : "font-semibold"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {res.summaryStats.map((s, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold text-right">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Commercial Auto Is Priced Differently</h2>
            <p>Commercial auto insurance covers vehicles used for business — cargo vans, pickups, and box trucks — and it is priced on fleet characteristics rather than a single driver's record. Insurers start from the vehicle class and add multipliers for how the truck is used (contractors and delivery routes face more exposure than light office errands), miles driven, the number of drivers who could be behind the wheel, and the last three years of fleet claims. Liability limits are usually written as a combined single limit — one pool of coverage for bodily injury and property damage per accident. This estimator applies those factors transparently; a real quote also weighs your specific vehicles' VINs, state, and loss runs, so treat the result as a planning range and request quotes from a commercial broker.</p>
          </section>
          <FAQSection faqs={[
            { question: "Do I need commercial auto insurance if I use my personal truck for work?", answer: "Almost always yes. Personal auto policies exclude business use — delivering goods, carrying tools or equipment for hire, or driving as your primary job function. If you have an accident during work use, a personal policy can deny the claim entirely. A commercial policy (or a business-use endorsement, where allowed) closes that gap." },
            { question: "How many drivers can a commercial policy cover?", answer: "List every employee who may drive the insured vehicles — typically anyone with a valid license and permission. Insurers price the driver count into the premium and, more importantly, may deny coverage for an unlisted driver after a loss. Scheduled-driver policies charge per named driver; fleet policies rate on the driver-to-vehicle ratio." },
            { question: "What limits should a small business carry?", answer: "Most commercial auto experts recommend at least $1,000,000 in combined single limit, and many contracts with clients or general contractors require it. The premium jump from $500,000 to $1,000,000 is usually modest — roughly 15% in this model — while an uncovered six-figure injury judgment can be catastrophic for a small business." },
          ]} pageUrl="https://racira.com/calculator/commercial-auto-insurance-estimator" />
          <PopularCalculators exclude="/calculator/commercial-auto-insurance-estimator" />
        </div>
      </div>
    </>
  );
}
