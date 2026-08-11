"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type Frequency = "week" | "month" | "year";

interface PricePerUseInputs {
  price: number;
  usesPerPeriod: number;
  frequency: Frequency;
  yearsOwned: number;
  // Tier 2A
  resaleValue: number;
  runningCostPerUse: number;
  annualUpkeep: number;
  rentalPricePerUse: number;
  // Tier 2B
  proMode: boolean;
  altPrice: number;
  altYearsLifespan: number;
}

interface CurvePoint {
  uses: number;
  own: number;
  rent: number;
  alt: number;
}

interface TableRow {
  rowId: string;
  label: string;
  value: string;
  key?: boolean;
  total?: boolean;
}

interface PricePerUseResult {
  totalUses: number;
  usesPerYear: number;
  netAcquisitionCost: number;
  totalRunningCost: number;
  totalUpkeep: number;
  trueTotalCost: number;
  simpleCpu: number;
  trueCpu: number;
  rentalTotal: number;
  rentalCpu: number;
  breakEvenUses: number;
  ownershipWins: boolean;
  verdict: string;
  verdictColour: string;
  band: string;
  // Pro
  altTotalCost: number;
  altCpu: number;
  altReplacements: number;
  altWins: boolean;
  curve: CurvePoint[];
  rows: TableRow[];
}

const PERIODS_PER_YEAR: Record<Frequency, number> = {
  week: 52,
  month: 12,
  year: 1,
};

const FREQ_LABEL: Record<Frequency, string> = {
  week: "per week",
  month: "per month",
  year: "per year",
};

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const calculatePricePerUse = (i: PricePerUseInputs): PricePerUseResult => {
  const price = Math.max(0, i.price);
  const usesPerPeriod = Math.max(0, i.usesPerPeriod);
  const years = Math.max(0, i.yearsOwned);
  const resale = Math.max(0, Math.min(price, i.resaleValue));
  const runningPerUse = Math.max(0, i.runningCostPerUse);
  const upkeep = Math.max(0, i.annualUpkeep);
  const rentPerUse = Math.max(0, i.rentalPricePerUse);

  const usesPerYear = usesPerPeriod * PERIODS_PER_YEAR[i.frequency];
  const totalUses = usesPerYear * years;

  // What ownership actually costs you: purchase price less what you get back
  const netAcquisitionCost = price - resale;
  const totalRunningCost = runningPerUse * totalUses;
  const totalUpkeep = upkeep * years;
  const trueTotalCost = netAcquisitionCost + totalRunningCost + totalUpkeep;

  const simpleCpu = totalUses > 0 ? price / totalUses : 0;
  const trueCpu = totalUses > 0 ? trueTotalCost / totalUses : 0;

  const rentalTotal = rentPerUse * totalUses;
  const rentalCpu = rentPerUse;

  // Uses at which cumulative ownership cost drops below cumulative rental cost.
  // Renting has no fixed cost, so: netAcq + upkeep_total + running*n = rent*n
  const perUseGap = rentPerUse - runningPerUse;
  const fixedCost = netAcquisitionCost + totalUpkeep;
  const breakEvenUses = perUseGap > 0 ? fixedCost / perUseGap : Infinity;

  const ownershipWins = rentPerUse > 0 && trueTotalCost < rentalTotal;

  // Cost-per-use bands as a rough purchase sanity check
  const band =
    trueCpu <= 1 ? "Excellent — under $1 per use"
    : trueCpu <= 5 ? "Good — $1 to $5 per use"
    : trueCpu <= 20 ? "Moderate — $5 to $20 per use"
    : "Expensive — over $20 per use";

  const verdictColour =
    trueCpu <= 1 ? "hsl(142 71% 45%)"
    : trueCpu <= 5 ? "hsl(142 71% 45%)"
    : trueCpu <= 20 ? "hsl(25 95% 53%)"
    : "hsl(0 84% 60%)";

  let verdict: string;
  if (totalUses === 0) {
    verdict = "With no uses entered, cost per use is undefined — an unused purchase costs its full price.";
  } else if (rentPerUse > 0 && ownershipWins) {
    verdict = `Buying beats renting: ${money(trueCpu)} per use against ${money(rentalCpu)} to rent, saving ${money(rentalTotal - trueTotalCost)} over ${years} years.`;
  } else if (rentPerUse > 0) {
    verdict = `Renting is cheaper here: ${money(rentalCpu)} per use against ${money(trueCpu)} to own. You would need ${isFinite(breakEvenUses) ? Math.ceil(breakEvenUses).toLocaleString() : "more"} uses to justify buying.`;
  } else {
    verdict = `Each use costs ${money(trueCpu)} across ${Math.round(totalUses).toLocaleString()} uses.`;
  }

  // Tier 2B — a cheaper item that wears out and must be replaced
  const altPrice = Math.max(0, i.altPrice);
  const altLifespan = Math.max(0.01, i.altYearsLifespan);
  const altReplacements = i.proMode ? Math.ceil(years / altLifespan) : 0;
  const altTotalCost = i.proMode ? altPrice * altReplacements + totalRunningCost : 0;
  const altCpu = i.proMode && totalUses > 0 ? altTotalCost / totalUses : 0;
  const altWins = i.proMode && altTotalCost < trueTotalCost;

  // Cumulative cost curves — this is where break-even becomes visible
  const curve: CurvePoint[] = [];
  const steps = 40;
  const maxUses = Math.max(totalUses, isFinite(breakEvenUses) ? breakEvenUses * 1.3 : totalUses, 1);
  for (let s = 0; s <= steps; s++) {
    const n = (maxUses / steps) * s;
    const yearsAtN = usesPerYear > 0 ? n / usesPerYear : 0;
    curve.push({
      uses: Math.round(n),
      own: Math.round((netAcquisitionCost + upkeep * yearsAtN + runningPerUse * n) * 100) / 100,
      rent: Math.round(rentPerUse * n * 100) / 100,
      alt: i.proMode
        ? Math.round((altPrice * Math.max(1, Math.ceil(yearsAtN / altLifespan)) + runningPerUse * n) * 100) / 100
        : 0,
    });
  }

  const rows: TableRow[] = [
    { rowId: "price", label: "Purchase price", value: money(price) },
    { rowId: "uses-period", label: `Uses ${FREQ_LABEL[i.frequency]}`, value: `${usesPerPeriod.toFixed(1)}` },
    { rowId: "uses-year", label: "Uses per year", value: Math.round(usesPerYear).toLocaleString() },
    { rowId: "years", label: "Years you will own it", value: `${years}` },
    { rowId: "total-uses", label: "Total lifetime uses", value: Math.round(totalUses).toLocaleString() },
    { rowId: "simple", label: "Simple cost per use (price ÷ uses)", value: money(simpleCpu) },
    { rowId: "resale", label: "Resale value recovered", value: `−${money(resale)}` },
    { rowId: "net", label: "Net acquisition cost", value: money(netAcquisitionCost) },
    { rowId: "running", label: `Running costs (${money(runningPerUse)} × ${Math.round(totalUses).toLocaleString()})`, value: money(totalRunningCost) },
    { rowId: "upkeep", label: `Upkeep (${money(upkeep)}/yr × ${years})`, value: money(totalUpkeep) },
    { rowId: "true-total", label: "True total cost of ownership", value: money(trueTotalCost) },
    { rowId: "true-cpu", label: "True cost per use", value: money(trueCpu), key: true },
    ...(rentPerUse > 0
      ? [
          { rowId: "rent-cpu", label: "Rental cost per use", value: money(rentalCpu) },
          { rowId: "rent-total", label: "Rental total over the same uses", value: money(rentalTotal) },
          { rowId: "breakeven", label: "Break-even against renting", value: isFinite(breakEvenUses) ? `${Math.ceil(breakEvenUses).toLocaleString()} uses` : "never" },
        ]
      : []),
    ...(i.proMode
      ? [
          { rowId: "alt-cpu", label: "Cheaper alternative, cost per use", value: money(altCpu) },
          { rowId: "alt-total", label: `Alternative total (${altReplacements} purchases)`, value: money(altTotalCost) },
        ]
      : []),
    { rowId: "band", label: "Verdict", value: band, total: true },
  ];

  return {
    totalUses, usesPerYear, netAcquisitionCost, totalRunningCost, totalUpkeep, trueTotalCost,
    simpleCpu, trueCpu, rentalTotal, rentalCpu, breakEvenUses, ownershipWins, verdict, verdictColour, band,
    altTotalCost, altCpu, altReplacements, altWins, curve, rows,
  };
};

const DEFAULTS: PricePerUseInputs = {
  price: 250,
  usesPerPeriod: 2,
  frequency: "week",
  yearsOwned: 3,
  resaleValue: 40,
  runningCostPerUse: 0,
  annualUpkeep: 0,
  rentalPricePerUse: 0,
  proMode: false,
  altPrice: 80,
  altYearsLifespan: 1,
};

const FAQS = [
  {
    question: "What is cost per use and why does it matter?",
    answer:
      "Cost per use divides what something costs by how many times you actually use it, converting a purchase price into a rate you can compare against alternatives. It matters because price alone is a poor guide to value: a 400 dollar coat worn 200 times costs 2 dollars a wear, while an 80 dollar coat worn five times costs 16. The expensive item is five times better value despite costing five times more, and no amount of staring at the price tags reveals that.",
  },
  {
    question: "Why does this calculator subtract resale value?",
    answer:
      "Because you get that money back, so it was never really spent. If a 1,200 dollar bike sells for 500 after four years, your actual cost of ownership was 700, not 1,200 — and the cost per use should reflect that. Items with strong resale markets, such as quality tools, cameras, bikes, and some furniture, have dramatically lower true cost per use than their sticker price implies. Fast-fashion clothing and consumer electronics with poor resale do not get this benefit.",
  },
  {
    question: "What is a good cost per use?",
    answer:
      "It depends on the category, but useful rules of thumb exist. For clothing, under 5 dollars per wear is generally considered good and under 1 dollar is excellent. For tools and equipment, compare against the rental price for the same item. For subscriptions and memberships, compare against paying per visit. The bands this calculator reports are deliberately generic — the number only becomes meaningful when you compare it to a specific alternative, which is why the rental comparison exists.",
  },
  {
    question: "How do I decide between buying and renting?",
    answer:
      "Find the break-even point: the number of uses at which the cumulative cost of ownership drops below the cumulative cost of renting. Below it, rent; above it, buy. A tile saw costing 300 dollars to buy and 60 dollars a day to rent breaks even at five days of use. If you have one bathroom to tile, rent. If you are renovating a house over two years, buy. The chart in this calculator plots both cumulative curves so the crossing point is visible rather than theoretical.",
  },
  {
    question: "Is buying the cheap version or the expensive version better value?",
    answer:
      "It depends entirely on the ratio of price to lifespan, which is what Professional Mode compares. A 200 dollar pair of boots lasting five years beats a 60 dollar pair lasting one, because you buy the cheap ones five times. But this reasoning is frequently abused to justify purchases: it only holds if the expensive item genuinely lasts proportionally longer, and if you actually keep it that long. Entering honest lifespans for both, rather than optimistic ones, is where this calculation earns its keep.",
  },
  {
    question: "Does cost per use account for the time value of money?",
    answer:
      "No, and that is a deliberate simplification worth knowing about. Money spent today is worth more than money spent in three years, so a cheap item replaced repeatedly carries a small advantage this model does not credit it with. For typical consumer purchases over a few years, the effect is small enough to ignore. For large capital items over long horizons — a vehicle, a heat pump, industrial equipment — you should discount future costs properly rather than relying on a straight cost-per-use comparison.",
  },
  {
    question: "What running costs should I include?",
    answer:
      "Anything you would not pay if you did not own the item. For a printer that means ink and paper; for a car, fuel, insurance, and servicing; for a coffee machine, beans and descaler; for a gym membership, nothing beyond the fee. Running costs are where cost-per-use analysis most often surprises people, because the purchase price of an inkjet printer or an espresso machine can be dwarfed by consumables within a year or two. Enter per-use costs and annual upkeep separately so both scale correctly.",
  },
  {
    question: "Can cost per use justify any purchase?",
    answer:
      "Only if you are dishonest about the numbers, which is the main failure mode of this kind of reasoning. The two places it goes wrong are overestimating how often you will use something and overestimating how long you will keep it. Before entering a usage figure, check it against something real — how often you used the last comparable item, or what your calendar actually looks like. A projected three-times-a-week habit that turns out to be twice a month multiplies the true cost per use by six.",
  },
];

const PricePerUseCalculator = () => {
  const [inputs, setInputs] = useState<PricePerUseInputs>(DEFAULTS);
  const [result, setResult] = useState<PricePerUseResult>(calculatePricePerUse(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculatePricePerUse(DEFAULTS));
  }, []);

  const set = <K extends keyof PricePerUseInputs>(key: K, val: PricePerUseInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleCalculate = () => setResult(calculatePricePerUse(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculatePricePerUse(DEFAULTS));
    setShowAdvanced(false);
  };

  const wrap =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel =
    "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium text-foreground mb-1";

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Price Per Use Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Price Per Use Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex flex-col">
              <label className={lbl}>Purchase Price</label>
              <div className={wrap}>
                <span className="pl-3 text-sm text-muted-foreground select-none">$</span>
                <input
                  type="number"
                  value={inputs.price}
                  onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
                  className={ci}
                  min={0}
                  step={5}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className={lbl}>How Often You Use It</label>
                <div className={wrap}>
                  <input
                    type="number"
                    value={inputs.usesPerPeriod}
                    onChange={(e) => set("usesPerPeriod", parseFloat(e.target.value) || 0)}
                    className={ci}
                    min={0}
                    step={0.5}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className={lbl}>Per</label>
                <select
                  value={inputs.frequency}
                  onChange={(e) => set("frequency", e.target.value as Frequency)}
                  className={sel}
                >
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <label className={lbl}>Years You Will Own It</label>
              <div className={wrap}>
                <input
                  type="number"
                  value={inputs.yearsOwned}
                  onChange={(e) => set("yearsOwned", parseFloat(e.target.value) || 0)}
                  className={ci}
                  min={0}
                  step={0.5}
                />
                <span className="pr-3 text-sm text-muted-foreground select-none">yrs</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Be honest rather than optimistic — overstating usage and lifespan is how this calculation gets abused.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-sm font-semibold text-primary hover:underline text-left mt-1"
            >
              {showAdvanced ? "− Hide" : "+ Show"} Advanced Options
            </button>

            {showAdvanced && (
              <div className="flex flex-col gap-4 border-t border-border pt-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">True Cost</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className={lbl}>Resale Value</label>
                      <div className={wrap}>
                        <span className="pl-3 text-sm text-muted-foreground select-none">$</span>
                        <input
                          type="number"
                          value={inputs.resaleValue}
                          onChange={(e) => set("resaleValue", parseFloat(e.target.value) || 0)}
                          className={ci}
                          min={0}
                          step={5}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className={lbl}>Cost Per Use</label>
                      <div className={wrap}>
                        <span className="pl-3 text-sm text-muted-foreground select-none">$</span>
                        <input
                          type="number"
                          value={inputs.runningCostPerUse}
                          onChange={(e) => set("runningCostPerUse", parseFloat(e.target.value) || 0)}
                          className={ci}
                          min={0}
                          step={0.25}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col mt-3">
                    <label className={lbl}>Annual Upkeep</label>
                    <div className={wrap}>
                      <span className="pl-3 text-sm text-muted-foreground select-none">$</span>
                      <input
                        type="number"
                        value={inputs.annualUpkeep}
                        onChange={(e) => set("annualUpkeep", parseFloat(e.target.value) || 0)}
                        className={ci}
                        min={0}
                        step={5}
                      />
                      <span className="pr-3 text-sm text-muted-foreground select-none">/yr</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Servicing, insurance, storage — anything you pay yearly just to keep owning it.
                    </p>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Rent Instead?</div>
                  <div className="flex flex-col">
                    <label className={lbl}>Rental Price Per Use</label>
                    <div className={wrap}>
                      <span className="pl-3 text-sm text-muted-foreground select-none">$</span>
                      <input
                        type="number"
                        value={inputs.rentalPricePerUse}
                        onChange={(e) => set("rentalPricePerUse", parseFloat(e.target.value) || 0)}
                        className={ci}
                        min={0}
                        step={1}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave at zero if renting is not an option. Enter a price to see the break-even point.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.proMode}
                      onChange={(e) => set("proMode", e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm font-semibold text-foreground">Professional Mode</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    Compares against a cheaper alternative that wears out and has to be replaced.
                  </p>
                  {inputs.proMode && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className={lbl}>Cheaper Option</label>
                        <div className={wrap}>
                          <span className="pl-3 text-sm text-muted-foreground select-none">$</span>
                          <input
                            type="number"
                            value={inputs.altPrice}
                            onChange={(e) => set("altPrice", parseFloat(e.target.value) || 0)}
                            className={ci}
                            min={0}
                            step={5}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className={lbl}>Its Lifespan</label>
                        <div className={wrap}>
                          <input
                            type="number"
                            value={inputs.altYearsLifespan}
                            onChange={(e) => set("altYearsLifespan", parseFloat(e.target.value) || 0)}
                            className={ci}
                            min={0.1}
                            step={0.5}
                          />
                          <span className="pr-3 text-sm text-muted-foreground select-none">yrs</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 w-full rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 transition-colors flex items-center justify-center font-bold text-base"
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

          {/* RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. Primary */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-sm font-bold uppercase tracking-wider text-primary mb-1">True Cost Per Use</div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-primary tracking-tight">{money(result.trueCpu)}</div>
                <div className="text-lg font-semibold text-muted-foreground">per use</div>
              </div>
              <div className="text-sm font-medium text-muted-foreground mt-2">
                {Math.round(result.totalUses).toLocaleString()} uses over {inputs.yearsOwned} years &middot; simple rate{" "}
                {money(result.simpleCpu)} &middot;{" "}
                <span className="font-semibold" style={{ color: result.verdictColour }}>
                  {result.band}
                </span>
              </div>
            </div>

            {/* 2. Three-stat bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Uses</div>
                <div className="text-2xl font-bold" style={{ color: "hsl(217 91% 60%)" }}>
                  {Math.round(result.totalUses).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {Math.round(result.usesPerYear).toLocaleString()} per year
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">True Total Cost</div>
                <div className="text-2xl font-bold" style={{ color: "hsl(25 95% 53%)" }}>{money(result.trueTotalCost)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">after resale</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Cost Per Use</div>
                <div className="text-2xl font-bold" style={{ color: result.verdictColour }}>{money(result.trueCpu)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {inputs.rentalPricePerUse > 0
                    ? result.ownershipWins
                      ? "buying wins"
                      : "renting wins"
                    : "vs no alternative"}
                </div>
              </div>
            </div>

            {/* 3. Breakdown table */}
            <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-3">Cost Breakdown</h3>
              <table className="w-full text-base border-collapse">
                <tbody>
                  {result.rows.map((r) => (
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
              <h3 className="text-base font-bold text-foreground mb-1">Cumulative Cost Against Uses</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {inputs.rentalPricePerUse > 0
                  ? `Ownership starts high and flattens; renting starts at zero and climbs. Where they cross is the break-even at ${isFinite(result.breakEvenUses) ? Math.ceil(result.breakEvenUses).toLocaleString() : "—"} uses.`
                  : "Cumulative cost of ownership as uses accumulate. Add a rental price in Advanced Options to see a break-even comparison."}
              </p>
              <div style={{ height: 250 }}>
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={result.curve} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 65% / 0.25)" />
                      <XAxis dataKey="uses" tick={{ fontSize: 11 }} stroke="hsl(215 16% 65%)" />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        stroke="hsl(215 16% 65%)"
                        width={64}
                        tickFormatter={(v: number) => `$${Math.round(v)}`}
                      />
                      <RTooltip
                        formatter={(v: number, name: string) => [money(v), name]}
                        labelFormatter={(l: number) => `${Number(l).toLocaleString()} uses`}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {isFinite(result.breakEvenUses) && inputs.rentalPricePerUse > 0 && (
                        <ReferenceLine
                          x={Math.round(result.breakEvenUses)}
                          stroke="hsl(0 84% 60%)"
                          strokeDasharray="4 4"
                          label={{ value: "break-even", fontSize: 10, position: "insideTopRight" }}
                        />
                      )}
                      <Line type="monotone" dataKey="own" name="Buying" stroke="hsl(217 91% 60%)" strokeWidth={2.5} dot={false} />
                      {inputs.rentalPricePerUse > 0 && (
                        <Line type="monotone" dataKey="rent" name="Renting" stroke="hsl(25 95% 53%)" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                      )}
                      {inputs.proMode && (
                        <Line type="monotone" dataKey="alt" name="Cheaper option" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </div>

            {/* Pro mode */}
            {inputs.proMode && (
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-3">Buy Once or Buy Cheap?</h3>
                <table className="w-full text-base border-collapse">
                  <tbody>
                    <tr className="border-b border-border/60">
                      <td className="py-2.5 px-3 text-muted-foreground">Quality option, bought once</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-foreground">{money(result.trueTotalCost)}</td>
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="py-2.5 px-3 text-muted-foreground">
                        Cheaper option at {money(inputs.altPrice)}, replaced every {inputs.altYearsLifespan} yrs
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-foreground">
                        {money(result.altTotalCost)} ({result.altReplacements}×)
                      </td>
                    </tr>
                    <tr className="border-t-2 border-t-border font-bold">
                      <td className="py-2.5 px-3 text-foreground">Difference over {inputs.yearsOwned} years</td>
                      <td
                        className="py-2.5 px-3 text-right tabular-nums"
                        style={{ color: result.altWins ? "hsl(25 95% 53%)" : "hsl(142 71% 45%)" }}
                      >
                        {money(Math.abs(result.trueTotalCost - result.altTotalCost))}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div
                  className="mt-4 rounded-lg p-3 border"
                  style={{
                    borderColor: result.altWins ? "hsl(25 95% 53%)" : "hsl(142 71% 45%)",
                    backgroundColor: result.altWins ? "hsl(25 95% 53% / 0.1)" : "hsl(142 71% 45% / 0.1)",
                  }}
                >
                  <div className="text-sm text-muted-foreground">
                    {result.altWins
                      ? `Buying cheap repeatedly is actually cheaper here, by ${money(result.altTotalCost > 0 ? result.trueTotalCost - result.altTotalCost : 0)} over ${inputs.yearsOwned} years. The "buy once, cry once" argument only holds when the quality item genuinely outlasts the cheap one by more than its price premium.`
                      : `Buying once is cheaper by ${money(result.altTotalCost - result.trueTotalCost)} over ${inputs.yearsOwned} years, because you would need ${result.altReplacements} of the cheaper option to cover the same period.`}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Summary statistics — same rows as the breakdown table */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold text-foreground mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {result.rows.map((r) => (
                  <div key={r.rowId} className="flex justify-between gap-3 text-sm border-b border-border/40 py-1.5 last:border-0">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className={`tabular-nums text-right ${r.key ? "font-bold text-primary" : "font-medium text-foreground"}`}>{r.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">{result.verdict}</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Price Is What You Pay, Cost Per Use Is What You Get</h2>
            <p>
              A price tag tells you almost nothing about whether something is good value. A 400 dollar winter coat worn 200 times
              over four years costs 2 dollars a wear. An 80 dollar coat that sits in a wardrobe and gets worn five times costs 16
              dollars a wear. The expensive coat is eight times better value, and nothing about comparing 400 against 80 reveals
              that. Cost per use converts a one-off price into a rate, and rates are comparable in a way that prices are not.
            </p>
            <p>
              The calculation is trivially simple — price divided by uses — which is exactly why it is so often done badly. The
              two numbers that actually determine the answer are how often you will use the thing and how long you will keep it,
              and both are estimates about your own future behaviour, which people are famously bad at making. Everything useful
              about this tool lies in tightening those two estimates and in adding the costs that the simple formula ignores.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Costs the Simple Formula Misses</h2>
            <p>
              Three adjustments separate a naive cost per use from an honest one. The first is <strong>resale value</strong>. If a
              1,200 dollar bicycle sells for 500 after four years, ownership cost 700, not 1,200. Items with liquid second-hand
              markets — quality tools, cameras, bicycles, some furniture and appliances — have far lower true cost per use than
              their price suggests, and this is a genuine and underrated argument for buying well.
            </p>
            <p>
              The second is <strong>running cost</strong>, which scales with usage and can dwarf the purchase price. Inkjet
              printers are the canonical example: the hardware is nearly free and the ink is not. Espresso machines, cars, and
              anything with consumables behave the same way. The third is <strong>annual upkeep</strong> — servicing, insurance,
              storage — which accrues with time rather than use, and which quietly punishes items you own but rarely touch. A
              boat used four times a year is expensive not because of the four uses but because of the eleven months of mooring
              fees between them.
            </p>

            <h2 className="text-2xl font-bold mb-3">Buying Versus Renting: Find the Break-Even</h2>
            <p>
              Whenever renting is possible, cost per use becomes a genuine decision procedure rather than a curiosity. Ownership
              carries a large fixed cost and a small marginal cost; renting carries no fixed cost and a large marginal one. Plot
              both as cumulative curves and they cross at a specific number of uses — below it, renting is cheaper; above it,
              buying is.
            </p>
            <p>
              A tile saw at 300 dollars to buy against 60 dollars a day to rent breaks even at five days. One bathroom means
              renting; a two-year house renovation means buying. A ski setup at 900 dollars against 50 dollars a day breaks even
              at eighteen days, which is three or four seasons for a casual skier and a single season for a committed one. The
              chart above draws exactly this crossing, and the honest way to use it is to locate your realistic usage on the
              horizontal axis first, then read off which curve is lower — rather than deciding what you want and adjusting the
              usage until the chart agrees.
            </p>

            <h2 className="text-2xl font-bold mb-3">Buy Once or Buy Cheap Repeatedly?</h2>
            <p>
              The &ldquo;buy once, cry once&rdquo; principle holds that quality is cheaper over a long enough horizon, because
              cheap items must be replaced. Sometimes that is correct: 200 dollar boots lasting five years genuinely beat 60
              dollar boots lasting one, since you would buy five pairs of the latter. Professional Mode runs that comparison
              directly, counting replacement cycles across your ownership period.
            </p>
            <p>
              But the principle is also among the most abused arguments in consumer spending, because it is usually deployed
              without the arithmetic. It only holds when the quality item outlasts the cheap one by more than its price premium —
              a 300 dollar item lasting twice as long as a 60 dollar one is a bad deal, not a good one. It also assumes you keep
              the item for its full life, which fails badly for anything subject to changing taste, changing needs, or
              technological obsolescence. Run the numbers rather than invoking the slogan, and be willing to accept the answer
              when it says the cheap option wins.
            </p>
          </section>
          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/price-per-use-calculator" />
          <PopularCalculators exclude="/calculator/price-per-use-calculator" />
        </div>
      </div>
    </>
  );
};

export default PricePerUseCalculator;
