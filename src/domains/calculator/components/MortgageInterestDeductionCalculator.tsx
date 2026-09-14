"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

type Filing = "single" | "mfj" | "hoh";

interface Inputs {
  balance: number;
  rate: number;
  marginalRate: number;
  filing: Filing;
  remainingYears: number;
  propertyTax: number;
  otherSalt: number;
  charitable: number;
}

interface Row {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
  sum?: boolean;
}

interface Result {
  monthlyPayment: number;
  year1Interest: number;
  year1Principal: number;
  saltAllowed: number;
  itemizedTotal: number;
  standardDeduction: number;
  excess: number;
  taxSavings: number;
  itemizeWins: boolean;
  chartData: { name: string; value: number }[];
  breakdown: Row[];
  summaryStats: { label: string; value: string }[];
}

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

function calc(inp: Inputs): Result {
  const r = inp.rate / 100 / 12;
  const n = inp.remainingYears * 12;
  const monthlyPayment = r > 0 ? (inp.balance * r) / (1 - Math.pow(1 + r, -n)) : inp.balance / n;

  // Year-1 interest + principal from the amortization schedule
  let bal = inp.balance;
  let year1Interest = 0;
  let year1Principal = 0;
  for (let m = 1; m <= 12; m++) {
    const int = bal * r;
    const prin = monthlyPayment - int;
    year1Interest += int;
    year1Principal += prin;
    bal -= prin;
  }

  // Acquisition debt limit ($750k, post-2017): cap the interest that qualifies
  const capFactor = inp.balance > 750000 ? 750000 / inp.balance : 1;
  const deductibleInterest = year1Interest * capFactor;

  // SALT deduction capped at $10,000 combined (property + income/sales tax)
  const saltCombined = inp.propertyTax + inp.otherSalt;
  const saltAllowed = Math.min(saltCombined, 10000);
  const itemizedTotal = deductibleInterest + saltAllowed + inp.charitable;

  const standardDeduction = inp.filing === "single" ? 15000 : inp.filing === "hoh" ? 22500 : 30000;
  const excess = itemizedTotal - standardDeduction;
  const taxSavings = excess > 0 ? excess * (inp.marginalRate / 100) : 0;
  const itemizeWins = excess > 0;

  const filingLabel = inp.filing === "single" ? "Single" : inp.filing === "hoh" ? "Head of Household" : "Married Filing Jointly";

  const breakdown: Row[] = [
    { label: "Mortgage Balance", value: money(inp.balance), sum: true },
    { label: "Interest Rate", value: inp.rate.toFixed(2) + "%" },
    { label: "Amortization Term", value: inp.remainingYears + " years" },
    { label: "Marginal Tax Rate", value: inp.marginalRate.toFixed(0) + "%", sum: true },
    { label: "Filing Status", value: filingLabel, sum: true },
    { label: "Standard Deduction (Your Filing)", value: money(standardDeduction), sum: true },
    { label: "Year-1 Mortgage Interest", value: money(deductibleInterest) + (capFactor < 1 ? " (capped at $750K debt)" : ""), highlight: true, sum: true },
    {
      label: "Other Itemized (Property + SALT + Charity)",
      value: money(saltAllowed + inp.charitable) + " (" + money(inp.propertyTax) + " + " + money(inp.otherSalt) + " + " + money(inp.charitable) + ")",
      sum: true,
    },
    { label: "Total Itemized Deductions", value: money(itemizedTotal), highlight: true, sum: true },
    { label: "Itemized vs Standard", value: itemizeWins ? "Itemize — " + money(excess) + " more" : "Standard — better by " + money(-excess), highlight: true, sum: true },
    { label: "Estimated Tax Savings (Year 1)", value: money(taxSavings), isTotal: true, sum: true },
  ];

  const summaryStats = breakdown.filter((row) => row.sum).map((row) => ({ label: row.label, value: row.value }));

  const chartData = [
    { name: "Standard Deduction", value: Math.round(standardDeduction) },
    { name: "Total Itemized", value: Math.round(itemizedTotal) },
  ];

  return {
    monthlyPayment,
    year1Interest: deductibleInterest,
    year1Principal,
    saltAllowed,
    itemizedTotal,
    standardDeduction,
    excess,
    taxSavings,
    itemizeWins,
    chartData,
    breakdown,
    summaryStats,
  };
}

const DEFAULTS: Inputs = { balance: 400000, rate: 6.5, marginalRate: 24, filing: "mfj", remainingYears: 30, propertyTax: 5000, otherSalt: 3000, charitable: 2000 };

export default function MortgageInterestDeductionCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [rate, setRate] = useState(String(DEFAULTS.rate));
  const [marginalRate, setMarginalRate] = useState(String(DEFAULTS.marginalRate));
  const [filing, setFiling] = useState<Filing>(DEFAULTS.filing);
  const [remainingYears, setRemainingYears] = useState(String(DEFAULTS.remainingYears));
  const [propertyTax, setPropertyTax] = useState(String(DEFAULTS.propertyTax));
  const [otherSalt, setOtherSalt] = useState(String(DEFAULTS.otherSalt));
  const [charitable, setCharitable] = useState(String(DEFAULTS.charitable));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    balance: parseFloat(balance) || 0,
    rate: parseFloat(rate) || 0,
    marginalRate: parseFloat(marginalRate) || 0,
    filing,
    remainingYears: parseInt(remainingYears) || 0,
    propertyTax: parseFloat(propertyTax) || 0,
    otherSalt: parseFloat(otherSalt) || 0,
    charitable: parseFloat(charitable) || 0,
  });

  const calcNow = () => setResult(calc(g()));
  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setRate(String(DEFAULTS.rate));
    setMarginalRate(String(DEFAULTS.marginalRate));
    setFiling(DEFAULTS.filing);
    setRemainingYears(String(DEFAULTS.remainingYears));
    setPropertyTax(String(DEFAULTS.propertyTax));
    setOtherSalt(String(DEFAULTS.otherSalt));
    setCharitable(String(DEFAULTS.charitable));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => {
    setResult(calc(DEFAULTS));
  }, []);

  const bal = parseFloat(balance) || 0;
  const rt = parseFloat(rate) || 0;
  const mr = parseFloat(marginalRate) || 0;
  const yrs = parseInt(remainingYears) || 0;

  const valErrors: Record<string, string> = {};
  if (!balance || bal <= 0) valErrors.balance = "Mortgage balance must be greater than $0";
  if (rate === "" || isNaN(parseFloat(rate))) valErrors.rate = "Enter an interest rate";
  else if (rt <= 0 || rt > 30) valErrors.rate = "Interest rate must be between 0% and 30%";
  if (marginalRate === "" || isNaN(parseFloat(marginalRate))) valErrors.marginalRate = "Enter a marginal tax rate";
  else if (mr < 0 || mr > 50) valErrors.marginalRate = "Marginal rate must be between 0% and 50%";
  if (isNaN(yrs) || yrs < 1 || yrs > 50) valErrors.remainingYears = "Term must be 1–50 years";
  if (parseFloat(propertyTax) < 0 || parseFloat(otherSalt) < 0 || parseFloat(charitable) < 0) {
    valErrors.adv = "Deduction amounts cannot be negative";
  }
  const hasErrors = Object.keys(valErrors).length > 0;

  const inputCls =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const fieldCls =
    "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const selectCls =
    "w-full h-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Mortgage Interest Deduction Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Interest Deduction Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mi-balance" className="text-sm font-medium mb-1 block">Mortgage Balance ($)</label>
                <div className={inputCls}>
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                  <input id="mi-balance" type="number" min="0" value={balance} onChange={(e) => setBalance(e.target.value)} className={fieldCls} />
                </div>
                {valErrors.balance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.balance}</p>}
              </div>
              <div>
                <label htmlFor="mi-rate" className="text-sm font-medium mb-1 block">Interest Rate (%)</label>
                <div className={inputCls}>
                  <input id="mi-rate" type="number" min="0.1" max="30" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.rate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.rate}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mi-marginal" className="text-sm font-medium mb-1 block">Marginal Tax Rate (%)</label>
                <div className={inputCls}>
                  <input id="mi-marginal" type="number" min="0" max="50" step="1" value={marginalRate} onChange={(e) => setMarginalRate(e.target.value)} className={fieldCls} />
                  <span className="pr-3 pl-1 text-sm text-muted-foreground select-none">%</span>
                </div>
                {valErrors.marginalRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.marginalRate}</p>}
              </div>
              <div>
                <label htmlFor="mi-filing" className="text-sm font-medium mb-1 block">Filing Status</label>
                <div className="relative h-10">
                  <select id="mi-filing" value={filing} onChange={(e) => setFiling(e.target.value as Filing)} className={selectCls}>
                    <option value="mfj">Married Filing Jointly</option>
                    <option value="single">Single</option>
                    <option value="hoh">Head of Household</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Loan Details</div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label htmlFor="mi-term" className="text-sm font-medium mb-1 block">Remaining Loan Term (Years)</label>
                      <div className="relative h-10">
                        <select id="mi-term" value={remainingYears} onChange={(e) => setRemainingYears(e.target.value)} className={selectCls}>
                          <option value="30">30 years</option>
                          <option value="20">20 years</option>
                          <option value="15">15 years</option>
                          <option value="10">10 years</option>
                        </select>
                      </div>
                      {valErrors.remainingYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.remainingYears}</p>}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Other Itemized Deductions</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="mi-proptax" className="text-sm font-medium mb-1 block">Property Taxes (Annual)</label>
                      <div className={inputCls}>
                        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                        <input id="mi-proptax" type="number" min="0" value={propertyTax} onChange={(e) => setPropertyTax(e.target.value)} className={fieldCls} />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="mi-salt" className="text-sm font-medium mb-1 block">State & Local Income Tax</label>
                      <div className={inputCls}>
                        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                        <input id="mi-salt" type="number" min="0" value={otherSalt} onChange={(e) => setOtherSalt(e.target.value)} className={fieldCls} />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="mi-charity" className="text-sm font-medium mb-1 block">Charitable Contributions (Annual)</label>
                      <div className={inputCls}>
                        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none">$</span>
                        <input id="mi-charity" type="number" min="0" value={charitable} onChange={(e) => setCharitable(e.target.value)} className={fieldCls} />
                      </div>
                    </div>
                  </div>
                  {valErrors.adv && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.adv}</p>}
                  <p className="text-[11px] text-muted-foreground mt-1">Property tax + state & local tax are capped at $10,000 combined (SALT cap).</p>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Year-1 Tax Savings</div>
                  <div className="text-4xl font-extrabold tracking-tight text-foreground">{money(result.taxSavings)}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {result.itemizeWins ? "Itemizing beats the standard deduction by " + money(result.excess) : "Standard deduction wins — itemized is " + money(-result.excess) + " below it"}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    ["Year-1 Mortgage Interest", money(result.year1Interest), "text-primary"],
                    ["Total Itemized", money(result.itemizedTotal), "text-amber-600"],
                    [result.itemizeWins ? "Itemize — Better Choice" : "Standard — Better Choice", money(Math.abs(result.excess)) + (result.itemizeWins ? " more" : " gap"), "text-emerald-600"],
                  ].map(([l, v, color], idx) => (
                    <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className={`text-sm font-bold leading-tight ${color}`}>{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Deduction Comparison (Year 1)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={84}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + Math.round(Number(v) / 1000) + "K"} />
                      <Tooltip formatter={(v: number) => [money(Number(v)), "Deduction"]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="value" name="Deduction">
                        <Cell fill="#94a3b8" />
                        <Cell fill={result.itemizeWins ? "#2563eb" : "#f59e0b"} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {result.itemizeWins
                      ? "You take the higher amount automatically. Your year-1 savings is the " + money(result.excess) + " excess multiplied by your " + (parseFloat(marginalRate) || 0).toFixed(0) + "% marginal rate."
                      : "Itemizing only helps when the total exceeds the standard deduction — here it does not, so you take the standard deduction of " + money(result.standardDeduction) + "."}
                  </p>
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
            <h2 className="text-2xl font-bold mb-3">Itemize Only When the Total Beats the Standard Deduction</h2>
            <p>The mortgage interest deduction is an itemized deduction: you can claim it only if the sum of everything you itemize exceeds the standard deduction for your filing status. Since the standard deduction was raised to $15,000 for single filers and $30,000 for married couples filing jointly, many homeowners no longer benefit — the interest on a smaller mortgage, once added to capped property and state taxes, simply does not clear the bar. This calculator works through the year-1 amortization of your mortgage to find the interest actually paid in the next 12 months, adds your other itemized deductions, applies the $10,000 SALT cap and the $750,000 acquisition-debt limit, and tells you which side of the standard deduction you land on — and what your choice is worth in tax savings.</p>
          </section>
          <FAQSection faqs={[
            { question: "Is mortgage interest always tax deductible?", answer: "Only if you itemize, and only if your total itemized deductions exceed your standard deduction. Interest on up to $750,000 of acquisition debt qualifies (mortgages taken after December 2017); interest on home-equity debt counts only if the proceeds were used to buy, build, or improve the home." },
            { question: "How much mortgage interest will I pay in the first year?", answer: "Early payments are almost entirely interest. On a $400,000 mortgage at 6.5% for 30 years, roughly $25,900 of the first 12 payments is interest. That figure declines every year as the balance amortizes — which is why the deduction shrinks over the life of the loan." },
            { question: "What is the SALT cap?", answer: "The deduction for state and local taxes — property tax plus state income or sales tax combined — is capped at $10,000 per return ($5,000 if married filing separately). Any amount above the cap cannot be itemized, even if you paid it." },
          ]} pageUrl="https://racira.com/calculator/mortgage-interest-deduction-calculator" />
          <PopularCalculators exclude="/calculator/mortgage-interest-deduction-calculator" />
        </div>
      </div>
    </>
  );
}
