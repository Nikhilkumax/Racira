"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw } from "lucide-react";
import {
  BarChart as RBar,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type WashMethod = "pay-per-wash" | "subscription" | "at-home";

interface CarWashInputs {
  primaryMethod: WashMethod;
  washesPerMonth: string;
  costPerWash: string;
  subCostPerMonth: string;
  atHomeCostPerWash: string;
  // Tier 2A
  detailFrequencyPerYear: string;
  detailCost: string;
  hoursPerVisit: string;
  hoursPerHomeWash: string;
  atHomeKitCost: string;
  // Tier 2B
  proMode: boolean;
  timeValuePerHour: string;
  annualPriceInflation: string;
}

interface MethodCost {
  id: WashMethod;
  name: string;
  washCost: number;
  annualTotal: number;
  hours: number;
}

interface TableRow {
  rowId: string;
  label: string;
  value: string;
  key?: boolean;
  total?: boolean;
}

interface CarWashResults {
  annualTotal: number;
  monthlyTotal: number;
  fiveYearTotal: number;
  totalTimeHours: number;
  costPerWashEffective: number;
  detailingAnnual: number;
  methods: MethodCost[];
  cheapest: MethodCost;
  savingsVsChosen: number;
  breakEvenWashes: number;
  subscriptionWorthIt: boolean;
  timeCostAnnual: number;
  trueCostAnnual: number;
  rows: TableRow[];
  isError: boolean;
  errorMsg?: string;
}

const DEFAULTS: CarWashInputs = {
  primaryMethod: "pay-per-wash",
  washesPerMonth: "2",
  costPerWash: "15",
  subCostPerMonth: "35",
  atHomeCostPerWash: "2.50",
  detailFrequencyPerYear: "1",
  detailCost: "150",
  hoursPerVisit: "0.5",
  hoursPerHomeWash: "1.5",
  atHomeKitCost: "100",
  proMode: false,
  timeValuePerHour: "25",
  annualPriceInflation: "3",
};

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const money0 = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const calculateCarWash = (inputs: CarWashInputs): CarWashResults => {
  const washesPerMonth = parseFloat(inputs.washesPerMonth) || 0;
  const costPerWash = parseFloat(inputs.costPerWash) || 0;
  const subCostPerMonth = parseFloat(inputs.subCostPerMonth) || 0;
  const atHomeCostPerWash = parseFloat(inputs.atHomeCostPerWash) || 0;
  const detailFrequencyPerYear = parseFloat(inputs.detailFrequencyPerYear) || 0;
  const detailCost = parseFloat(inputs.detailCost) || 0;
  const hoursPerVisit = parseFloat(inputs.hoursPerVisit) || 0;
  const hoursPerHomeWash = parseFloat(inputs.hoursPerHomeWash) || 0;
  const atHomeKitCost = parseFloat(inputs.atHomeKitCost) || 0;
  const timeValuePerHour = inputs.proMode ? parseFloat(inputs.timeValuePerHour) || 0 : 0;
  const inflation = inputs.proMode ? parseFloat(inputs.annualPriceInflation) || 0 : 0;

  if (washesPerMonth < 0 || costPerWash < 0 || subCostPerMonth < 0 || atHomeCostPerWash < 0) {
    return {
      annualTotal: 0, monthlyTotal: 0, fiveYearTotal: 0, totalTimeHours: 0, costPerWashEffective: 0,
      detailingAnnual: 0, methods: [], cheapest: { id: "pay-per-wash", name: "", washCost: 0, annualTotal: 0, hours: 0 },
      savingsVsChosen: 0, breakEvenWashes: 0, subscriptionWorthIt: false, timeCostAnnual: 0, trueCostAnnual: 0,
      rows: [], isError: true, errorMsg: "Inputs cannot be negative.",
    };
  }

  const washesPerYear = washesPerMonth * 12;
  const detailingAnnual = detailFrequencyPerYear * detailCost;
  // A detail is a half-day job whether you book it or do it yourself
  const detailHours = detailFrequencyPerYear * 4;

  // Every method costed on the SAME wash frequency so they are actually comparable
  const methods: MethodCost[] = [
    {
      id: "pay-per-wash",
      name: "Pay per wash",
      washCost: washesPerYear * costPerWash,
      annualTotal: washesPerYear * costPerWash + detailingAnnual,
      hours: washesPerYear * hoursPerVisit + detailHours,
    },
    {
      id: "subscription",
      name: "Subscription",
      // Fixed fee regardless of usage — that asymmetry is the whole point
      washCost: subCostPerMonth * 12,
      annualTotal: subCostPerMonth * 12 + detailingAnnual,
      hours: washesPerYear * hoursPerVisit + detailHours,
    },
    {
      id: "at-home",
      name: "At home",
      // Kit is a first-year cost amortised over five years of ownership
      washCost: washesPerYear * atHomeCostPerWash + atHomeKitCost / 5,
      annualTotal: washesPerYear * atHomeCostPerWash + atHomeKitCost / 5 + detailingAnnual,
      hours: washesPerYear * hoursPerHomeWash + detailHours,
    },
  ];

  const chosen = methods.find((m) => m.id === inputs.primaryMethod) ?? methods[0];
  const cheapest = methods.reduce((a, b) => (b.annualTotal < a.annualTotal ? b : a), methods[0]);

  const annualTotal = chosen.annualTotal;
  const totalTimeHours = chosen.hours;

  // How many washes a month you must actually take for the subscription to beat pay-per-wash
  const breakEvenWashes = costPerWash > 0 ? subCostPerMonth / costPerWash : 0;
  const subscriptionWorthIt = washesPerMonth >= breakEvenWashes;

  const timeCostAnnual = totalTimeHours * timeValuePerHour;
  const trueCostAnnual = annualTotal + timeCostAnnual;

  // Five-year total, compounding prices if inflation is modelled
  let fiveYearTotal = 0;
  for (let y = 0; y < 5; y++) {
    fiveYearTotal += annualTotal * Math.pow(1 + inflation / 100, y);
  }

  const costPerWashEffective = washesPerYear > 0 ? chosen.washCost / washesPerYear : 0;

  const rows: TableRow[] = [
    { rowId: "freq", label: "Washes per month", value: `${washesPerMonth.toFixed(1)} (${washesPerYear.toFixed(0)}/yr)` },
    { rowId: "method", label: "Chosen method", value: chosen.name },
    { rowId: "wash-cost", label: "Annual washing cost", value: money(chosen.washCost) },
    { rowId: "effective", label: "Effective cost per wash", value: money(costPerWashEffective), key: true },
    { rowId: "detail", label: `Professional detailing (${detailFrequencyPerYear}/yr)`, value: money(detailingAnnual) },
    { rowId: "ppw", label: "If pay per wash instead", value: money(methods[0].annualTotal) },
    { rowId: "sub", label: "If subscription instead", value: money(methods[1].annualTotal) },
    { rowId: "home", label: "If washing at home instead", value: money(methods[2].annualTotal) },
    { rowId: "breakeven", label: "Subscription break-even", value: `${breakEvenWashes.toFixed(1)} washes/mo` },
    { rowId: "hours", label: "Hours spent per year", value: `${totalTimeHours.toFixed(1)} hrs` },
    ...(inputs.proMode
      ? [
          { rowId: "timecost", label: `Time valued at ${money(timeValuePerHour)}/hr`, value: money(timeCostAnnual) },
          { rowId: "true", label: "True annual cost including time", value: money(trueCostAnnual) },
          { rowId: "fiveyr", label: `5-year total at ${inflation}% inflation`, value: money(fiveYearTotal) },
        ]
      : [{ rowId: "fiveyr", label: "5-year total", value: money(fiveYearTotal) }]),
    { rowId: "total", label: "Total annual cost", value: money(annualTotal), total: true },
  ];

  return {
    annualTotal,
    monthlyTotal: annualTotal / 12,
    fiveYearTotal,
    totalTimeHours,
    costPerWashEffective,
    detailingAnnual,
    methods,
    cheapest,
    savingsVsChosen: annualTotal - cheapest.annualTotal,
    breakEvenWashes,
    subscriptionWorthIt,
    timeCostAnnual,
    trueCostAnnual,
    rows,
    isError: false,
  };
};

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  hint?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", hint }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-medium text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
    {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const FAQS = [
  {
    question: "Is a car wash subscription worth it?",
    answer:
      "It depends entirely on one number: the subscription price divided by the single-wash price. That quotient is how many washes per month you must actually take to break even. If a wash is 15 dollars and the plan is 35, you need 2.4 washes a month — anything less and you are losing money. This calculator computes that break-even for your own numbers and tells you which side of it your habits fall on. The industry relies on the gap between intended and actual usage, exactly as gyms do.",
  },
  {
    question: "Are automatic car washes bad for paint?",
    answer:
      "Friction washes with spinning brushes carry grit from every car that came before yours, and that grit is dragged across your clear coat. The result is swirl marks — fine circular scratches visible in direct sunlight. Touchless washes avoid the physical contact but use stronger alkaline chemistry to compensate, which strips wax and sealant faster and can dull plastic trim over time. Neither is as gentle as a careful two-bucket hand wash, but a touchless wash is generally the safer of the two automated options.",
  },
  {
    question: "How much does washing at home really cost?",
    answer:
      "The recurring cost is low — roughly 50 cents to 1.50 dollars per wash in shampoo, plus a few cents of water. The real expense is the initial kit: two buckets with grit guards, a quality wash mitt, drying towels, and a decent shampoo run 75 to 150 dollars. This calculator amortises that kit across five years rather than dumping it into year one, which is the fair way to compare it against a subscription you could cancel tomorrow.",
  },
  {
    question: "Why does the calculator charge my time?",
    answer:
      "Because at-home washing is cheap in money and expensive in hours, and comparing only the money makes it look better than it is. Washing weekly at 90 minutes a session is 78 hours a year — close to two full working weeks. Professional Mode lets you attach an hourly value to that time and shows the true cost of each method. Many people find that at-home washing is genuinely cheaper only if they enjoy doing it; treated as a chore with a wage attached, an automatic wash often wins.",
  },
  {
    question: "How often should I wash my car?",
    answer:
      "Every two weeks is a reasonable default for a daily driver. The case for washing more often is environmental: road salt in winter, tree sap, bird droppings, and industrial fallout are acidic or corrosive and etch clear coat within days if left. The case for washing less is that every wash carries some risk of inflicting swirl marks. If you live somewhere with salted winter roads, wash frequently through winter — including the underbody — and relax the schedule in summer.",
  },
  {
    question: "How often should I have the car detailed?",
    answer:
      "A full detail with clay bar, machine polish, and a fresh coat of sealant or wax is worth doing once or twice a year for a car parked outdoors, and perhaps annually for a garaged one. Detailing is the single largest line item in most car-care budgets — one 250-dollar appointment can exceed an entire year of washing — so it is worth checking what you are actually buying. A paint correction is a genuine restoration; a wash-and-vacuum sold as a detail is not.",
  },
  {
    question: "Does washing my car actually protect its value?",
    answer:
      "Up to a point, yes. Clear coat failure — where the top layer oxidises, clouds, and peels — is expensive to fix and visibly ages a car, and regular washing plus periodic sealant delays it considerably. But there are diminishing returns: the difference between a car washed fortnightly and one washed twice a week is close to nothing in resale value. Spending 1,500 dollars a year to protect a depreciating asset rarely pays for itself, which is what the five-year total in this calculator is there to make visible.",
  },
  {
    question: "Can I cancel a car wash subscription easily?",
    answer:
      "Often less easily than you signed up. Many plans auto-renew monthly, require cancellation through a specific channel rather than at the wash itself, and give no refund for the remainder of a paid month. Some require notice before the billing date. Before subscribing, check the cancellation terms and treat the plan as a recurring commitment rather than a per-visit discount — and if you are close to the break-even line, the flexibility of paying per wash is worth something on its own.",
  },
];

export default function CarWashCostCalculator() {
  const [inputs, setInputs] = useState<CarWashInputs>(DEFAULTS);
  const [results, setResults] = useState<CarWashResults>(calculateCarWash(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResults(calculateCarWash(DEFAULTS));
  }, []);

  const handleChange = <K extends keyof CarWashInputs>(key: K, val: CarWashInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleCalculate = () => setResults(calculateCarWash(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResults(calculateCarWash(DEFAULTS));
    setShowAdvanced(false);
  };

  const chartData = results.isError
    ? []
    : results.methods.map((m) => ({
        id: m.id,
        name: m.name,
        cost: Math.round(m.annualTotal * 100) / 100,
        fill:
          m.id === results.cheapest.id
            ? "hsl(142 71% 45%)"
            : m.id === inputs.primaryMethod
            ? "hsl(217 91% 60%)"
            : "hsl(215 16% 65%)",
      }));

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Car Wash Cost Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Wash Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-foreground mb-1">Primary Wash Method</label>
              <select
                value={inputs.primaryMethod}
                onChange={(e) => handleChange("primaryMethod", e.target.value as WashMethod)}
                className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="pay-per-wash">Pay per wash (automatic or hand)</option>
                <option value="subscription">Monthly wash subscription</option>
                <option value="at-home">At home / driveway</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                All three are costed on your wash frequency so the comparison is like for like.
              </p>
            </div>

            <CompactInput
              id="washes-per-month"
              label="Washes Per Month"
              value={inputs.washesPerMonth}
              onChange={(v) => handleChange("washesPerMonth", v)}
              hint="Be honest — intended frequency is what makes subscriptions profitable."
            />

            <div className="grid grid-cols-2 gap-3">
              <CompactInput
                id="cost-per-wash"
                label="Price Per Wash"
                value={inputs.costPerWash}
                onChange={(v) => handleChange("costPerWash", v)}
                prefix="$"
              />
              <CompactInput
                id="sub-cost"
                label="Subscription / Mo"
                value={inputs.subCostPerMonth}
                onChange={(v) => handleChange("subCostPerMonth", v)}
                prefix="$"
              />
            </div>

            <CompactInput
              id="at-home-cost"
              label="At-Home Supplies Per Wash"
              value={inputs.atHomeCostPerWash}
              onChange={(v) => handleChange("atHomeCostPerWash", v)}
              prefix="$"
            />

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 border-t border-border pt-4 mt-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Detailing</div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="detail-freq"
                        label="Details Per Year"
                        value={inputs.detailFrequencyPerYear}
                        onChange={(v) => handleChange("detailFrequencyPerYear", v)}
                      />
                      <CompactInput
                        id="detail-cost"
                        label="Cost Per Detail"
                        value={inputs.detailCost}
                        onChange={(v) => handleChange("detailCost", v)}
                        prefix="$"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Time &amp; Setup</div>
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="hours-per-visit"
                        label="Hours Per Visit"
                        value={inputs.hoursPerVisit}
                        onChange={(v) => handleChange("hoursPerVisit", v)}
                        suffix="hrs"
                      />
                      <CompactInput
                        id="hours-home"
                        label="Hours Per Home Wash"
                        value={inputs.hoursPerHomeWash}
                        onChange={(v) => handleChange("hoursPerHomeWash", v)}
                        suffix="hrs"
                      />
                    </div>
                    <div className="mt-3">
                      <CompactInput
                        id="kit-cost"
                        label="At-Home Kit Cost"
                        value={inputs.atHomeKitCost}
                        onChange={(v) => handleChange("atHomeKitCost", v)}
                        prefix="$"
                        hint="Buckets, mitt, towels and shampoo — amortised over five years."
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inputs.proMode}
                        onChange={(e) => handleChange("proMode", e.target.checked)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm font-semibold text-foreground">Professional Mode</span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      Prices your time into the comparison and compounds wash prices over the five-year projection.
                    </p>
                    {inputs.proMode && (
                      <div className="grid grid-cols-2 gap-3">
                        <CompactInput
                          id="time-value"
                          label="Your Time Is Worth"
                          value={inputs.timeValuePerHour}
                          onChange={(v) => handleChange("timeValuePerHour", v)}
                          prefix="$"
                          suffix="/hr"
                        />
                        <CompactInput
                          id="inflation"
                          label="Annual Price Rise"
                          value={inputs.annualPriceInflation}
                          onChange={(v) => handleChange("annualPriceInflation", v)}
                          suffix="%"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 w-full flex items-center justify-center rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-colors"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            {results.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none print:hidden"
                    >
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Annual Cost</div>
                  <div className="text-4xl font-bold text-primary mb-1">{money(results.annualTotal)}</div>
                  <div className="text-sm text-muted-foreground">
                    {money(results.monthlyTotal)} per month &middot; {money(results.costPerWashEffective)} per wash &middot;{" "}
                    {results.savingsVsChosen > 0.5 ? (
                      <span className="font-semibold" style={{ color: "hsl(25 95% 53%)" }}>
                        {results.cheapest.name} would save {money(results.savingsVsChosen)}/yr
                      </span>
                    ) : (
                      <span className="font-semibold" style={{ color: "hsl(142 71% 45%)" }}>
                        cheapest of the three
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Three-stat bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Monthly</div>
                    <div className="text-2xl font-bold" style={{ color: "hsl(217 91% 60%)" }}>{money0(results.monthlyTotal)}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">recurring</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">5-Year Total</div>
                    <div className="text-2xl font-bold" style={{ color: "hsl(25 95% 53%)" }}>{money0(results.fiveYearTotal)}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">on a depreciating asset</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Hours / Year</div>
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color:
                          results.totalTimeHours < 15
                            ? "hsl(142 71% 45%)"
                            : results.totalTimeHours < 40
                            ? "hsl(25 95% 53%)"
                            : "hsl(0 84% 60%)",
                      }}
                    >
                      {results.totalTimeHours.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {(results.totalTimeHours / 8).toFixed(1)} working days
                    </div>
                  </div>
                </div>

                {/* 3. Breakdown table */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-bold text-foreground mb-3">Annual Cost Breakdown</h3>
                  <table className="w-full text-base border-collapse">
                    <tbody>
                      {results.rows.map((r) => (
                        <tr
                          key={r.rowId}
                          className={`border-b border-border/60 last:border-0 ${r.key ? "bg-primary/10" : ""} ${r.total ? "border-t-2 border-t-border font-bold" : ""}`}
                        >
                          <td className={`py-2.5 px-3 ${r.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{r.label}</td>
                          <td className={`py-2.5 px-3 text-right tabular-nums ${r.key ? "font-bold text-primary" : "text-foreground"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                  <h3 className="text-base font-bold text-foreground mb-1">All Three Methods Compared</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Annual cost of each method at {inputs.washesPerMonth} washes a month, including detailing. Green is cheapest,
                    blue is your current choice.
                  </p>
                  <div style={{ height: 250 }}>
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RBar data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 65% / 0.25)" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215 16% 65%)" />
                          <YAxis tick={{ fontSize: 11 }} stroke="hsl(215 16% 65%)" width={60} />
                          <RTooltip
                            formatter={(v: number) => [money(v), "Annual cost"]}
                            contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <ReferenceLine
                            y={Math.round(results.annualTotal * 100) / 100}
                            stroke="hsl(0 84% 60%)"
                            strokeDasharray="4 4"
                            label={{ value: "your cost", fontSize: 10, position: "insideTopRight" }}
                          />
                          <Bar dataKey="cost" name="Annual cost" radius={[6, 6, 0, 0]}>
                            {chartData.map((d) => (
                              <Cell key={d.id} fill={d.fill} />
                            ))}
                          </Bar>
                        </RBar>
                      </ResponsiveContainer>
                    ) : null}
                  </div>
                </div>

                {/* 5. Summary statistics — same rows as the breakdown table */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold text-foreground mb-3">Summary Statistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {results.rows.map((r) => (
                      <div key={r.rowId} className="flex justify-between gap-3 text-sm border-b border-border/40 py-1.5 last:border-0">
                        <span className="text-muted-foreground">{r.label}</span>
                        <span className={`tabular-nums text-right ${r.key ? "font-bold text-primary" : "font-medium text-foreground"}`}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    A subscription at {money(parseFloat(inputs.subCostPerMonth) || 0)} a month breaks even against{" "}
                    {money(parseFloat(inputs.costPerWash) || 0)} washes at {results.breakEvenWashes.toFixed(1)} visits a month. You
                    wash {inputs.washesPerMonth} times, so the subscription is{" "}
                    <strong className="text-foreground">
                      {results.subscriptionWorthIt ? "worth it for you" : "losing you money"}
                    </strong>
                    .{" "}
                    {inputs.proMode
                      ? `Adding ${money(results.timeCostAnnual)} of time at ${money(parseFloat(inputs.timeValuePerHour) || 0)} an hour brings the true annual cost to ${money(results.trueCostAnnual)}.`
                      : "Turn on Professional Mode to price your time into the comparison."}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Real Cost of Keeping a Car Clean</h2>
            <p>
              A fifteen-dollar car wash does not feel like a financial decision. Twice a month, though, it is 360 dollars a year,
              and with one professional detail it clears 500 — comparable to a year of tyre wear or a significant slice of an
              insurance premium. Spread across five years of ownership, routine cleaning on a car parked outdoors regularly totals
              two to four thousand dollars, spent entirely on an asset that is losing value the whole time.
            </p>
            <p>
              This calculator exists to make that arithmetic visible and, more usefully, to compare the three ways of paying it.
              Crucially, all three methods are costed against the <em>same</em> wash frequency, so the comparison is like for
              like — which is exactly the comparison the point-of-sale pitch at the car wash never makes.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Subscription Break-Even</h2>
            <p>
              Unlimited wash plans are priced on a simple behavioural bet: that you will pay for more washes than you take. The
              break-even is trivial to compute — subscription price divided by single-wash price — and it is the only number that
              matters when deciding whether to sign up. At 35 dollars a month against 15-dollar washes, you must visit 2.4 times a
              month just to stop losing money, and roughly weekly to feel like you are winning.
            </p>
            <p>
              The business model is the gym membership in a different building. Sign-ups happen in a moment of optimism about
              future behaviour, and the plan is profitable precisely because that optimism is rarely borne out. This is not a
              criticism of car washes — the plans are genuinely good value for people who wash weekly. The failure is in
              subscribing on intention rather than on habit. Enter your honest historical frequency above, not your aspirational
              one, and the calculator will tell you which side of the line you are on.
            </p>

            <h2 className="text-2xl font-bold mb-3">Money, Time, and Which One You Are Actually Spending</h2>
            <p>
              At-home washing looks unbeatable on money: about a dollar of shampoo per wash plus an amortised kit. Weekly, that is
              under 100 dollars a year against 780 for weekly automatic washes. The catch is the other currency. Ninety minutes a
              week is 78 hours a year — nearly two full working weeks spent on the driveway.
            </p>
            <p>
              Whether that trade is good depends on something a calculator cannot know: whether you enjoy it. For people who find
              washing a car genuinely relaxing, the hours are not a cost at all and at-home washing wins outright. For people who
              treat it as a chore, attaching even a modest hourly value inverts the result and the automatic wash becomes the
              rational choice. Professional Mode makes this explicit by pricing the hours, and the honest use of that feature is
              to set the rate to what your leisure time is worth to you rather than to your employer.
            </p>

            <h2 className="text-2xl font-bold mb-3">Where the Money Actually Goes: Detailing and Paint Care</h2>
            <p>
              For most owners, detailing rather than washing is the largest line in the budget. A single 250-dollar appointment
              with clay bar, machine polish, and fresh sealant can exceed an entire year of routine washing. Booked twice a year,
              it dominates everything else, which is why the advanced panel separates it out.
            </p>
            <p>
              The underlying question is what cleaning protects against. Clear coat failure — oxidation, clouding, and eventually
              peeling — is expensive to repair and visibly ages a vehicle, and it is accelerated by road salt, bird droppings,
              tree sap, and industrial fallout, all of which are acidic and etch paint within days. Regular washing genuinely
              delays that, and a sealant genuinely helps. But the returns diminish sharply: fortnightly washing captures nearly
              all the protective benefit, and washing twice a week captures almost none beyond it while adding wear from the
              washing process itself. Friction washes in particular inflict the swirl marks that a later paint correction is paid
              to remove — spending money to create work for money spent later. The five-year total in the results panel is there
              to keep the whole cycle in view at once.
            </p>
          </section>

          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/car-wash-cost-calculator" />
          <PopularCalculators exclude="/calculator/car-wash-cost-calculator" />
        </div>
      </div>
    </>
  );
}
