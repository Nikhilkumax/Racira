"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface DscrInput {
  noi: number;
  annualDebtService: number;
  targetDscr: number;
}

interface DscrResult {
  dscr: number;
  coverageMargin: number;
  monthlyDebtService: number;
  status: string;
  statusColor: string;
  maxDebtServiceAtTarget: number;
  chartData: { name: string; amount: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcDscr(input: DscrInput): DscrResult {
  const dscr = input.annualDebtService > 0 ? input.noi / input.annualDebtService : 0;
  const coverageMargin = input.noi - input.annualDebtService;
  const monthlyDebtService = input.annualDebtService / 12;
  const status = dscr >= 1.25 ? "Safe" : dscr >= 1.0 ? "Adequate" : "At Risk";
  const statusColor = dscr >= 1.25 ? "text-emerald-600" : dscr >= 1.0 ? "text-amber-500" : "text-red-500";
  const maxDebtServiceAtTarget = input.targetDscr > 0 ? input.noi / input.targetDscr : 0;

  const chartData = [
    { name: "Net Operating Income", amount: Math.max(0, input.noi), fill: "#10b981" },
    { name: "Annual Debt Service", amount: Math.max(0, input.annualDebtService), fill: "hsl(var(--primary))" },
  ];

  const breakdown = [
    { label: "Net Operating Income (NOI)", value: `$${input.noi.toLocaleString()}` },
    { label: "Annual Debt Service", value: `$${input.annualDebtService.toLocaleString()}` },
    { label: "Monthly Debt Service", value: `$${monthlyDebtService.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Coverage Margin", value: `$${coverageMargin.toLocaleString()}` },
    { label: "DSCR", value: dscr > 0 ? dscr.toFixed(2) : "—" },
    { label: "Target DSCR", value: input.targetDscr.toFixed(2) },
    { label: "Max Debt Service at Target", value: `$${maxDebtServiceAtTarget.toLocaleString()}` },
    { label: "Loan Status", value: status },
  ];

  const summaryStats = [
    { label: "DSCR", value: dscr > 0 ? dscr.toFixed(2) : "—" },
    { label: "Loan Status", value: status },
    { label: "Annual NOI", value: `$${input.noi.toLocaleString()}` },
    { label: "Annual Debt Service", value: `$${input.annualDebtService.toLocaleString()}` },
    { label: "Coverage Margin", value: `$${coverageMargin.toLocaleString()}` },
    { label: "Max Debt Service @ Target", value: `$${maxDebtServiceAtTarget.toLocaleString()}` },
  ];

  return { dscr, coverageMargin, monthlyDebtService, status, statusColor, maxDebtServiceAtTarget, chartData, breakdown, summaryStats };
}

const DEFAULTS: DscrInput = { noi: 120000, annualDebtService: 90000, targetDscr: 1.25 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function DebtServiceCoverageRatioCalculator() {
  const [noi, setNoi] = useState(String(DEFAULTS.noi));
  const [debt, setDebt] = useState(String(DEFAULTS.annualDebtService));
  const [target, setTarget] = useState(String(DEFAULTS.targetDscr));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [result, setResult] = useState<DscrResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcDscr({ noi: parse(noi, DEFAULTS.noi), annualDebtService: parse(debt, DEFAULTS.annualDebtService), targetDscr: Math.max(0.1, parse(target, DEFAULTS.targetDscr)) }));
  const reset = () => {
    setNoi(String(DEFAULTS.noi));
    setDebt(String(DEFAULTS.annualDebtService));
    setTarget(String(DEFAULTS.targetDscr));
    setResult(calcDscr(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcDscr(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is DSCR?", answer: "Debt Service Coverage Ratio (DSCR) = Net Operating Income ÷ Total Annual Debt Service. It measures a property or business's ability to cover its debt payments from operating income. Lenders typically require DSCR of at least 1.25x for commercial real estate — meaning NOI must exceed annual debt service by 25%." },
    { question: "What is a good DSCR?", answer: "Most commercial lenders require 1.20–1.35x or higher. A DSCR above 1.25 is generally considered safe; 1.0–1.25 is adequate but thin — a small vacancy or expense increase can push coverage below 1.0. Below 1.0 means income doesn't cover debt payments." },
    { question: "How is DSCR calculated?", answer: "DSCR = Net Operating Income ÷ Annual Debt Service. NOI is rental or operating income minus operating expenses (before mortgage payments). Annual Debt Service includes both principal and interest payments for the year, including any ground leases or other mandatory debt obligations." },
    { question: "What happens if my DSCR is below 1.0?", answer: "A DSCR below 1.0 means NOI is insufficient to cover debt payments — the shortfall must come from reserves or other income. Lenders will typically decline the loan or require a lower loan amount, higher down payment, or a co-signer to bring coverage above the minimum threshold." },
    { question: "Can I improve my DSCR?", answer: "Increase rental income or reduce operating expenses to raise NOI, extend the loan term to lower monthly payments, negotiate a lower interest rate, or refinance with a longer amortization schedule. Each of these reduces debt service relative to income." },
    { question: "Is DSCR used for personal loans?", answer: "Primarily for commercial real estate and business loans. For personal loans, lenders use DTI (debt-to-income) instead, which compares total monthly debt payments to gross monthly income. DSCR focuses on the income-generating ability of the financed asset itself." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Debt Service Coverage Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Debt Service Coverage Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Net Operating Income</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={noi} onChange={(e) => setNoi(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Annual Debt Service</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={debt} onChange={(e) => setDebt(e.target.value)} className={ci} /></div>
              </div>
            </div>

            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="text-sm text-primary font-medium text-left self-start"
            >
              Advanced Options {advancedOpen ? "▲" : "▼"}
            </button>
            {advancedOpen && (
              <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Lender Thresholds</label>
                  <label className="text-sm font-medium mb-1 block">Target DSCR</label>
                  <div className={inp}><input type="number" value={target} onChange={(e) => setTarget(e.target.value)} step={0.05} className={ci} /></div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Debt Service Coverage Ratio</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${result.statusColor}`}>{result.dscr > 0 ? result.dscr.toFixed(2) : "—"}</div>
                  <div className="text-sm text-muted-foreground mt-1">Status: {result.status} · Coverage margin: ${result.coverageMargin.toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["DSCR", result.dscr > 0 ? result.dscr.toFixed(2) : "—"], ["Annual NOI", `$${(result.chartData[0].amount).toLocaleString()}`], ["Debt Service", `$${(result.chartData[1].amount).toLocaleString()}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Coverage Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Income vs Debt Service</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is the Debt Service Coverage Ratio?</h2>
            <p>The Debt Service Coverage Ratio (DSCR) is the primary underwriting metric for commercial real estate and business loans. It compares a property's Net Operating Income to its total annual debt obligations. A ratio of 1.25x means income covers debt payments with a 25% cushion — the standard minimum most lenders require.</p>
            <h2 className="text-2xl font-bold mb-3">How to Calculate DSCR</h2>
            <p>DSCR = Net Operating Income ÷ Total Annual Debt Service. NOI is calculated as rental or business income minus operating expenses, before interest, taxes, depreciation, and mortgage payments. Debt Service includes all principal and interest payments due in a year, plus ground lease payments and other mandatory obligations.</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting Your Ratio</h2>
            <p>Above 1.25x: strong coverage, lenders compete for the loan. 1.0–1.25x: meets minimums but leaves little room for vacancy or expense shocks. Below 1.0x: income cannot cover debt service; the property is cash-flow negative on its debt, and financing will be difficult to secure without additional equity.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/debt-service-coverage-ratio-calculator" />
          <PopularCalculators exclude="/calculator/debt-service-coverage-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
