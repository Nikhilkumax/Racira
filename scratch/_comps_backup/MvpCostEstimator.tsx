"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  devHours: string;
  devRate: string;
  designHours: string;
  designRate: string;
  productMonths: string;
  productSalary: string;
  infraCost: string;
  thirdPartyCost: string;
  launchCost: string;
  contingencyPct: string;
}

interface Result {
  devCost: number;
  designCost: number;
  productCost: number;
  subtotal: number;
  contingency: number;
  totalCost: number;
  costPerMonth: number;
}

const DEFAULTS: Inputs = {
  devHours: "400",
  devRate: "95",
  designHours: "80",
  designRate: "75",
  productMonths: "3",
  productSalary: "9000",
  infraCost: "1500",
  thirdPartyCost: "3000",
  launchCost: "4000",
  contingencyPct: "15",
};

function calculate(inputs: Inputs): Result {
  const devHours = Math.max(0, parseFloat(inputs.devHours) || 0);
  const devRate = Math.max(0, parseFloat(inputs.devRate) || 0);
  const designHours = Math.max(0, parseFloat(inputs.designHours) || 0);
  const designRate = Math.max(0, parseFloat(inputs.designRate) || 0);
  const productMonths = Math.max(0, parseFloat(inputs.productMonths) || 0);
  const productSalary = Math.max(0, parseFloat(inputs.productSalary) || 0);
  const infraCost = Math.max(0, parseFloat(inputs.infraCost) || 0);
  const thirdPartyCost = Math.max(0, parseFloat(inputs.thirdPartyCost) || 0);
  const launchCost = Math.max(0, parseFloat(inputs.launchCost) || 0);
  const contingencyPct = Math.min(100, Math.max(0, parseFloat(inputs.contingencyPct) || 0));

  const devCost = devHours * devRate;
  const designCost = designHours * designRate;
  const productCost = productMonths * productSalary;
  const subtotal = devCost + designCost + productCost + infraCost + thirdPartyCost + launchCost;
  const contingency = subtotal * (contingencyPct / 100);
  const totalCost = subtotal + contingency;
  const costPerMonth = Math.max(1, productMonths) > 0 ? totalCost / Math.max(1, productMonths) : totalCost;

  return { devCost, designCost, productCost, subtotal, contingency, totalCost, costPerMonth };
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

export default function MvpCostEstimator() {
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
    num(inputs.devHours) < 0 ||
    num(inputs.devRate) < 0 ||
    num(inputs.designHours) < 0 ||
    num(inputs.designRate) < 0 ||
    num(inputs.productMonths) < 0 ||
    num(inputs.productSalary) < 0 ||
    num(inputs.infraCost) < 0 ||
    num(inputs.thirdPartyCost) < 0 ||
    num(inputs.launchCost) < 0 ||
    num(inputs.contingencyPct) < 0 || num(inputs.contingencyPct) > 100;

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
    { label: `Development (${fmt(num(inputs.devHours))} hrs × ${fmtMoney(num(inputs.devRate))})`, value: fmtMoney(result.devCost) },
    { label: `Design (${fmt(num(inputs.designHours))} hrs × ${fmtMoney(num(inputs.designRate))})`, value: fmtMoney(result.designCost) },
    { label: `Product Management (${fmt(num(inputs.productMonths))} mo × ${fmtMoney(num(inputs.productSalary))})`, value: fmtMoney(result.productCost) },
    { label: "Infrastructure & Hosting", value: fmtMoney(num(inputs.infraCost)) },
    { label: "Third-Party Services", value: fmtMoney(num(inputs.thirdPartyCost)) },
    { label: "Launch & Marketing", value: fmtMoney(num(inputs.launchCost)) },
    { label: "Subtotal", value: fmtMoney(result.subtotal) },
    { label: `Contingency (${fmt(num(inputs.contingencyPct), 1)}%)`, value: fmtMoney(result.contingency) },
    { label: "Total MVP Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Month", value: fmtMoney(result.costPerMonth), highlight: true },
  ];

  const summaryStats = [
    { label: "Development Cost", value: fmtMoney(result.devCost) },
    { label: "Design Cost", value: fmtMoney(result.designCost) },
    { label: "Product Management", value: fmtMoney(result.productCost) },
    { label: "Infrastructure & Hosting", value: fmtMoney(num(inputs.infraCost)) },
    { label: "Third-Party Services", value: fmtMoney(num(inputs.thirdPartyCost)) },
    { label: "Launch & Marketing", value: fmtMoney(num(inputs.launchCost)) },
    { label: "Subtotal", value: fmtMoney(result.subtotal) },
    { label: "Contingency", value: fmtMoney(result.contingency) },
    { label: "Total MVP Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Month", value: fmtMoney(result.costPerMonth) },
    { label: "Timeline", value: fmt(num(inputs.productMonths)) + " months" },
    { label: "Dev Hours", value: fmt(num(inputs.devHours)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "MVP Cost Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">MVP Cost Estimator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="mvp-dev-hours" label="Development Hours" value={inputs.devHours} onChange={set("devHours")} suffix="hrs" />
              <NumInput id="mvp-dev-rate" label="Developer Rate" value={inputs.devRate} onChange={set("devRate")} prefix="$" suffix="/hr" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="mvp-design-hours" label="Design Hours" value={inputs.designHours} onChange={set("designHours")} suffix="hrs" />
              <NumInput id="mvp-design-rate" label="Designer Rate" value={inputs.designRate} onChange={set("designRate")} prefix="$" suffix="/hr" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Team & Timeline</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="mvp-pm-months" label="Timeline" value={inputs.productMonths} onChange={set("productMonths")} suffix="months" />
                    <NumInput id="mvp-pm-salary" label="Product Manager / Mo" value={inputs.productSalary} onChange={set("productSalary")} prefix="$" />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Services & Launch</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="mvp-infra" label="Infrastructure & Hosting" value={inputs.infraCost} onChange={set("infraCost")} prefix="$" />
                    <NumInput id="mvp-thirdparty" label="Third-Party Services" value={inputs.thirdPartyCost} onChange={set("thirdPartyCost")} prefix="$" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="mvp-launch" label="Launch & Marketing" value={inputs.launchCost} onChange={set("launchCost")} prefix="$" />
                    <NumInput id="mvp-contingency" label="Contingency" value={inputs.contingencyPct} onChange={set("contingencyPct")} suffix="%" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative and contingency between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total MVP Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerMonth)} per month over a {fmt(num(inputs.productMonths))}-month build</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Development Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.devCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Subtotal</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.subtotal)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Contingency</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.contingency)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">MVP Cost Breakdown</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an MVP Cost Estimator?</h2>
              <p className="text-muted-foreground leading-relaxed">An MVP cost estimator estimates the expense of building a minimum viable product, the smallest version of a product that can be shipped to real users to validate demand. MVP pricing is one of the first budget questions every founder faces, and the answer depends on the scope of the build: how many development hours the feature set requires, the rates of the developers and designers involved, the product management time, and the supporting costs of infrastructure, third-party services, and launch marketing. Scope creep is the classic MVP killer, since every extra feature adds hours and weeks, so a credible estimate starts with a disciplined feature list and a realistic hourly count. This calculator assembles the full build cost from those components and adds a contingency percentage, producing a total MVP cost and a per-month burn that can be compared against available funding and expected early revenue.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The hourly estimates are the heart of the model, and they should be built feature by feature from a written scope rather than guessed, since a realistic MVP of a simple two-sided product typically runs 300 to 600 development hours while a more complex product with payments, user accounts, and integrations can run well over a thousand. The product manager cost reflects the founder or PM time consumed during the build, and including it keeps the estimate honest about the full team cost rather than just the engineering bill. The infrastructure line covers hosting, domains, and third-party services during development, while the third-party services line captures the per-month costs of APIs and tools that begin accruing before launch. The contingency percentage is the model's buffer for the two certainties of software projects, scope change and estimation error, and it should be treated as part of the budget rather than an optional reserve, because MVPs that exhaust their budget before validation fail quietly.</p>
              <p className="text-muted-foreground leading-relaxed">The four core inputs are the development hours, the developer hourly rate, the design hours, and the designer hourly rate. The development cost multiplies the hours by the rate, and the design cost does the same for design work: with the default inputs, 400 hours of development at $95 an hour carries a $38,000 development cost, and 80 hours of design at $75 an hour adds $6,000. The advanced options add the timeline in months and the monthly product manager cost, whose product is the product management cost; the infrastructure and hosting cost for the build period; the third-party services cost for APIs, payments, and other tools; and the launch and marketing cost. The subtotal sums the six cost categories, the contingency multiplies the subtotal by the contingency percentage to cover scope changes and unknowns, and the total adds them together. The cost per month divides the total by the timeline, giving the burn rate to compare against runway and early revenue.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The total MVP cost is the fundraising and budgeting number, and the cost per month is the burn rate that determines how much runway the build consumes. If the total exceeds what you can fund, cut scope first: the development hours input is where the levers live, and every feature removed shrinks both hours and timeline. The contingency is not padding to skip, because MVPs reliably encounter integration surprises and scope renegotiation; treat it as a floor, not a ceiling. Compare the estimate against the build-versus-no-code decision, since simpler MVPs can often be validated with templates and low-code tools for a fraction of the cost. Re-run the estimator as the feature list changes during planning, and lock the estimate before development starts to keep scope honest.</p>
            </div>
          </section>
          <PopularCalculators currentSlug="mvp-cost-estimator" />
        </div>
      </div>
    </>
  );
}