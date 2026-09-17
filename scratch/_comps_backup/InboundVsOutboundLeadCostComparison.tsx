"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  inboundSpend: string;
  inboundLeads: string;
  inboundCloseRate: string;
  outboundSpend: string;
  outboundLeads: string;
  outboundCloseRate: string;
  avgDealValue: string;
  salesCycleDays: string;
}

interface Result {
  inboundCpl: number;
  outboundCpl: number;
  inboundCostPerDeal: number;
  outboundCostPerDeal: number;
  inboundDeals: number;
  outboundDeals: number;
  inboundRevenue: number;
  outboundRevenue: number;
  inboundCostPctOfRevenue: number;
  outboundCostPctOfRevenue: number;
  inboundBetter: boolean;
  savingPerDeal: number;
}

const DEFAULTS: Inputs = {
  inboundSpend: "45000",
  inboundLeads: "3600",
  inboundCloseRate: "8",
  outboundSpend: "60000",
  outboundLeads: "1500",
  outboundCloseRate: "12",
  avgDealValue: "8000",
  salesCycleDays: "45",
};

function calculate(inputs: Inputs): Result {
  const inboundSpend = Math.max(0, parseFloat(inputs.inboundSpend) || 0);
  const inboundLeads = Math.max(0, parseFloat(inputs.inboundLeads) || 0);
  const inboundCloseRate = Math.min(100, Math.max(0, parseFloat(inputs.inboundCloseRate) || 0));
  const outboundSpend = Math.max(0, parseFloat(inputs.outboundSpend) || 0);
  const outboundLeads = Math.max(0, parseFloat(inputs.outboundLeads) || 0);
  const outboundCloseRate = Math.min(100, Math.max(0, parseFloat(inputs.outboundCloseRate) || 0));
  const avgDealValue = Math.max(0, parseFloat(inputs.avgDealValue) || 0);

  const inboundCpl = inboundLeads > 0 ? inboundSpend / inboundLeads : 0;
  const outboundCpl = outboundLeads > 0 ? outboundSpend / outboundLeads : 0;
  const inboundDeals = inboundLeads * (inboundCloseRate / 100);
  const outboundDeals = outboundLeads * (outboundCloseRate / 100);
  const inboundCostPerDeal = inboundDeals > 0 ? inboundSpend / inboundDeals : 0;
  const outboundCostPerDeal = outboundDeals > 0 ? outboundSpend / outboundDeals : 0;
  const inboundRevenue = inboundDeals * avgDealValue;
  const outboundRevenue = outboundDeals * avgDealValue;
  const inboundCostPctOfRevenue = inboundRevenue > 0 ? (inboundSpend / inboundRevenue) * 100 : 0;
  const outboundCostPctOfRevenue = outboundRevenue > 0 ? (outboundSpend / outboundRevenue) * 100 : 0;
  const inboundBetter = inboundCostPerDeal <= outboundCostPerDeal;
  const savingPerDeal = Math.abs(inboundCostPerDeal - outboundCostPerDeal);

  return {
    inboundCpl, outboundCpl, inboundCostPerDeal, outboundCostPerDeal,
    inboundDeals, outboundDeals, inboundRevenue, outboundRevenue,
    inboundCostPctOfRevenue, outboundCostPctOfRevenue, inboundBetter, savingPerDeal,
  };
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

export default function InboundVsOutboundLeadCostComparison() {
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
    num(inputs.inboundSpend) < 0 || num(inputs.inboundLeads) < 0 ||
    num(inputs.inboundCloseRate) < 0 || num(inputs.inboundCloseRate) > 100 ||
    num(inputs.outboundSpend) < 0 || num(inputs.outboundLeads) < 0 ||
    num(inputs.outboundCloseRate) < 0 || num(inputs.outboundCloseRate) > 100 ||
    num(inputs.avgDealValue) < 0;

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
    { label: "Inbound Spend", value: fmtMoney(num(inputs.inboundSpend)), group: "Inbound" },
    { label: "Inbound Leads", value: fmt(num(inputs.inboundLeads)), group: "Inbound" },
    { label: "Inbound Cost per Lead", value: fmtMoney(result.inboundCpl, 2), group: "Inbound" },
    { label: "Inbound Close Rate", value: num(inputs.inboundCloseRate).toFixed(1) + "%", group: "Inbound" },
    { label: "Inbound Deals Closed", value: fmt(result.inboundDeals), group: "Inbound" },
    { label: "Inbound Cost per Deal", value: fmtMoney(result.inboundCostPerDeal, 0), group: "Inbound", highlight: true },
    { label: "Outbound Spend", value: fmtMoney(num(inputs.outboundSpend)), group: "Outbound" },
    { label: "Outbound Leads", value: fmt(num(inputs.outboundLeads)), group: "Outbound" },
    { label: "Outbound Cost per Lead", value: fmtMoney(result.outboundCpl, 2), group: "Outbound" },
    { label: "Outbound Close Rate", value: num(inputs.outboundCloseRate).toFixed(1) + "%", group: "Outbound" },
    { label: "Outbound Deals Closed", value: fmt(result.outboundDeals), group: "Outbound" },
    { label: "Outbound Cost per Deal", value: fmtMoney(result.outboundCostPerDeal, 0), group: "Outbound", highlight: true },
    { label: "Difference per Deal", value: fmtMoney(result.savingPerDeal, 0), group: "Verdict" },
    { label: "More Efficient Channel", value: result.inboundBetter ? "Inbound" : "Outbound", group: "Verdict", highlight: true },
  ];

  const summaryStats = [
    { label: "Inbound CPL", value: fmtMoney(result.inboundCpl, 2) },
    { label: "Outbound CPL", value: fmtMoney(result.outboundCpl, 2) },
    { label: "Inbound $/Deal", value: fmtMoney(result.inboundCostPerDeal, 0) },
    { label: "Outbound $/Deal", value: fmtMoney(result.outboundCostPerDeal, 0) },
    { label: "Inbound Rev", value: fmtMoney(result.inboundRevenue, 0) },
    { label: "Outbound Rev", value: fmtMoney(result.outboundRevenue, 0) },
    { label: "Inbound Cost % of Rev", value: result.inboundCostPctOfRevenue.toFixed(1) + "%" },
    { label: "Outbound Cost % of Rev", value: result.outboundCostPctOfRevenue.toFixed(1) + "%" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Inbound vs Outbound Lead Cost Comparison" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Inbound vs Outbound Lead Cost Comparison</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Inbound Channel</div>
              <div className="grid grid-cols-2 gap-3">
                <NumInput id="inb-spend" label="Total Spend" value={inputs.inboundSpend} onChange={set("inboundSpend")} prefix="$" />
                <NumInput id="inb-leads" label="Leads Generated" value={inputs.inboundLeads} onChange={set("inboundLeads")} />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <NumInput id="inb-close" label="Close Rate" value={inputs.inboundCloseRate} onChange={set("inboundCloseRate")} suffix="%" />
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Outbound Channel</div>
              <div className="grid grid-cols-2 gap-3">
                <NumInput id="out-spend" label="Total Spend" value={inputs.outboundSpend} onChange={set("outboundSpend")} prefix="$" />
                <NumInput id="out-leads" label="Leads Generated" value={inputs.outboundLeads} onChange={set("outboundLeads")} />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <NumInput id="out-close" label="Close Rate" value={inputs.outboundCloseRate} onChange={set("outboundCloseRate")} suffix="%" />
              </div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Revenue Assumptions</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="cmp-deal" label="Avg Deal Value" value={inputs.avgDealValue} onChange={set("avgDealValue")} prefix="$" />
                    <NumInput id="cmp-cycle" label="Sales Cycle" value={inputs.salesCycleDays} onChange={set("salesCycleDays")} suffix="days" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; close rates must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Most Efficient Channel</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{result.inboundBetter ? "Inbound" : "Outbound"}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.savingPerDeal, 0)} cheaper per closed deal ({fmtMoney(result.inboundCostPerDeal, 0)} vs {fmtMoney(result.outboundCostPerDeal, 0)})</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Inbound CPL</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.inboundCpl, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Outbound CPL</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.outboundCpl, 2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Inbound Deals</span>
                <span className="font-extrabold text-foreground">{fmt(result.inboundDeals)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Channel Economics</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[160px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`${r.group === "Verdict" ? "bg-amber-500/10" : ""} ${r.highlight ? "font-bold" : ""}`}>
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
              <h2 className="text-2xl font-bold mb-3">Inbound vs Outbound: What You Are Comparing</h2>
              <p className="text-muted-foreground leading-relaxed">Inbound lead generation attracts buyers who are already searching for a solution — through SEO, content marketing, paid search, and referrals — while outbound generation pushes messages to a targeted list of prospects who may not be aware of you, via cold email, cold calling, and targeted ads. Inbound leads typically cost less per lead and close at similar or higher rates because the buyer has expressed intent, but they scale slowly and depend on content and brand investment. Outbound leads can be generated in volume on demand, but they are colder, which usually raises the cost per closed deal once close rates are factored in. This comparison tool normalizes both channels to the same unit — cost per closed deal — which is the only metric that lets you allocate budget rationally between them.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How the Comparison Works</h2>
              <p className="text-muted-foreground leading-relaxed">For each channel you enter total spend, the number of leads generated, and the close rate — the percentage of leads that become paying customers. The calculator derives cost per lead, expected deals closed, and cost per deal. Revenue is estimated by multiplying deals by the average deal value, and acquisition cost is expressed as a percentage of that revenue so you can compare channels that generate different volumes. The channel with the lower cost per closed deal is highlighted as the winner, with the per-deal saving shown. A common pattern is inbound showing a higher lead volume at a lower cost per deal, which confirms the classic argument for investing in content and search.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Beyond Cost per Deal</h2>
              <p className="text-muted-foreground leading-relaxed">Cost per deal captures acquisition efficiency but not the full picture. Sales cycle length differs by channel — outbound deals often take longer to nurture — and customer quality can differ, with inbound customers sometimes showing higher lifetime value. The average deal value input lets you test the effect of those differences: raise the value for the channel that attracts larger accounts and watch its cost percentage of revenue improve. Re-run the comparison with your actual numbers every quarter, because close rates drift as your market and messaging evolve, and the channel that wins today may not win next year.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/inbound-vs-outbound-lead-cost-comparison" />
        </div>
      </div>
    </>
  );
}