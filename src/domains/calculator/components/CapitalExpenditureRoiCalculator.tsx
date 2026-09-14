"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  capexCost: string;
  annualSavings: string;
  usefulLife: string;
  depreciation: string;
  maintenanceCost: string;
  discountRate: string;
  salvageValue: string;
}

interface Result {
  annualDepreciation: number;
  netAnnualBenefit: number;
  totalBenefit: number;
  npv: number;
  roiPct: number;
  paybackYears: number;
}

const DEFAULTS: Inputs = {
  capexCost: "200000",
  annualSavings: "65000",
  usefulLife: "10",
  depreciation: "straight",
  maintenanceCost: "8000",
  discountRate: "10",
  salvageValue: "20000",
};

function calculate(inputs: Inputs): Result {
  const capexCost = Math.max(0, parseFloat(inputs.capexCost) || 0);
  const annualSavings = Math.max(0, parseFloat(inputs.annualSavings) || 0);
  const usefulLife = Math.min(50, Math.max(1, parseFloat(inputs.usefulLife) || 1));
  const maintenanceCost = Math.max(0, parseFloat(inputs.maintenanceCost) || 0);
  const discountRate = Math.min(100, Math.max(0, parseFloat(inputs.discountRate) || 0));
  const salvageValue = Math.max(0, parseFloat(inputs.salvageValue) || 0);

  const annualDepreciation = (capexCost - salvageValue) / usefulLife;
  const netAnnualBenefit = annualSavings + annualDepreciation - maintenanceCost;
  let totalBenefit = 0;
  let npv = -capexCost;
  let cumulative = 0;
  let paybackYears = 0;
  for (let y = 1; y <= usefulLife; y++) {
    totalBenefit += netAnnualBenefit;
    cumulative += netAnnualBenefit;
    if (cumulative >= capexCost && paybackYears === 0) paybackYears = y;
    npv += netAnnualBenefit / Math.pow(1 + discountRate / 100, y);
  }
  npv += salvageValue / Math.pow(1 + discountRate / 100, usefulLife);
  const roiPct = capexCost > 0 ? (totalBenefit / capexCost) * 100 : 0;

  return { annualDepreciation, netAnnualBenefit, totalBenefit, npv, roiPct, paybackYears };
}

const NumInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));

export default function CapitalExpenditureRoiCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.capexCost) < 0 ||
    num(inputs.annualSavings) < 0 ||
    num(inputs.usefulLife) < 1 || num(inputs.usefulLife) > 50 ||
    num(inputs.maintenanceCost) < 0 ||
    num(inputs.discountRate) < 0 || num(inputs.discountRate) > 100 ||
    num(inputs.salvageValue) < 0;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculate(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const handlePrint = () => window.print();

  const rows = [
    { label: "Capital Expenditure", value: fmtMoney(num(inputs.capexCost)) },
    { label: "Annual Operating Savings", value: fmtMoney(num(inputs.annualSavings)) + "/yr" },
    { label: `Annual Depreciation (straight-line)`, value: fmtMoney(result.annualDepreciation) },
    { label: "Annual Maintenance", value: "-" + fmtMoney(num(inputs.maintenanceCost)) + "/yr" },
    { label: "Net Annual Benefit", value: fmtMoney(result.netAnnualBenefit) + "/yr" },
    { label: `Total Benefit over ${fmt(num(inputs.usefulLife))} yrs`, value: fmtMoney(result.totalBenefit) },
    { label: `Salvage Value (discounted @ ${fmt(num(inputs.discountRate), 1)}%)`, value: fmtMoney(num(inputs.salvageValue) / Math.pow(1 + num(inputs.discountRate) / 100, num(inputs.usefulLife))) },
    { label: "Net Present Value", value: fmtMoney(result.npv), total: true },
    { label: "Payback Period", value: result.paybackYears > 0 ? fmt(result.paybackYears) + " years" : "Beyond useful life", highlight: true },
  ];

  const summaryStats = [
    { label: "Capital Expenditure", value: fmtMoney(num(inputs.capexCost)) },
    { label: "Annual Savings", value: fmtMoney(num(inputs.annualSavings)) },
    { label: "Useful Life", value: fmt(num(inputs.usefulLife)) + " years" },
    { label: "Annual Depreciation", value: fmtMoney(result.annualDepreciation) },
    { label: "Maintenance Cost", value: fmtMoney(num(inputs.maintenanceCost)) },
    { label: "Net Annual Benefit", value: fmtMoney(result.netAnnualBenefit) },
    { label: "Total Benefit", value: fmtMoney(result.totalBenefit) },
    { label: "Salvage Value", value: fmtMoney(num(inputs.salvageValue)) },
    { label: "Discount Rate", value: fmt(num(inputs.discountRate), 1) + "%" },
    { label: "Net Present Value", value: fmtMoney(result.npv), bold: true },
    { label: "ROI", value: fmt(result.roiPct, 1) + "%" },
    { label: "Payback", value: result.paybackYears > 0 ? fmt(result.paybackYears) + " years" : "N/A" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Capital Expenditure ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Capital Expenditure ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ce-cost" label="Capital Expenditure" value={inputs.capexCost} onChange={set("capexCost")} prefix="$" />
              <NumInput id="ce-savings" label="Annual Operating Savings" value={inputs.annualSavings} onChange={set("annualSavings")} prefix="$" suffix="/yr" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ce-life" label="Useful Life" value={inputs.usefulLife} onChange={set("usefulLife")} suffix="years" />
              <NumInput id="ce-maintenance" label="Annual Maintenance" value={inputs.maintenanceCost} onChange={set("maintenanceCost")} prefix="$" suffix="/yr" />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none"
            >
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Cost of Capital & Residual Value</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="ce-discount" label="Discount Rate" value={inputs.discountRate} onChange={set("discountRate")} suffix="%" />
                    <NumInput id="ce-salvage" label="Salvage Value" value={inputs.salvageValue} onChange={set("salvageValue")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; useful life between 1 and 50 years; discount rate between 0 and 100.
              </p>
            )}

            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={handleReset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div ref={resultsRef} className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Capital Expenditure ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.roiPct, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.npv)} NPV — payback in {result.paybackYears > 0 ? fmt(result.paybackYears) + " years" : "beyond useful life"}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Annual Benefit</span>
                <span className="font-extrabold text-green-600">{fmtMoney(result.netAnnualBenefit)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Benefit</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.totalBenefit)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">NPV</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.npv)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">CapEx Return Breakdown</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[180px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 pl-4 pr-3 text-base font-medium ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 pl-3 pr-4 text-right text-base font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {summaryStats.map((s) => (
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
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Capital Expenditure ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A capital expenditure ROI calculator estimates the return on major asset purchases such as equipment, machinery, vehicles, buildings, or large software systems. Capital expenditures are the largest discretionary costs a business makes, and they are evaluated differently from operating expenses because the asset produces benefits over many years. The key inputs are the purchase cost, the annual savings or revenue the asset generates, its useful life, and the ongoing maintenance it requires. The analysis must also account for depreciation, which spreads the cost across the useful life and creates a tax shield, the discount rate, which reflects the cost of capital, and the salvage value, which is what the asset is worth at the end. This calculator assembles all of those elements into the net annual benefit, the total benefit, the net present value, the ROI, and the payback period.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The net annual benefit combines the operating savings with the annual depreciation charge and subtracts the maintenance cost, which reflects how capital budgeting actually works: depreciation is included because it represents the annual cost of the asset and carries a real tax benefit, while maintenance is subtracted because the asset's savings are only net of what it costs to keep running. The useful life should be based on the asset's economic life rather than its tax life, since equipment that lasts twelve years but is depreciated over seven produces a different return profile than the tax schedule suggests. The model discounts each year's net benefit at the discount rate, so the NPV reflects the cost of capital tied up in the purchase, and the payback period counts the years of net benefit needed to recover the outlay. The ROI divides the undiscounted total benefit by the purchase cost, making it the simple headline figure, while the NPV is the disciplined decision metric that accounts for timing and the cost of capital.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the capital expenditure, the annual operating savings, the useful life in years, and the annual maintenance cost. The annual depreciation uses straight-line depreciation, dividing the cost minus the salvage value by the useful life: with the default inputs, a $200,000 asset with a $20,000 salvage value over ten years depreciates $18,000 a year. The net annual benefit adds the operating savings and the depreciation to the maintenance cost, reflecting both the cash savings and the depreciation benefit, and with the defaults it totals $75,000 a year. The model then sums the net benefit across the useful life for the total benefit, tracks the year cumulative benefit first covers the purchase cost for the payback period, and discounts each year's benefit at the discount rate, adding the discounted salvage value, to produce the net present value. The ROI divides the total benefit by the capital expenditure, and the payback period shows how quickly the asset repays its cost.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The NPV is the primary decision metric, since a positive NPV means the asset creates value after accounting for the cost of capital, while a negative one means the savings never justify the outlay. The ROI percentage lets you compare the asset against alternative investments and against your hurdle rate, and the payback period is the risk measure, since a faster payback exposes the capital to less uncertainty. The maintenance input is where estimates typically go wrong, so budget it honestly, since maintenance on capital equipment routinely runs several percent of purchase cost annually. The depreciation treatment in this model is a simplification of the tax benefit, so consult your tax advisor for the actual depreciation schedule. Re-run the analysis with a higher discount rate and higher maintenance to test whether the purchase survives conservative assumptions.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="capital-expenditure-roi-calculator" />
        </div>
      </div>
    </>
  );
}