"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  investment: string;
  annualCashFlow: string;
  discountRate: string;
  projectLife: string;
  cashFlowGrowth: string;
  terminalValue: string;
  inflationAdj: string;
}

interface Result {
  undiscountedTotal: number;
  discountedTotal: number;
  npv: number;
  discountedRoi: number;
  simpleRoi: number;
  discountedPayback: number;
}

const DEFAULTS: Inputs = {
  investment: "200000",
  annualCashFlow: "70000",
  discountRate: "12",
  projectLife: "5",
  cashFlowGrowth: "3",
  terminalValue: "25000",
  inflationAdj: "2",
};

function calculate(inputs: Inputs): Result {
  const investment = Math.max(0, parseFloat(inputs.investment) || 0);
  const annualCashFlow = Math.max(0, parseFloat(inputs.annualCashFlow) || 0);
  const discountRate = Math.min(100, Math.max(0, parseFloat(inputs.discountRate) || 0));
  const projectLife = Math.min(30, Math.max(1, parseFloat(inputs.projectLife) || 1));
  const cashFlowGrowth = Math.min(100, Math.max(0, parseFloat(inputs.cashFlowGrowth) || 0));
  const terminalValue = Math.max(0, parseFloat(inputs.terminalValue) || 0);
  const inflationAdj = Math.min(50, Math.max(0, parseFloat(inputs.inflationAdj) || 0));

  const effectiveDiscount = discountRate + inflationAdj;
  let undiscountedTotal = 0;
  let discountedTotal = 0;
  let cf = annualCashFlow;
  let discountedCumulative = 0;
  let discountedPayback = 0;
  for (let y = 1; y <= projectLife; y++) {
    undiscountedTotal += cf;
    const dcf = cf / Math.pow(1 + effectiveDiscount / 100, y);
    discountedTotal += dcf;
    discountedCumulative += dcf;
    if (discountedCumulative >= investment && discountedPayback === 0) discountedPayback = y;
    cf *= 1 + cashFlowGrowth / 100;
  }
  const discountedTerminal = terminalValue / Math.pow(1 + effectiveDiscount / 100, projectLife);
  const npv = discountedTotal + discountedTerminal - investment;
  const discountedRoi = investment > 0 ? (npv / investment) * 100 : 0;
  const simpleRoi = investment > 0 ? ((undiscountedTotal + terminalValue - investment) / investment) * 100 : 0;

  return { undiscountedTotal, discountedTotal, npv, discountedRoi, simpleRoi, discountedPayback };
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

export default function DiscountedProjectRoiCalculator() {
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
    num(inputs.annualCashFlow) < 0 ||
    num(inputs.discountRate) < 0 || num(inputs.discountRate) > 100 ||
    num(inputs.projectLife) < 1 || num(inputs.projectLife) > 30 ||
    num(inputs.cashFlowGrowth) < 0 || num(inputs.cashFlowGrowth) > 100 ||
    num(inputs.terminalValue) < 0 ||
    num(inputs.inflationAdj) < 0 || num(inputs.inflationAdj) > 50;

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
    { label: `Year 1 Cash Flow (${fmtMoney(num(inputs.annualCashFlow))})`, value: fmtMoney(num(inputs.annualCashFlow)) },
    { label: `Cash Flow Growth (${fmt(num(inputs.cashFlowGrowth), 1)}%/yr)`, value: fmtMoney(result.undiscountedTotal) + " total" },
    { label: "Undiscounted Total Cash Flow", value: fmtMoney(result.undiscountedTotal) },
    { label: `Discounted Total @ ${fmt(num(inputs.discountRate) + num(inputs.inflationAdj), 1)}%`, value: fmtMoney(result.discountedTotal) },
    { label: `Discounted Terminal Value`, value: fmtMoney(result.discountedTotal > 0 ? result.npv + num(inputs.investment) - result.discountedTotal : 0) },
    { label: "Net Present Value (NPV)", value: fmtMoney(result.npv), total: true },
    { label: "Discounted ROI", value: fmt(result.discountedRoi, 1) + "%", highlight: true },
  ];

  const summaryStats = [
    { label: "Initial Investment", value: fmtMoney(num(inputs.investment)) },
    { label: "Year 1 Cash Flow", value: fmtMoney(num(inputs.annualCashFlow)) },
    { label: "Cash Flow Growth", value: fmt(num(inputs.cashFlowGrowth), 1) + "%" },
    { label: "Discount Rate", value: fmt(num(inputs.discountRate), 1) + "%" },
    { label: "Inflation Adjustment", value: fmt(num(inputs.inflationAdj), 1) + "%" },
    { label: "Effective Discount", value: fmt(num(inputs.discountRate) + num(inputs.inflationAdj), 1) + "%" },
    { label: "Project Life", value: fmt(num(inputs.projectLife)) + " years" },
    { label: "Undiscounted Total", value: fmtMoney(result.undiscountedTotal) },
    { label: "Discounted Total", value: fmtMoney(result.discountedTotal) },
    { label: "NPV", value: fmtMoney(result.npv), bold: true },
    { label: "Discounted ROI", value: fmt(result.discountedRoi, 1) + "%" },
    { label: "Simple ROI", value: fmt(result.simpleRoi, 1) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Discounted Project ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Discounted Project ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="dproj-inv" label="Initial Investment" value={inputs.investment} onChange={set("investment")} prefix="$" />
              <NumInput id="dproj-cf" label="Year 1 Annual Cash Flow" value={inputs.annualCashFlow} onChange={set("annualCashFlow")} prefix="$" suffix="/yr" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="dproj-discount" label="Discount Rate" value={inputs.discountRate} onChange={set("discountRate")} suffix="%" />
              <NumInput id="dproj-life" label="Project Life" value={inputs.projectLife} onChange={set("projectLife")} suffix="years" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Cash Flow & Inflation</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="dproj-growth" label="Cash Flow Growth" value={inputs.cashFlowGrowth} onChange={set("cashFlowGrowth")} suffix="%" />
                    <NumInput id="dproj-inflation" label="Inflation Adjustment" value={inputs.inflationAdj} onChange={set("inflationAdj")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="dproj-terminal" label="Terminal Value" value={inputs.terminalValue} onChange={set("terminalValue")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; discount rate and growth between 0 and 100; inflation between 0 and 50; life between 1 and 30 years.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Discounted Project ROI</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.discountedRoi, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.npv)} NPV — simple ROI {fmt(result.simpleRoi, 1)}% — discounted payback {result.discountedPayback > 0 ? "year " + fmt(result.discountedPayback) : "beyond life"}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Undiscounted Total</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.undiscountedTotal)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Discounted Total</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.discountedTotal)}</span>
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
                    <th className="py-2.5 pl-4 pr-3">Discounted Return Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Discounted Project ROI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A discounted project ROI calculator estimates the return on a project investment after accounting for the time value of money, the growth of cash flows over the project's life, and the erosion of value from inflation. Undiscounted return calculations treat a dollar earned in year five as equal to a dollar invested today, which overstates the attractiveness of long projects because capital tied up today could have earned a return elsewhere, and future dollars buy less as prices rise. The discounted approach converts every future cash flow into its present value, then compares the total against the investment to produce a net present value and a discounted ROI that reflect the project's true economic contribution. This calculator adds cash flow growth and an inflation adjustment to the standard discounting framework, giving finance teams the version of project ROI that belongs in capital approval processes.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the initial investment, the year-one annual cash flow, the discount rate, and the project life in years. The model projects the cash flow forward year by year, growing it at the growth rate, and accumulates the undiscounted total for comparison. With the default inputs, a $200,000 investment with $70,000 of year-one cash flow growing at 3% a year produces roughly $372,000 of undiscounted cash flow over five years. The advanced options add the cash flow growth rate, the inflation adjustment, and the terminal value. The effective discount rate adds the inflation adjustment to the stated discount rate, and each year's cash flow is divided by one plus the effective rate raised to the year, producing the discounted total. The terminal value is discounted back from the final year, and the net present value subtracts the investment from the sum of the discounted cash flows and discounted terminal value. The discounted ROI divides the NPV by the investment, the simple ROI uses the undiscounted figures for comparison, and the discounted payback counts the years until discounted cumulative cash flow first covers the investment.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The discounted ROI is the metric to use in capital approval, because it accounts for everything the simple ROI ignores: the timing of cash flows, the growth assumption, and the erosion of future value. The gap between the discounted and simple ROI is the cost of the discounting itself, and a large gap signals a project whose benefits arrive late. A positive NPV means the project clears the cost of capital; a negative one means it destroys value even if the undiscounted numbers look healthy. The discounted payback is the conservative version of the payback period, and if it stretches past the project life, the project is not viable under the stated assumptions. Re-run the model with a higher discount rate and slower growth to test whether the project survives a conservative case, and keep the inflation adjustment consistent with your organization's planning assumptions.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="discounted-project-roi-calculator" />
        </div>
      </div>
    </>
  );
}