"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  invoiceValue: string;
  advanceRate: string;
  feePct: string;
  days: string;
  wireFee: string;
  setupFee: string;
}

interface Result {
  advance: number;
  reserve: number;
  factoringFee: number;
  totalCost: number;
  netProceeds: number;
  effectiveApr: number;
}

const DEFAULTS: Inputs = {
  invoiceValue: "50000",
  advanceRate: "85",
  feePct: "1.5",
  days: "45",
  wireFee: "25",
  setupFee: "15",
};

function calculate(inputs: Inputs): Result {
  const invoiceValue = Math.max(0, parseFloat(inputs.invoiceValue) || 0);
  const advanceRate = Math.min(100, Math.max(0, parseFloat(inputs.advanceRate) || 0));
  const feePct = Math.max(0, parseFloat(inputs.feePct) || 0);
  const days = Math.max(0, parseFloat(inputs.days) || 0);
  const wireFee = Math.max(0, parseFloat(inputs.wireFee) || 0);
  const setupFee = Math.max(0, parseFloat(inputs.setupFee) || 0);

  const advance = (invoiceValue * advanceRate) / 100;
  const reserve = invoiceValue - advance;
  const factoringFee = invoiceValue * (feePct / 100) * (days / 30);
  const totalCost = factoringFee + wireFee + setupFee;
  const netProceeds = advance - totalCost;
  const effectiveApr = advance > 0 && days > 0 ? (totalCost / advance) * (365 / days) * 100 : 0;

  return { advance, reserve, factoringFee, totalCost, netProceeds, effectiveApr };
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

export default function FactoringCostCalculator() {
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
    num(inputs.invoiceValue) <= 0 ||
    num(inputs.advanceRate) < 0 || num(inputs.advanceRate) > 100 ||
    num(inputs.feePct) < 0 ||
    num(inputs.days) <= 0 ||
    num(inputs.wireFee) < 0 ||
    num(inputs.setupFee) < 0;

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
    { label: "Invoice Value", value: fmtMoney(num(inputs.invoiceValue)) },
    { label: `Advance Received (${fmt(num(inputs.advanceRate), 1)}%)`, value: fmtMoney(result.advance) },
    { label: "Reserve Held Until Payment", value: fmtMoney(result.reserve) },
    { label: `Factoring Fee (${fmt(num(inputs.feePct), 1)}% × ${fmt(num(inputs.days))} days)`, value: fmtMoney(result.factoringFee) },
    { label: "Wire Transfer Fee", value: fmtMoney(num(inputs.wireFee)) },
    { label: "Invoice Setup Fee", value: fmtMoney(num(inputs.setupFee)) },
    { label: "Total Factoring Cost", value: fmtMoney(result.totalCost), total: true },
    { label: "Net Proceeds to Business", value: fmtMoney(result.netProceeds), highlight: true },
    { label: "Effective APR", value: result.effectiveApr.toFixed(1) + "%" },
  ];

  const summaryStats = [
    { label: "Invoice Value", value: fmtMoney(num(inputs.invoiceValue)) },
    { label: "Advance Rate", value: fmt(num(inputs.advanceRate), 1) + "%" },
    { label: "Advance Received", value: fmtMoney(result.advance) },
    { label: "Reserve Held", value: fmtMoney(result.reserve) },
    { label: "Factoring Fee", value: fmtMoney(result.factoringFee) },
    { label: "Wire + Setup Fees", value: fmtMoney(num(inputs.wireFee) + num(inputs.setupFee)) },
    { label: "Total Factoring Cost", value: fmtMoney(result.totalCost) },
    { label: "Net Proceeds", value: fmtMoney(result.netProceeds), bold: true },
    { label: "Effective APR", value: result.effectiveApr.toFixed(1) + "%" },
    { label: "Days to Payment", value: fmt(num(inputs.days)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Factoring Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Factoring Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="factoring-invoice" label="Invoice Value" value={inputs.invoiceValue} onChange={set("invoiceValue")} prefix="$" />
              <NumInput id="factoring-advance" label="Advance Rate" value={inputs.advanceRate} onChange={set("advanceRate")} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="factoring-fee" label="Factoring Fee (per 30 days)" value={inputs.feePct} onChange={set("feePct")} suffix="%" />
              <NumInput id="factoring-days" label="Average Payment Time" value={inputs.days} onChange={set("days")} suffix="days" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Additional Fees</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="factoring-wire" label="Wire Transfer Fee" value={inputs.wireFee} onChange={set("wireFee")} prefix="$" />
                    <NumInput id="factoring-setup" label="Invoice Setup Fee" value={inputs.setupFee} onChange={set("setupFee")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Invoice value and payment time must be greater than zero; advance rate must be between 0 and 100; all fees must be non-negative.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Factoring Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">On a {fmtMoney(num(inputs.invoiceValue))} invoice funded at {fmt(num(inputs.advanceRate), 1)}% for {fmt(num(inputs.days))} days</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Advance Received</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.advance)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Factoring Cost</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.totalCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective APR</span>
                <span className="font-extrabold text-amber-600">{result.effectiveApr.toFixed(1)}%</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Factoring Deal Breakdown</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[160px]">Amount</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Factoring Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A factoring cost calculator works out exactly what it costs a business to sell its unpaid invoices to a factoring company in exchange for immediate cash. Invoice factoring is a financing arrangement where a business sells its accounts receivable at a discount to a third party, called a factor, which advances most of the invoice value within a day or two rather than waiting the thirty, sixty, or ninety days that customers typically take to pay. The factor then collects payment from the customer directly and releases the remaining reserve, minus its fees, once the invoice is settled. Because the total cost depends on the invoice amount, the advance rate, the fee the factor charges, and how long the customer actually takes to pay, the true cost of the arrangement is rarely obvious at a glance. This calculator turns those variables into concrete numbers, including the total dollar cost, the net cash the business keeps, and an effective annual percentage rate that makes the deal directly comparable to other forms of business financing.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculation begins with the invoice value, the full amount the customer owes. The advance rate is the percentage of that value the factor pays up front, typically 80% to 95%, and the advance received is the invoice value multiplied by the advance rate. The portion not advanced, called the reserve, is held by the factor as protection against disputes or non-payment and is remitted to the business once the customer pays in full. The factoring fee is quoted as a percentage of the invoice value per thirty-day period, so the fee for any particular invoice is the invoice value times the fee percentage times the number of thirty-day periods the money is outstanding. A customer that pays in forty-five days therefore incurs one and a half periods of fee, which is why faster-paying customers dramatically reduce the cost of the arrangement. The total factoring cost adds any flat fees, such as wire transfer and invoice setup charges, to the prorated factoring fee, and the net proceeds are the advance minus that total cost.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The effective APR is the most important number for comparing factoring against a line of credit or term loan. It annualizes the total cost of the deal by dividing it by the advance received and scaling it up to a full year based on the number of days the invoice was outstanding. A factoring fee that looks small in isolation often translates into an effective APR in the high teens or twenties, simply because the money is only outstanding for a few weeks at a time. The Advanced Options section adds the wire transfer fee and the per-invoice setup fee that many factors charge, so the total reflects the real out-of-pocket cost rather than just the headline discount rate. Enter your own terms, press Calculate, and every result updates together, from the reserve held to the net proceeds deposited into your account.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total factoring cost, the full dollar amount the arrangement takes out of your cash flow for the invoice being funded. The advance received shows the immediate cash injection, and the net proceeds reveal what actually lands in your account once every fee is deducted. The effective APR is the figure to compare against other financing options, because it expresses the factoring cost on the same annualized basis as a bank loan; if the effective APR is materially higher than what a working capital line of credit would cost, factoring is only worth it when the speed of funding or the lack of collateral requirements justifies the premium. For businesses that factor regularly, the cost per invoice compounds quickly, so it pays to negotiate both the fee percentage and the payment terms your customers operate under. Use the calculator to model how shortening your customers' payment cycle by even ten days reduces the effective APR, and you will see exactly why receivable collection discipline is the cheapest financing strategy available.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/factoring-cost-calculator" />
        </div>
      </div>
    </>
  );
}