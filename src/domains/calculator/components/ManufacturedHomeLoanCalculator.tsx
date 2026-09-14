"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Inputs {
  homePrice: number;
  downPct: number;
  interestRate: number;
  termYears: number;
  lotRent: number;
  annualInsurance: number;
}

interface Result {
  downPayment: number;
  loanAmount: number;
  monthlyPayment: number;
  monthlyInsurance: number;
  totalHousingCost: number;
  totalInterest: number;
  totalPayment: number;
  pieData: { name: string; value: number; color: string; pct: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

const COLORS = ["#2563eb", "#f59e0b"];

function calc(inp: Inputs): Result {
  const downPayment = inp.homePrice * (inp.downPct / 100);
  const loanAmount = Math.max(0, inp.homePrice - downPayment);
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const monthlyPayment = r > 0 && loanAmount > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmount > 0 ? loanAmount / n : 0;
  const totalPayment = monthlyPayment * n;
  const totalInterest = Math.max(0, totalPayment - loanAmount);
  const monthlyInsurance = inp.annualInsurance / 12;
  const totalHousingCost = monthlyPayment + inp.lotRent + monthlyInsurance;

  // Donut: split of every dollar of total payment into principal vs interest.
  const totalPaid = Math.max(1, totalPayment);
  const principalShare = Math.round((loanAmount / totalPaid) * 1000) / 10;
  const interestShare = Math.round((totalInterest / totalPaid) * 1000) / 10;
  const diff = Math.round((100 - principalShare - interestShare) * 10) / 10;
  const pieData = [
    { name: "Principal", value: Math.round(loanAmount), color: COLORS[0], pct: principalShare + diff },
    { name: "Interest", value: Math.round(totalInterest), color: COLORS[1], pct: interestShare },
  ].filter((d) => d.value > 0);

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Manufactured Home Price", value: fmt(inp.homePrice) },
    { label: "Down Payment (" + inp.downPct + "%)", value: fmt(downPayment) },
    { label: "Loan Amount", value: fmt(loanAmount), highlight: true },
    { label: "Interest Rate", value: inp.interestRate + "% APR" },
    { label: "Loan Term", value: inp.termYears + " years" },
    { label: "Monthly Payment (P&I)", value: fmtD(monthlyPayment), highlight: true },
    { label: "Lot Rent", value: inp.lotRent > 0 ? fmtD(inp.lotRent) + "/mo" : "None (owned land)" },
    { label: "Insurance", value: fmtD(monthlyInsurance) + "/mo" },
    { label: "Total Monthly Housing Cost", value: fmtD(totalHousingCost), isTotal: true },
    { label: "Total Interest Paid", value: fmt(totalInterest), highlight: true },
    { label: "Total Paid Over Term", value: fmt(totalPayment), isTotal: true },
  ];

  const summaryStats = [
    { label: "Monthly Payment (P&I)", value: fmtD(monthlyPayment) },
    { label: "Total Housing Cost", value: fmtD(totalHousingCost) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Paid", value: fmt(totalPayment) },
    { label: "Loan Amount", value: fmt(loanAmount) },
    { label: "Lot Rent", value: fmtD(inp.lotRent) + "/mo" },
    { label: "Insurance", value: fmtD(monthlyInsurance) + "/mo" },
    { label: "Down Payment", value: fmt(downPayment) },
  ];

  return { downPayment, loanAmount, monthlyPayment, monthlyInsurance, totalHousingCost, totalInterest, totalPayment, pieData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { homePrice: 120000, downPct: 10, interestRate: 8.5, termYears: 20, lotRent: 450, annualInsurance: 1200 };

export default function ManufacturedHomeLoanCalculator() {
  const [homePrice, setHomePrice] = useState(String(DEFAULTS.homePrice));
  const [downPct, setDownPct] = useState(String(DEFAULTS.downPct));
  const [interestRate, setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [lotRent, setLotRent] = useState(String(DEFAULTS.lotRent));
  const [annualInsurance, setAnnualInsurance] = useState(String(DEFAULTS.annualInsurance));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    homePrice: parseFloat(homePrice) || 0,
    downPct: parseFloat(downPct) || 0,
    interestRate: parseFloat(interestRate) || 0,
    termYears: parseInt(termYears) || 1,
    lotRent: parseFloat(lotRent) || 0,
    annualInsurance: parseFloat(annualInsurance) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setHomePrice(String(DEFAULTS.homePrice));
    setDownPct(String(DEFAULTS.downPct));
    setInterestRate(String(DEFAULTS.interestRate));
    setTermYears(String(DEFAULTS.termYears));
    setLotRent(String(DEFAULTS.lotRent));
    setAnnualInsurance(String(DEFAULTS.annualInsurance));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const price = parseFloat(homePrice) || 0;
  const dp = parseFloat(downPct) || 0;
  const rate = parseFloat(interestRate) || 0;
  const term = parseInt(termYears) || 0;
  const rent = parseFloat(lotRent) || 0;
  const ins = parseFloat(annualInsurance) || 0;

  const valErrors: Record<string, string> = {};
  if (!homePrice || price <= 0) valErrors.homePrice = "Home Price must be greater than $0";
  if (dp < 0 || dp >= 100) valErrors.downPct = "Down payment must be 0%–99%";
  if (!interestRate || rate <= 0) valErrors.interestRate = "Interest Rate must be greater than 0%";
  else if (rate > 25) valErrors.interestRate = "Interest Rate must be 25% or less";
  if (!termYears || term <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (term > 40) valErrors.termYears = "Term must be 40 years or less";
  if (rent < 0) valErrors.lotRent = "Lot rent must be $0 or more";
  if (ins < 0) valErrors.annualInsurance = "Insurance must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Manufactured Home Loan Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Manufactured Home Loan Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Home Price ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} className={c} /></div>{valErrors.homePrice && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.homePrice}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Down Payment (%)</label><div className={i}><input type="number" value={downPct} onChange={e => setDownPct(e.target.value)} step="1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.downPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.downPct}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.interestRate && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.interestRate}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term (Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
          </div>
          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
            {showAdv && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Property &amp; Housing</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium mb-1 block">Lot Rent ($/mo)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={lotRent} onChange={e => setLotRent(e.target.value)} className={c} /></div>{valErrors.lotRent && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.lotRent}</p>}</div>
                    <div><label className="text-sm font-medium mb-1 block">Annual Insurance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={annualInsurance} onChange={e => setAnnualInsurance(e.target.value)} className={c} /></div>{valErrors.annualInsurance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.annualInsurance}</p>}</div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">Enter $0 for lot rent when the home sits on land you own. Homes on leased land are typically financed as chattel (personal property) at higher rates and shorter terms than real-property loans.</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-1">
            <button type="button" disabled={hasErrors} onClick={calc_} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
            <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
          </div>
          {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Monthly Payment (P&I)</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.monthlyPayment.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Loan of {result.loanAmount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} for {termYears} years at {interestRate}%</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Monthly Housing Cost", "$" + Math.round(result.totalHousingCost).toLocaleString("en-US"), "text-primary"],
                ["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString("en-US"), "text-red-500"],
                ["Total Paid Over Term", "$" + Math.round(result.totalPayment).toLocaleString("en-US"), "text-amber-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Where Your Payments Go</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RPie>
                  <Pie data={result.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ pct }: { pct?: number }) => (pct !== undefined ? pct.toFixed(1) + "%" : "")}>
                    {result.pieData.map((d, idx) => <Cell key={idx} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [name === "Principal" ? "Principal Paid" : "Interest Paid", "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RPie>
              </ResponsiveContainer>
              <p className="text-[11px] text-muted-foreground mt-2 text-center">Split of the total amount repaid over the full {termYears}-year term. Percentages sum to 100%.</p>
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
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between gap-2"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                ))}
              </div>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">Financing a Manufactured Home</h2>
          <p>Manufactured homes can be financed two ways. When the home is affixed to land you own, it can qualify for a conventional real-property mortgage with terms up to 30 years. When it sits on leased land (a chattel loan) or the loan is FHA Title I, expect higher rates and shorter terms. Always include the full monthly housing picture — loan payment, lot rent, and insurance — when deciding what you can afford, because lot rent can rival the mortgage payment itself.</p>
        </section>
        <FAQSection faqs={[
          { question: "What is a chattel loan?", answer: "A chattel loan finances the manufactured home as personal property rather than real estate. It is the typical route when the home sits on leased land. Chattel loans carry higher rates and shorter terms than real-property mortgages." },
          { question: "Can I get a conventional mortgage for a manufactured home?", answer: "Yes, if the home is permanently affixed to land you own and meets HUD and lender requirements (foundation, title, and size rules). FHA, VA, and USDA also insure manufactured home loans under specific conditions." },
          { question: "What should my monthly housing budget include?", answer: "Beyond principal and interest, count lot rent (if the land is leased), homeowners and sometimes flood insurance, property taxes, and utilities. This calculator adds lot rent and insurance so the monthly housing cost is realistic." },
        ]} pageUrl="https://racira.com/calculator/manufactured-home-loan-calculator" />
        <PopularCalculators exclude="/calculator/manufactured-home-loan-calculator" />
      </div>
    </div>
  </>);
}
