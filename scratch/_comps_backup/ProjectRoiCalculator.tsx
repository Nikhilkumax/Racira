"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  investment: string;
  annualBenefit: string;
  durationYears: string;
  ongoingCosts: string;
  discountRate: string;
  salvageValue: string;
  riskAdj: string;
}

interface Result {
  netAnnualBenefit: number;
  totalBenefit: number;
  npv: number;
  roiPct: number;
  paybackYears: number;
  riskAdjustedRoi: number;
}

const DEFAULTS: Inputs = {
  investment: "150000",
  annualBenefit: "60000",
  durationYears: "3",
  ongoingCosts: "15000",
  discountRate: "10",
  salvageValue: "10000",
  riskAdj: "10",
};

function calculate(inputs: Inputs): Result {
  const investment = Math.max(0, parseFloat(inputs.investment) || 0);
  const annualBenefit = Math.max(0, parseFloat(inputs.annualBenefit) || 0);
  const durationYears = Math.min(30, Math.max(1, parseFloat(inputs.durationYears) || 1));
  const ongoingCosts = Math.max(0, parseFloat(inputs.ongoingCosts) || 0);
  const discountRate = Math.min(100, Math.max(0, parseFloat(inputs.discountRate) || 0));
  const salvageValue = Math.max(0, parseFloat(inputs.salvageValue) || 0);
  const riskAdj = Math.min(100, Math.max(0, parseFloat(inputs.riskAdj) || 0));

  const netAnnualBenefit = annualBenefit - ongoingCosts;
  let totalBenefit = 0;
  let npv = -investment;
  let cumulative = 0;
  let paybackYears = 0;
  for (let y = 1; y <= durationYears; y++) {
    totalBenefit += netAnnualBenefit;
    cumulative += netAnnualBenefit;
    if (cumulative >= investment && paybackYears === 0) paybackYears = y;
    npv += netAnnualBenefit / Math.pow(1 + discountRate / 100, y);
  }
  npv += salvageValue / Math.pow(1 + discountRate / 100, durationYears);
  const roiPct = investment > 0 ? ((totalBenefit + salvageValue - investment) / investment) * 100 : 0;
  const riskAdjustedRoi = roiPct * (1 - riskAdj / 100);

  return { netAnnualBenefit, totalBenefit, npv, roiPct, paybackYears, riskAdjustedRoi };
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

export default function ProjectRoiCalculator() {
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
    num(inputs.investment) < 0 ||
    num(inputs.annualBenefit) < 0 ||
    num(inputs.durationYears) < 1 || num(inputs.durationYears) > 30 ||
    num(inputs.ongoingCosts) < 0 ||
    num(inputs.discountRate) < 0 || num(inputs.discountRate) > 100 ||
    num(inputs.salvageValue) < 0 ||
    num(inputs.riskAdj) < 0 || num(inputs.riskAdj) > 100;

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
    { label: "Initial Investment", value: fmtMoney(num(inputs.investment)) },
    { label: `Annual Project Benefit (${fmtMoney(num(inputs.annualBenefit))})`, value: fmtMoney(result.netAnnualBenefit) + "/yr net" },
    { label: "Ongoing Operating Costs", value: "-" + fmtMoney(num(inputs.ongoingCosts)) + "/yr" },
    { label: `Net Annual Benefit (${fmt(num(inputs.durationYears))} yrs)`, value: fmtMoney(result.netAnnualBenefit) },
    { label: "Total Benefit over Project Life", value: fmtMoney(result.totalBenefit) },
    { label: "Salvage / Terminal Value", value: fmtMoney(num(inputs.salvageValue)) },
    { label: `Net Present Value @ ${fmt(num(inputs.discountRate), 1)}%`, value: fmtMoney(result.npv) },
    { label: "Simple Project ROI", value: fmt(result.roiPct, 1) + "%", total: true },
    { label: "Payback Period", value: result.paybackYears > 0 ? fmt(result.paybackYears) + " years" : "Beyond project life", highlight: true },
  ];

  const summaryStats = [
    { label: "Initial Investment", value: fmtMoney(num(inputs.investment)) },
    { label: "Annual Benefit", value: fmtMoney(num(inputs.annualBenefit)) },
    { label: "Ongoing Costs", value: fmtMoney(num(inputs.ongoingCosts)) },
    { label: "Net Annual Benefit", value: fmtMoney(result.netAnnualBenefit) },
    { label: "Project Duration", value: fmt(num(inputs.durationYears)) + " years" },
    { label: "Discount Rate", value: fmt(num(inputs.discountRate), 1) + "%" },
    { label: "Total Benefit", value: fmtMoney(result.totalBenefit) },
    { label: "Salvage Value", value: fmtMoney(num(inputs.salvageValue)) },
    { label: "Net Present Value", value: fmtMoney(result.npv) },
    { label: "Project ROI", value: fmt(result.roiPct, 1) + "%", bold: true },
    { label: "Payback", value: result.paybackYears > 0 ? fmt(result.paybackYears) + " yrs" : "N/A" },
    { label: "Risk-Adjusted ROI", value: fmt(result.riskAdjustedRoi, 1) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Project ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Project ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="proj-inv" label="Initial Investment" value={inputs.investment} onChange={set("investment")} prefix="$" />
              <NumInput id="proj-benefit" label="Annual Project Benefit" value={inputs.annualBenefit} onChange={set("annualBenefit")} prefix="$" suffix="/yr" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="proj-years" label="Project Duration" value={inputs.durationYears} onChange={set("durationYears")} suffix="years" />
              <NumInput id="proj-opex" label="Ongoing Operating Costs" value={inputs.ongoingCosts} onChange={set("ongoingCosts")} prefix="$" suffix="/yr" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Time Value & Risk</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="proj-discount" label="Discount Rate" value={inputs.discountRate} onChange={set("discountRate")} suffix="%" />
                    <NumInput id="proj-salvage" label="Salvage / Terminal Value" value={inputs.salvageValue} onChange={set("salvageValue")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="proj-risk" label="Risk Adjustment" value={inputs.riskAdj} onChange={set("riskAdj")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; duration between 1 and 30 years; discount rate and risk between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Project ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.roiPct, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.npv)} NPV — payback {result.paybackYears > 0 ? "in year " + fmt(result.paybackYears) : "beyond project life"} — {fmt(result.riskAdjustedRoi, 1)}% risk-adjusted</div>
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
                    <th className="py-2.5 pl-4 pr-3">Project Return Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Project ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A project ROI calculator estimates the financial return a business can expect from a project investment, from the initial outlay through the benefits the project delivers over its life. Projects are how organizations convert capital into capability, but their returns are harder to evaluate than a simple purchase because the benefits arrive over years, the operating costs continue after the project ends, and the money tied up has a time value. This calculator models the complete picture: the initial investment, the annual benefit the project produces, the ongoing costs required to keep the benefit flowing, and the project's duration, then applies a discount rate to account for the cost of capital and adds any salvage or terminal value the project leaves behind. The result is a simple ROI percentage, a net present value, a payback period, and a risk-adjusted ROI that reflects the real odds of under-delivery.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the initial investment, the annual project benefit, the project duration in years, and the annual ongoing operating costs. The net annual benefit subtracts the ongoing costs from the annual benefit, and the total benefit accumulates that figure across the project duration. With the default inputs, a $150,000 investment producing $60,000 a year in benefits with $15,000 of ongoing costs carries a $45,000 net annual benefit, or $135,000 over three years. The advanced options add the discount rate, the salvage or terminal value, and the risk adjustment percentage. The net present value starts at the negative investment and adds each year's net benefit discounted at the discount rate, plus the salvage value discounted back from the end of the project, so it reflects both the timing and the cost of capital. The simple ROI divides the total benefit plus salvage minus the investment by the investment, the payback period counts the years until cumulative benefit first covers the investment, and the risk-adjusted ROI applies the risk discount to the simple figure.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The simple ROI is the headline figure for comparing projects against each other, while the NPV is the disciplined check, since a project can show a healthy simple ROI and still destroy value once the cost of capital is considered. The payback period is the risk metric, because the faster the investment is recovered, the less exposure the project carries to changing conditions. The risk-adjusted ROI is the honesty check: if a 10% risk adjustment drops the return below your hurdle rate, the project only works in the best case. Compare every result against your organization's hurdle rate and against the alternative use of the capital, and re-run the model with conservative benefit assumptions, since projects reliably overpromise in the planning phase. The salvage value assumption matters most for projects with tangible assets, so keep it conservative for software and process projects where nothing physical remains.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="project-roi-calculator" />
        </div>
      </div>
    </>
  );
}