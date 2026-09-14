"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  spend: string;
  leads: string;
  qualifiedPct: string;
  closeRate: string;
  customerValue: string;
}

interface Result {
  cpl: number;
  qualifiedLeads: number;
  costPerQualified: number;
  dealsClosed: number;
  costPerDeal: number;
  revenue: number;
  roas: number;
  leadToCustomerPct: number;
}

const DEFAULTS: Inputs = {
  spend: "15000",
  leads: "1200",
  qualifiedPct: "60",
  closeRate: "15",
  customerValue: "2500",
};

function calculate(inputs: Inputs): Result {
  const spend = Math.max(0, parseFloat(inputs.spend) || 0);
  const leads = Math.max(0, parseFloat(inputs.leads) || 0);
  const qualifiedPct = Math.min(100, Math.max(0, parseFloat(inputs.qualifiedPct) || 0));
  const closeRate = Math.min(100, Math.max(0, parseFloat(inputs.closeRate) || 0));
  const customerValue = Math.max(0, parseFloat(inputs.customerValue) || 0);

  const cpl = leads > 0 ? spend / leads : 0;
  const qualifiedLeads = leads * (qualifiedPct / 100);
  const costPerQualified = qualifiedLeads > 0 ? spend / qualifiedLeads : 0;
  const dealsClosed = qualifiedLeads * (closeRate / 100);
  const costPerDeal = dealsClosed > 0 ? spend / dealsClosed : 0;
  const revenue = dealsClosed * customerValue;
  const roas = spend > 0 ? revenue / spend : 0;
  const leadToCustomerPct = leads > 0 ? (dealsClosed / leads) * 100 : 0;

  return { cpl, qualifiedLeads, costPerQualified, dealsClosed, costPerDeal, revenue, roas, leadToCustomerPct };
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
const fmtMoney = (n: number, dec = 2) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

export default function CostPerLeadCplCalculator() {
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
    num(inputs.spend) <= 0 ||
    num(inputs.leads) <= 0 ||
    num(inputs.qualifiedPct) < 0 || num(inputs.qualifiedPct) > 100 ||
    num(inputs.closeRate) < 0 || num(inputs.closeRate) > 100 ||
    num(inputs.customerValue) < 0;

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
    { label: "Marketing Spend", value: fmtMoney(num(inputs.spend), 0) },
    { label: "Leads Generated", value: fmt(num(inputs.leads)) },
    { label: "Cost Per Lead (CPL)", value: fmtMoney(result.cpl), highlight: true },
    { label: "Qualification Rate", value: num(inputs.qualifiedPct).toFixed(1) + "%" },
    { label: "Qualified Leads", value: fmt(result.qualifiedLeads) },
    { label: "Cost Per Qualified Lead", value: fmtMoney(result.costPerQualified) },
    { label: "Close Rate", value: num(inputs.closeRate).toFixed(1) + "%" },
    { label: "Deals Closed", value: fmt(result.dealsClosed) },
    { label: "Cost Per Closed Deal", value: fmtMoney(result.costPerDeal, 0) },
    { label: "Estimated Revenue", value: fmtMoney(result.revenue, 0) },
    { label: "ROAS", value: result.roas.toFixed(2) + "x" },
  ];

  const summaryStats = [
    { label: "CPL", value: fmtMoney(result.cpl) },
    { label: "Cost / Qualified", value: fmtMoney(result.costPerQualified) },
    { label: "Cost / Deal", value: fmtMoney(result.costPerDeal, 0) },
    { label: "Deals Closed", value: fmt(result.dealsClosed) },
    { label: "Revenue", value: fmtMoney(result.revenue, 0) },
    { label: "ROAS", value: result.roas.toFixed(2) + "x" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Cost Per Lead (CPL) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cost Per Lead (CPL) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="cpl-spend" label="Marketing Spend" value={inputs.spend} onChange={set("spend")} prefix="$" />
              <NumInput id="cpl-leads" label="Leads Generated" value={inputs.leads} onChange={set("leads")} />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Funnel Quality</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="cpl-qualified" label="Qualification Rate" value={inputs.qualifiedPct} onChange={set("qualifiedPct")} suffix="%" />
                    <NumInput id="cpl-close" label="Close Rate" value={inputs.closeRate} onChange={set("closeRate")} suffix="%" />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Value</div>
                  <NumInput id="cpl-value" label="Customer Value" value={inputs.customerValue} onChange={set("customerValue")} prefix="$" />
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Spend and leads must be greater than zero; percentages must be between 0 and 100; customer value must be non-negative.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Cost Per Lead</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.cpl)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(num(inputs.spend), 0)} across {fmt(num(inputs.leads))} leads</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Qualified Leads</span>
                <span className="font-extrabold text-foreground">{fmt(result.qualifiedLeads)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Deal</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.costPerDeal, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">ROAS</span>
                <span className={`font-extrabold ${result.roas >= 1 ? "text-emerald-600" : "text-red-600"}`}>{result.roas.toFixed(2)}x</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Lead Funnel</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is Cost Per Lead?</h2>
              <p className="text-muted-foreground leading-relaxed">Cost per lead (CPL) is the amount a marketer pays for each new lead acquired, calculated as total campaign spend divided by the number of leads generated. It is the core efficiency metric for lead-generation marketing — paid search, LinkedIn campaigns, content offers, and landing-page programs — where the deliverable is a qualified contact rather than a sale. CPL tells you how expensive your demand engine is, but on its own it cannot tell you whether the leads are worth buying. That requires the second half of the funnel: how many of those leads qualify, close, and become profitable customers. This calculator connects both halves so you can see the full chain from spend to revenue.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Use This Calculator</h2>
              <p className="text-muted-foreground leading-relaxed">Enter your total marketing spend and the leads it produced for the headline CPL. The Advanced Options add funnel quality: the qualification rate is the share of leads that meet your criteria (budget, authority, need, timeline), and the close rate is the share of qualified leads that become customers. From these the calculator derives the cost per qualified lead and the cost per closed deal — the true acquisition cost — plus estimated revenue when you provide an average customer value. The gap between CPL and cost per deal is usually large: a $12 CPL with a 60% qualification rate and a 15% close rate means each customer costs $133 to acquire.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Benchmarks and Interpretation</h2>
              <p className="text-muted-foreground leading-relaxed">Typical CPLs range from $5 for low-intent B2C offers to $100+ for enterprise B2B software, with paid search and LinkedIn the most expensive channels and organic and referral the cheapest. Rather than chasing a low CPL, target a cost per deal that is a small fraction of customer value — a common rule is that acquisition cost should stay below a third of first-year customer value for healthy unit economics. If your cost per deal exceeds that, either the CPL is too high, the funnel leaks too much, or the offer is not attracting qualified buyers. Use this calculator to identify exactly which stage is breaking your economics.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/cost-per-lead-cpl-calculator" />
        </div>
      </div>
    </>
  );
}