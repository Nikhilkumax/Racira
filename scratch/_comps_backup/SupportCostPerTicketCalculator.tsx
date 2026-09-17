"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  supportSpend: string;
  tickets: string;
  agents: string;
  agentSalary: string;
  avgHandleMinutes: string;
  resolutionRate: string;
  csatScore: string;
}

interface Result {
  costPerTicket: number;
  ticketsPerAgent: number;
  totalAgentCost: number;
  monthlyCapacity: number;
  utilizationPct: number;
  costPerResolved: number;
  resolutionRatePct: number;
  ticketsPerDayPerAgent: number;
}

const DEFAULTS: Inputs = {
  supportSpend: "85000",
  tickets: "24000",
  agents: "12",
  agentSalary: "52000",
  avgHandleMinutes: "18",
  resolutionRate: "92",
  csatScore: "4.3",
};

function calculate(inputs: Inputs): Result {
  const supportSpend = Math.max(0, parseFloat(inputs.supportSpend) || 0);
  const tickets = Math.max(0, parseFloat(inputs.tickets) || 0);
  const agents = Math.max(0, parseFloat(inputs.agents) || 0);
  const agentSalary = Math.max(0, parseFloat(inputs.agentSalary) || 0);
  const avgHandleMinutes = Math.max(0, parseFloat(inputs.avgHandleMinutes) || 0);
  const resolutionRate = Math.min(100, Math.max(0, parseFloat(inputs.resolutionRate) || 0));
  const csatScore = Math.min(5, Math.max(0, parseFloat(inputs.csatScore) || 0));

  const costPerTicket = tickets > 0 ? supportSpend / tickets : 0;
  const totalAgentCost = agents * agentSalary;
  const ticketsPerAgent = agents > 0 ? tickets / agents : 0;
  const monthlyCapacity = avgHandleMinutes > 0 ? (agents * 160 * 60) / avgHandleMinutes : 0;
  const utilizationPct = monthlyCapacity > 0 ? (tickets / monthlyCapacity) * 100 : 0;
  const resolvedTickets = tickets * (resolutionRate / 100);
  const costPerResolved = resolvedTickets > 0 ? supportSpend / resolvedTickets : 0;
  const ticketsPerDayPerAgent = agents > 0 ? tickets / (agents * 21) : 0;

  return { costPerTicket, ticketsPerAgent, totalAgentCost, monthlyCapacity, utilizationPct, costPerResolved, resolutionRatePct: resolutionRate, ticketsPerDayPerAgent };
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

export default function SupportCostPerTicketCalculator() {
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
    num(inputs.supportSpend) <= 0 ||
    num(inputs.tickets) <= 0 ||
    num(inputs.agents) <= 0 ||
    num(inputs.agentSalary) < 0 ||
    num(inputs.avgHandleMinutes) <= 0 ||
    num(inputs.resolutionRate) < 0 || num(inputs.resolutionRate) > 100 ||
    num(inputs.csatScore) < 0 || num(inputs.csatScore) > 5;

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
    { label: "Annual Support Spend", value: fmtMoney(num(inputs.supportSpend), 0) },
    { label: "Tickets Handled", value: fmt(num(inputs.tickets)) },
    { label: "Cost Per Ticket", value: fmtMoney(result.costPerTicket), highlight: true },
    { label: "Support Agents", value: fmt(num(inputs.agents)) },
    { label: "Tickets Per Agent", value: fmt(result.ticketsPerAgent) },
    { label: "Tickets Per Agent / Day", value: fmt(result.ticketsPerDayPerAgent, 1) },
    { label: "Avg Handle Time", value: num(inputs.avgHandleMinutes).toFixed(0) + " min" },
    { label: "Theoretical Monthly Capacity", value: fmt(result.monthlyCapacity) },
    { label: "Capacity Utilization", value: result.utilizationPct.toFixed(1) + "%" },
    { label: "Resolution Rate", value: result.resolutionRatePct.toFixed(1) + "%" },
    { label: "Cost Per Resolved Ticket", value: fmtMoney(result.costPerResolved), highlight: true },
  ];

  const summaryStats = [
    { label: "Cost / Ticket", value: fmtMoney(result.costPerTicket) },
    { label: "Tickets / Agent", value: fmt(result.ticketsPerAgent) },
    { label: "Utilization", value: result.utilizationPct.toFixed(1) + "%" },
    { label: "Resolution Rate", value: result.resolutionRatePct.toFixed(1) + "%" },
    { label: "Cost / Resolved", value: fmtMoney(result.costPerResolved) },
    { label: "Agent Cost", value: fmtMoney(result.totalAgentCost, 0) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Support Cost Per Ticket Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Support Cost Per Ticket Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="spt-spend" label="Annual Support Spend" value={inputs.supportSpend} onChange={set("supportSpend")} prefix="$" />
              <NumInput id="spt-tickets" label="Tickets Handled" value={inputs.tickets} onChange={set("tickets")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="spt-agents" label="Support Agents" value={inputs.agents} onChange={set("agents")} />
              <NumInput id="spt-salary" label="Avg Agent Salary" value={inputs.agentSalary} onChange={set("agentSalary")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Quality Metrics</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="spt-handle" label="Avg Handle Time" value={inputs.avgHandleMinutes} onChange={set("avgHandleMinutes")} suffix="min" />
                    <NumInput id="spt-resolve" label="Resolution Rate" value={inputs.resolutionRate} onChange={set("resolutionRate")} suffix="%" />
                  </div>
                  <NumInput id="spt-csat" label="CSAT (1-5)" value={inputs.csatScore} onChange={set("csatScore")} />
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Spend, tickets, agents, and handle time must be greater than zero; salary must be non-negative; resolution rate must be 0-100 and CSAT 0-5.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Cost Per Ticket</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.costPerTicket)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(num(inputs.supportSpend), 0)} across {fmt(num(inputs.tickets))} tickets</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tickets / Agent</span>
                <span className="font-extrabold text-foreground">{fmt(result.ticketsPerAgent)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Utilization</span>
                <span className={`font-extrabold ${result.utilizationPct > 85 ? "text-amber-600" : "text-emerald-600"}`}>{result.utilizationPct.toFixed(1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost / Resolved</span>
                <span className="font-extrabold text-foreground">{fmtMoney(result.costPerResolved)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Support Operations</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is Cost Per Ticket?</h2>
              <p className="text-muted-foreground leading-relaxed">Cost per ticket measures the fully loaded expense of handling a single customer support interaction, calculated as total support spend divided by tickets handled. The numerator should include agent salaries, management overhead, tools and software licenses, training, and any outsourced capacity. Typical figures range from $3–$10 per ticket for self-service-heavy operations to $15–$40 for complex technical support. Cost per ticket is the denominator-side metric of support efficiency: it tells you how expensive your operation is, but not whether the support is good. That is why it belongs alongside resolution rate, CSAT, and first-response time.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Use This Calculator</h2>
              <p className="text-muted-foreground leading-relaxed">Enter your annual support spend and ticket volume for the headline cost per ticket. Adding your agent count and average salary lets the calculator derive tickets per agent, the daily ticket load, and capacity utilization — the share of theoretical agent time consumed by tickets, assuming 160 working hours per agent per month. Utilization above 85% signals a team running hot with rising response times; below 50% suggests overstaffing. The Advanced Options add average handle time, resolution rate, and CSAT so you can track the quality-adjusted cost: cost per resolved ticket divides spend only by tickets actually resolved, penalizing operations that close tickets without solving problems.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Lower Cost Per Ticket</h2>
              <p className="text-muted-foreground leading-relaxed">The classic levers are deflection, automation, and tiering. Every ticket routed to a help center article, FAQ, or chatbot costs nearly nothing compared to a human interaction, so measuring the deflection rate — contacts avoided per ticket created — is often more valuable than tracking cost per ticket itself. Within human support, triage to specialist tiers prevents expensive senior agents from answering routine questions, and knowledge-base quality shortens handle time. But cutting cost per ticket blindly can raise churn: support quality drives retention, and a resolved customer is worth far more than the ticket cost. Track cost per ticket and CSAT together, and treat any cost reduction that collapses satisfaction as a false economy.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/support-cost-per-ticket-calculator" />
        </div>
      </div>
    </>
  );
}