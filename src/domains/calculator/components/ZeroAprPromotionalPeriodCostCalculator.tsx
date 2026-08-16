"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// ── 1. TypeScript interfaces — no 'any' ──────────────────────────────────
interface ZeroAprInputs {
  balance: number;
  payment: number;
  promoMonths: number;
  apr: number;
}

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
}

interface ZeroAprResult {
  paidInPromo: boolean;
  balanceAtPromoEnd: number;
  monthsToPayoff: number;
  payoffDate: string;
  interestAfterPromo: number;
  interestSaved: number;
  totalInterest: number;
  totalPaid: number;
  principalShare: number;
  chartData: { name: string; value: number; color: string }[];
  breakdown: BreakdownRow[];
  summary: { label: string; value: string }[];
}

// ── 2. Pure calculation function — zero React, fully typed ───────────────
function calculateZeroApr(inputs: ZeroAprInputs): ZeroAprResult {
  const { balance, payment, promoMonths, apr } = inputs;
  const monthlyRate = apr / 100 / 12;
  const start = new Date();
  start.setMonth(start.getMonth() + 1);

  // Simulate payment schedule with a 0% promo for promoMonths, then APR.
  let bal = balance;
  let month = 0;
  let interest = 0;

  // Promo period (0% APR)
  while (bal > 0 && month < promoMonths) {
    bal -= payment;
    month++;
  }

  let paidInPromo = false;
  if (bal <= 0) {
    paidInPromo = true;
    bal = 0;
  } else {
    // Post-promo: interest accrues monthly on the remaining balance.
    let guard = 0;
    while (bal > 0 && guard < 600) {
      const i = bal * monthlyRate;
      interest += i;
      bal = bal + i - payment;
      month++;
      guard++;
    }
    if (bal < 0) bal = 0;
  }

  const monthsToPayoff = payment > 0 ? month : 0;
  const payoff = new Date(start);
  payoff.setMonth(payoff.getMonth() + (monthsToPayoff - 1));
  const payoffDate = monthsToPayoff > 0
    ? payoff.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  // Counterfactual: same payments with APR applied from day one.
  let nb = balance;
  let noPromoInterest = 0;
  let guard2 = 0;
  while (nb > 0 && guard2 < 600) {
    const i = nb * monthlyRate;
    noPromoInterest += i;
    nb = nb + i - payment;
    guard2++;
  }

  const totalInterest = interest;
  const interestSaved = Math.max(0, noPromoInterest - interest);
  const totalPaid = balance + totalInterest;

  const chartData = [
    { name: "Principal", value: Math.max(0, balance), color: "hsl(var(--primary))" },
    { name: "Interest", value: Math.max(0, totalInterest), color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const balanceAtPromoEnd = Math.max(0, balance - payment * promoMonths);
  const breakdown: BreakdownRow[] = [
    { label: "Original Balance", value: `$${balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Payments During Promo", value: `$${(payment * promoMonths).toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Balance at Promo End", value: `$${balanceAtPromoEnd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, highlight: balanceAtPromoEnd > 0 },
    { label: "Post-Promo Interest", value: `$${totalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: true },
    { label: "Interest Saved vs No Promo", value: `$${interestSaved.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Total Interest Paid", value: `$${totalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, isTotal: true },
  ];

  const summary = [
    { label: "Original Balance", value: `$${balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Monthly Payment", value: `$${payment.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Promo Months", value: `${promoMonths} months` },
    { label: "Post-Promo APR", value: `${apr}%` },
    { label: "Paid Within Promo", value: paidInPromo ? "Yes" : "No" },
    { label: "Balance at Promo End", value: `$${balanceAtPromoEnd.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Months to Payoff", value: monthsToPayoff > 0 ? `${monthsToPayoff}` : "—" },
    { label: "Total Interest Paid", value: `$${totalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Total Paid", value: `$${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
  ];

  return {
    paidInPromo, balanceAtPromoEnd, monthsToPayoff, payoffDate,
    interestAfterPromo: totalInterest, interestSaved, totalInterest, totalPaid,
    principalShare: balance, chartData, breakdown, summary,
  };
}

// ── 3. DEFAULTS object — realistic values ────────────────────────────────
const DEFAULTS: ZeroAprInputs = { balance: 2500, payment: 150, promoMonths: 12, apr: 22 };

// ── Shared UI helpers (typed, no 'any') ──────────────────────────────────
const fmtMoney = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  min?: string;
  error?: string;
}

const CompactInput = ({ id, label, value, onChange, prefix, suffix, min, error }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${error ? "border-red-500" : "border-input"}`}>
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input
        id={id}
        type="number"
        min={min}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
    {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}
  </div>
);

interface ChartTooltipProps {
  active?: boolean;
  payload?: { name?: string | number; value?: number | string }[];
}

const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  return (
    <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
      <p className="font-bold text-muted-foreground mb-0.5">{String(p.name)}</p>
      <p className="text-primary font-extrabold text-sm">{typeof p.value === "number" ? `$${fmtMoney(p.value)}` : String(p.value)}</p>
    </div>
  );
};

// ── 4. Component ─────────────────────────────────────────────────────────
export default function ZeroAprPromotionalPeriodCostCalculator() {
  const [balance, setBalance] = useState(String(DEFAULTS.balance));
  const [payment, setPayment] = useState(String(DEFAULTS.payment));
  const [promoMonths, setPromoMonths] = useState(String(DEFAULTS.promoMonths));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [results, setResults] = useState<ZeroAprResult>(() => calculateZeroApr(DEFAULTS));

  const getInputs = (): ZeroAprInputs => ({
    balance: parseFloat(balance) || 0,
    payment: parseFloat(payment) || 0,
    promoMonths: parseInt(promoMonths, 10) || 0,
    apr: parseFloat(apr) || 0,
  });

  useEffect(() => {
    setResults(calculateZeroApr(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valErrors: Record<string, string> = {};
  const b = parseFloat(balance) || 0;
  const p = parseFloat(payment) || 0;
  const m = parseInt(promoMonths, 10) || 0;
  if (b <= 0) valErrors.balance = "Balance must be greater than 0";
  if (p <= 0) valErrors.payment = "Monthly payment must be greater than 0";
  if (m < 1) valErrors.promoMonths = "Promo period must be at least 1 month";
  if ((parseFloat(apr) || 0) < 0 || (parseFloat(apr) || 0) > 99) valErrors.apr = "APR must be between 0% and 99%";
  const hasErrors = Object.keys(valErrors).length > 0;

  const calc = () => {
    if (hasErrors) return;
    setResults(calculateZeroApr(getInputs()));
  };

  const reset = () => {
    setBalance(String(DEFAULTS.balance));
    setPayment(String(DEFAULTS.payment));
    setPromoMonths(String(DEFAULTS.promoMonths));
    setApr(String(DEFAULTS.apr));
    setResults(calculateZeroApr(DEFAULTS));
  };

  const handlePrint = () => window.print();

  const piePct = (v: number) => (results.totalPaid > 0 ? Math.round((v / results.totalPaid) * 1000) / 10 : 0);
  const totalPct = results.chartData.reduce((sum, d) => sum + piePct(d.value), 0);
  const chartData = results.chartData.map((d, i) =>
    i === 0 && totalPct !== 100 && results.chartData.length > 0
      ? { ...d, pct: Math.round((piePct(d.value) + (100 - totalPct)) * 10) / 10 }
      : { ...d, pct: piePct(d.value) }
  );

  const faqs = [
    {
      question: "What happens if I don't pay off the balance before the 0% promo ends?",
      answer: "Any balance still owed when the promotional period ends starts accruing interest at the card's standard APR. The calculator simulates that: it tracks your payments during the promo, then applies monthly interest to the remaining balance until it is paid off, so you can see the true cost of carrying the balance past the promo window.",
    },
    {
      question: "How much should I pay to clear the balance before the promo ends?",
      answer: "Divide your current balance by the number of promo months remaining. If your balance is $2,500 with 12 months left, you need to pay at least $209 per month to finish before interest kicks in. The calculator's Balance at Promo End row shows you exactly how much is left at the promo deadline with your current payment.",
    },
    {
      question: "Is a 0% APR balance transfer always worth it?",
      answer: "A 0% offer is valuable if you can clear the balance within the promo window, because every dollar you pay during the promo goes straight to principal. But if you only make minimum payments, the leftover balance plus post-promo interest can cost more than the original debt. Compare the interest saved row against any balance transfer fee to make the call.",
    },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator/finance" }, { label: "0% APR Promotional Period Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">0% APR Promotional Period Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="balance" label="Current Balance" value={balance} onChange={setBalance} prefix="$" error={valErrors.balance} />
              <CompactInput id="payment" label="Monthly Payment" value={payment} onChange={setPayment} prefix="$" error={valErrors.payment} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="promo-months" label="Promo Months" value={promoMonths} onChange={setPromoMonths} suffix="mo" min="1" error={valErrors.promoMonths} />
              <CompactInput id="apr" label="Post-Promo APR" value={apr} onChange={setApr} suffix="%" min="0" error={valErrors.apr} />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calc}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"}`}
              >Calculate</button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {hasErrors && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                ⚠️ Please fix the errors above before calculating.
              </div>
            )}
          </div>

          {/* RIGHT — RESULTS */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Interest Paid</div>
              <div className="text-4xl font-bold text-primary tracking-tight">${fmtMoney(results.totalInterest)}</div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                {results.paidInPromo
                  ? `Paid off in ${results.monthsToPayoff} month${results.monthsToPayoff === 1 ? "" : "s"} — no interest charged.`
                  : `Payoff by ${results.payoffDate}; $${fmtMoney(results.balanceAtPromoEnd)} remains when the promo ends.`}
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Paid in Promo</span>
                <span className={`font-extrabold ${results.paidInPromo ? "text-emerald-600" : "text-red-600"}`}>{results.paidInPromo ? "Yes" : "No"}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Balance at Promo End</span>
                <span className={`font-extrabold ${results.balanceAtPromoEnd > 0 ? "text-orange-600" : "text-emerald-600"}`}>${fmtMoney(results.balanceAtPromoEnd)}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Months to Payoff</span>
                <span className="font-extrabold text-foreground">{results.monthsToPayoff > 0 ? results.monthsToPayoff : "—"}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-right w-[140px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.breakdown.map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${row.isTotal ? "font-bold bg-secondary/30 border-t-2 border-border" : row.highlight ? "bg-amber-500/10" : "hover:bg-secondary/20"}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right ${row.highlight ? "text-amber-700 font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center">
              <h3 className="text-base font-bold mb-2 w-full text-left">Where Your Money Goes</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RechartsPieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" nameKey="name">
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                {chartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                    {d.name} — {d.pct}%
                  </div>
                ))}
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-3 text-foreground">Summary</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {results.summary.map((row, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{row.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a 0% APR Promotional Period Cost Calculator?</h2>
            <p>The 0% APR Promotional Period Cost Calculator estimates whether your monthly payment clears a credit card balance before a 0% introductory rate expires — and, if it does not, exactly how much post-promo interest you will end up paying. Banks advertise 0% periods as free money, but the offer only saves you interest if the balance is gone before the deadline. This calculator removes the guesswork by simulating your payment schedule month by month through the promo and beyond.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>Enter your current balance, planned monthly payment, the length of the 0% window, and the card's standard APR that applies afterward. The tool tracks your balance through the promotional period, then applies monthly interest to whatever remains until the debt is cleared. The results panel shows the balance left at the promo deadline, the interest you would save versus a card with no promo, the payoff date, and a full cost breakdown that reconciles with the summary statistics below.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary number is the total interest you pay under your current plan — zero if you finish inside the promo window. The three-stat bar tells you whether you beat the deadline, what balance carries past it, and how many months total the debt will last. The breakdown table and summary block are built from the same numbers, so the headline figure always matches the detail rows. Try raising the monthly payment until the Balance at Promo End hits zero to find the exact amount that lets you avoid interest entirely.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/0-apr-promotional-period-cost-calculator" />
          <PopularCalculators exclude="/calculator/0-apr-promotional-period-cost-calculator" />
        </div>
      </div>
    </>
  );
}
