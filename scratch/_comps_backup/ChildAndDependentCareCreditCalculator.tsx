"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Inputs {
  expenses: number;
  children: number; // 1 or 2+
  agi: number;
  dcfsa: number;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  expenseCap: number;
  qualifyingExpenses: number;
  creditRate: number;
  credit: number;
  dcfsaExcluded: number;
  aboveCap: number;
  donutData: { name: string; value: number; color: string }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const PIE_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function calc(inp: Inputs): Result {
  const expenseCap = inp.children >= 2 ? 6000 : 3000;
  const dcfsaExcluded = Math.min(inp.dcfsa, expenseCap, inp.expenses);
  const qualifyingExpenses = Math.max(0, Math.min(inp.expenses, expenseCap) - dcfsaExcluded);
  // Expenses that could not be counted because of the cap (or DCFSA exclusion).
  const aboveCapClean = Math.max(0, inp.expenses - expenseCap - dcfsaExcluded);

  const agiAboveFloor = Math.max(0, inp.agi - 15000);
  const steps = Math.ceil(agiAboveFloor / 2000);
  const creditRate = Math.max(20, 35 - steps);
  const credit = (qualifyingExpenses * creditRate) / 100;

  const childLabel = inp.children >= 2 ? "2 or more" : "1";

  const donutData = [
    { name: "Counted for Credit", value: Math.round(qualifyingExpenses), color: PIE_COLORS[0] },
    { name: "Excluded (DCFSA)", value: Math.round(dcfsaExcluded), color: PIE_COLORS[1] },
    { name: "Above Cap", value: Math.round(aboveCapClean), color: PIE_COLORS[2] },
  ].filter((d) => d.value > 0);

  const breakdown: Row[] = [
    { label: "Childcare Expenses (Paid)", value: money(inp.expenses), sum: true },
    { label: "Qualifying Children", value: childLabel },
    { label: "Expense Cap", value: money(expenseCap) },
    { label: "Dependent Care FSA Exclusion", value: money(dcfsaExcluded), highlight: inp.dcfsa > 0, sum: true },
    { label: "Qualifying Expenses", value: money(qualifyingExpenses), highlight: true, sum: true },
    { label: "Adjusted Gross Income", value: money(inp.agi), sum: true },
    { label: "Credit Rate", value: creditRate.toFixed(0) + "%", highlight: true, sum: true },
    { label: "Estimated Child & Dependent Care Credit", value: money(credit), isTotal: true, sum: true },
  ];

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  return {
    expenseCap,
    qualifyingExpenses,
    creditRate,
    credit,
    dcfsaExcluded,
    aboveCap: aboveCapClean,
    donutData,
    breakdown,
    summaryStats,
  };
}

const DEFAULTS: Inputs = { expenses: 8000, children: 2, agi: 75000, dcfsa: 0 };

export default function ChildAndDependentCareCreditCalculator() {
  const [expenses, setExpenses] = useState(String(DEFAULTS.expenses));
  const [children, setChildren] = useState("2");
  const [agi, setAgi] = useState(String(DEFAULTS.agi));
  const [dcfsa, setDcfsa] = useState(String(DEFAULTS.dcfsa));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    expenses: parseFloat(expenses) || 0,
    children: parseInt(children) || 1,
    agi: parseFloat(agi) || 0,
    dcfsa: parseFloat(dcfsa) || 0,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setExpenses(String(DEFAULTS.expenses));
    setChildren("2");
    setAgi(String(DEFAULTS.agi));
    setDcfsa(String(DEFAULTS.dcfsa));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const exp = parseFloat(expenses) || 0;
  const ag = parseFloat(agi) || 0;
  const dc = parseFloat(dcfsa) || 0;

  const valErrors: Record<string, string> = {};
  if (expenses === "" || isNaN(parseFloat(expenses))) valErrors.expenses = "Enter childcare expenses";
  else if (exp < 0) valErrors.expenses = "Expenses cannot be negative";
  else if (exp > 60000) valErrors.expenses = "Expenses look too high (max $60,000)";
  if (agi === "" || isNaN(parseFloat(agi))) valErrors.agi = "Enter your adjusted gross income";
  else if (ag < 0) valErrors.agi = "AGI cannot be negative";
  if (dc < 0) valErrors.dcfsa = "DCFSA amount cannot be negative";
  else if (dc > 10000) valErrors.dcfsa = "DCFSA amount looks too high";
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const selectCls =
    "w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  const donutTotal = result ? result.donutData.reduce((s, d) => s + d.value, 0) : 0;

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Child and Dependent Care Credit Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Child and Dependent Care Credit Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cc-expenses" className="text-sm font-medium mb-1 block">Childcare Expenses (Annual)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="cc-expenses" type="number" min="0" value={expenses} onChange={(e) => setExpenses(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.expenses && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.expenses}</p>}
              </div>
              <div>
                <label htmlFor="cc-children" className="text-sm font-medium mb-1 block">Qualifying Children</label>
                <div className="relative h-10">
                  <select id="cc-children" value={children} onChange={(e) => setChildren(e.target.value)} className={selectCls}>
                    <option value="1">1 child</option>
                    <option value="2">2 or more children</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cc-agi" className="text-sm font-medium mb-1 block">Adjusted Gross Income ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="cc-agi" type="number" min="0" value={agi} onChange={(e) => setAgi(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.agi && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.agi}</p>}
              </div>
              <div className="flex flex-col justify-end">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Expenses up to $3,000 (1 child) or $6,000 (2+) qualify; the credit rate falls from 35% to a 20% floor as income rises.
                </p>
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Dependent Care Benefits</div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label htmlFor="cc-dcfsa" className="text-sm font-medium mb-1 block">Dependent Care FSA (DCFSA) Contributions ($)</label>
                      <div className={inputCls}>
                        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                        <input id="cc-dcfsa" type="number" min="0" step="100" value={dcfsa} onChange={(e) => setDcfsa(e.target.value)} className={fieldCls} />
                      </div>
                      {valErrors.dcfsa && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.dcfsa}</p>}
                      <p className="text-[11px] text-muted-foreground mt-1">DCFSA dollars are excluded from the credit dollar for dollar (annual limit $5,000, or $2,500 if married filing separately).</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <button type="button" disabled={hasErrors} onClick={calcNow} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
            </div>
            {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Child Care Credit</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money(result.credit)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {result.creditRate.toFixed(0)}% of {money(result.qualifyingExpenses)} in qualifying expenses · nonrefundable
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Credit Rate", result.creditRate.toFixed(0) + "%", "text-primary"],
                    ["Qualifying Expenses", money(result.qualifyingExpenses), "text-amber-600"],
                    ["Estimated Credit", money(result.credit), "text-emerald-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-base font-bold ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">How Your Expenses Are Counted</h3>
                  {donutTotal > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={220}>
                        <RPie>
                          <Pie data={result.donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} strokeWidth={2}>
                            {result.donutData.map((d, idx) => (
                              <Cell key={idx} fill={d.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number, name: string) => [name, money(Number(v))]} />
                        </RPie>
                      </ResponsiveContainer>
                      <div className="flex items-center justify-center gap-5 mt-1 text-sm flex-wrap">
                        {result.donutData.map((d) => (
                          <div key={d.name} className="flex items-center gap-1.5">
                            <span className="inline-block w-3 h-3 rounded-full" style={{ background: d.color }} />
                            <span className="text-muted-foreground">{d.name}</span>
                            <span className="font-bold text-foreground">{Math.round((d.value / donutTotal) * 1000) / 10}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Full Breakdown</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {result.breakdown.map((r, idx) => (
                        <tr key={idx} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold" : ""} ${r.highlight ? "bg-primary/5" : ""}`}>
                          <td className={`py-2.5 px-3 ${r.highlight || r.isTotal ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                          <td className={`py-2.5 px-3 text-right ${r.highlight || r.isTotal ? "font-bold text-primary" : "font-semibold"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold text-right">{s.value}</span>
                      </div>
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
            <h2 className="text-2xl font-bold mb-3">A Credit That Scales with Your Expenses — and Your Income</h2>
            <p>The child and dependent care credit offsets a percentage of what you pay for care that lets you work or look for work. Two limits shape the number: an expense cap of $3,000 for one qualifying child or $6,000 for two or more, and an income-based rate that starts at 35% and drops one percentage point for every $2,000 (or part of $2,000) of adjusted gross income above $15,000, bottoming out at 20%. Expenses reimbursed through a dependent care FSA reduce the amount that qualifies dollar for dollar — you cannot claim the same dollar through both. Because the credit is nonrefundable, it can only reduce tax you owe; families with little or no tax liability may not be able to use the full amount.</p>
          </section>
          <FAQSection faqs={[
            { question: "How much is the child and dependent care credit?", answer: "It is a percentage of your qualifying expenses — up to 35%, reduced to 20% as income rises — applied to a maximum of $3,000 of expenses for one qualifying child or $6,000 for two or more. That puts the top credit at $1,050 for one child and $2,100 for two, with most middle-income families at the 20% floor ($600 / $1,200)." },
            { question: "Who counts as a qualifying dependent for this credit?", answer: "A child under age 13 whom you claim as a dependent and who lives with you more than half the year, or a spouse or dependent of any age who is physically or mentally incapable of self-care and lives with you more than half the year. The care must enable you and your spouse to work or look for work." },
            { question: "Does using a Dependent Care FSA reduce my credit?", answer: "Yes, dollar for dollar. The credit and the FSA cannot be claimed for the same expenses, so every dollar reimbursed by the FSA is subtracted from the expenses that qualify for the credit before the rate is applied. In many cases the tax-free FSA is worth more than the credit would be, so the calculator shows the tradeoff." },
          ]} pageUrl="https://racira.com/calculator/child-and-dependent-care-credit-calculator" />
          <PopularCalculators exclude="/calculator/child-and-dependent-care-credit-calculator" />
        </div>
      </div>
    </>
  );
}
