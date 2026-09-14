"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  onboardingTeamCost: string;
  toolsCost: string;
  newCustomers: string;
  hoursPerCustomer: string;
  hourlyRate: string;
  timeToValueDays: string;
}

interface Result {
  totalCost: number;
  costPerCustomer: number;
  laborCost: number;
  laborPerCustomer: number;
  revenueAtRisk: number;
  monthlyArr: number;
}

const DEFAULTS: Inputs = {
  onboardingTeamCost: "180000",
  toolsCost: "24000",
  newCustomers: "350",
  hoursPerCustomer: "12",
  hourlyRate: "45",
  timeToValueDays: "21",
};

function calculate(inputs: Inputs): Result {
  const onboardingTeamCost = Math.max(0, parseFloat(inputs.onboardingTeamCost) || 0);
  const toolsCost = Math.max(0, parseFloat(inputs.toolsCost) || 0);
  const newCustomers = Math.max(0, parseFloat(inputs.newCustomers) || 0);
  const hoursPerCustomer = Math.max(0, parseFloat(inputs.hoursPerCustomer) || 0);
  const hourlyRate = Math.max(0, parseFloat(inputs.hourlyRate) || 0);
  const timeToValueDays = Math.max(0, parseFloat(inputs.timeToValueDays) || 0);

  const totalCost = onboardingTeamCost + toolsCost;
  const costPerCustomer = newCustomers > 0 ? totalCost / newCustomers : 0;
  const laborCost = hoursPerCustomer * newCustomers * hourlyRate;
  const laborPerCustomer = hoursPerCustomer * hourlyRate;
  const monthlyArr = newCustomers * 100;
  const revenueAtRisk = newCustomers * monthlyArr;

  return { totalCost, costPerCustomer, laborCost, laborPerCustomer, revenueAtRisk, monthlyArr };
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
const fmtMoney = (n: number, dec = 0) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

export default function OnboardingCostPerCustomerCalculator() {
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
    num(inputs.onboardingTeamCost) < 0 ||
    num(inputs.toolsCost) < 0 ||
    num(inputs.newCustomers) <= 0 ||
    num(inputs.hoursPerCustomer) < 0 ||
    num(inputs.hourlyRate) < 0 ||
    num(inputs.timeToValueDays) < 0;

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
    { label: "Onboarding Team Annual Cost", value: fmtMoney(num(inputs.onboardingTeamCost)) },
    { label: "Tools & Software", value: fmtMoney(num(inputs.toolsCost)) },
    { label: "Total Annual Onboarding Cost", value: fmtMoney(result.totalCost) },
    { label: "New Customers / Year", value: fmt(num(inputs.newCustomers)) },
    { label: "Cost Per Customer", value: fmtMoney(result.costPerCustomer), highlight: true },
    { label: "Labor Hours Per Customer", value: fmt(num(inputs.hoursPerCustomer), 1) },
    { label: "Blended Hourly Rate", value: fmtMoney(num(inputs.hourlyRate)) },
    { label: "Labor Cost Per Customer", value: fmtMoney(result.laborPerCustomer) },
    { label: "Time to Value", value: fmt(num(inputs.timeToValueDays), 0) + " days" },
    { label: "Onboarding Labor (all customers)", value: fmtMoney(result.laborCost), highlight: true },
  ];

  const summaryStats = [
    { label: "Cost / Customer", value: fmtMoney(result.costPerCustomer) },
    { label: "Labor / Customer", value: fmtMoney(result.laborPerCustomer) },
    { label: "Total Cost", value: fmtMoney(result.totalCost) },
    { label: "New Customers", value: fmt(num(inputs.newCustomers)) },
    { label: "Hours / Customer", value: fmt(num(inputs.hoursPerCustomer), 1) },
    { label: "Time to Value", value: fmt(num(inputs.timeToValueDays), 0) + " days" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Onboarding Cost Per Customer Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Onboarding Cost Per Customer Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ob-team" label="Onboarding Team Annual Cost" value={inputs.onboardingTeamCost} onChange={set("onboardingTeamCost")} prefix="$" />
              <NumInput id="ob-tools" label="Tools & Software" value={inputs.toolsCost} onChange={set("toolsCost")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="ob-customers" label="New Customers / Year" value={inputs.newCustomers} onChange={set("newCustomers")} />
              <NumInput id="ob-hours" label="Labor Hours / Customer" value={inputs.hoursPerCustomer} onChange={set("hoursPerCustomer")} />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Cost & Speed</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="ob-rate" label="Blended Hourly Rate" value={inputs.hourlyRate} onChange={set("hourlyRate")} prefix="$" />
                    <NumInput id="ob-ttv" label="Time to Value" value={inputs.timeToValueDays} onChange={set("timeToValueDays")} suffix="days" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                New customers must be greater than zero; all other values must be non-negative.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Onboarding Cost Per Customer</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.costPerCustomer)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.totalCost)} across {fmt(num(inputs.newCustomers))} customers</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Labor / Customer</span>
                <span className="font-extrabold text-foreground">{fmtMoney(result.laborPerCustomer)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Onboarding Cost</span>
                <span className="font-extrabold text-foreground">{fmtMoney(result.totalCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Time to Value</span>
                <span className="font-extrabold text-amber-600">{fmt(num(inputs.timeToValueDays), 0)} days</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Onboarding Economics</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[160px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={r.highlight ? "bg-amber-500/10" : ""}>
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
                    <span className="text-sm font-extrabold text-foreground">{s.value}</span>
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
              <h2 className="text-2xl font-bold mb-3">What Is Onboarding Cost Per Customer?</h2>
              <p className="text-muted-foreground leading-relaxed">Onboarding cost per customer is the fully loaded expense of taking a newly won customer from contract signature to active, value-delivering use. It includes the onboarding team's salaries allocated across the customers they serve, onboarding software and tools, and the labor hours spent per customer. For B2B SaaS this is one of the most visible line items in customer success budgeting, because it is a cost that scales linearly with growth — every new logo adds another onboarding bill. Unlike CAC, which includes marketing and sales, onboarding cost is purely the delivery side: the money spent after the deal is signed to make the product stick.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Use This Calculator</h2>
              <p className="text-muted-foreground leading-relaxed">Enter your onboarding team's annual cost (salaries, benefits, management), your onboarding tooling spend, and the number of new customers onboarded per year. The calculator derives the total onboarding cost and the cost per customer. The Advanced Options add the labor detail: hours spent per customer and a blended hourly rate, which produce the per-customer labor cost — often the dominant component, and the one most sensitive to process improvements. Time to value, measured in days, is tracked alongside cost because the two trade off: faster onboarding usually needs more upfront labor but dramatically improves activation and early retention.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Optimizing Onboarding Spend</h2>
              <p className="text-muted-foreground leading-relaxed">Benchmarks for B2B onboarding costs range from a few hundred dollars for self-serve, product-led motions to several thousand for enterprise implementations with dedicated teams. The levers are standardization, self-service, and segmentation: templated playbooks cut hours per customer, interactive product tours and in-app checklists deflect work from humans, and reserving white-glove onboarding for high-value accounts concentrates spend where it pays back. Because onboarding cost is charged against first-year revenue, a useful rule is keeping it below 15–20% of first-year contract value — above that, the delivery motion itself erodes the unit economics of new business.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/onboarding-cost-per-customer-calculator" />
        </div>
      </div>
    </>
  );
}