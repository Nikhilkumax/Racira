"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Inputs {
  homePrice: number;
  downPct: number;
  apr: number;
  termYears: number;
  lotRent: number;
  annualInsurance: number;
}

interface Result {
  downPayment: number;
  amountFinanced: number;
  monthlyPi: number;
  totalInterest: number;
  totalCost: number;
  monthlyLotRent: number;
  monthlyInsurance: number;
  monthlyHousing: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

function calc(inp: Inputs): Result {
  const downPayment = (inp.homePrice * inp.downPct) / 100;
  const amountFinanced = inp.homePrice - downPayment;
  const r = inp.apr / 100 / 12;
  const n = inp.termYears * 12;
  const monthlyPi = (amountFinanced * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalInterest = monthlyPi * n - amountFinanced;
  const totalCost = downPayment + amountFinanced + totalInterest;

  const monthlyInsurance = inp.annualInsurance / 12;
  const monthlyHousing = monthlyPi + inp.lotRent + monthlyInsurance;

  const chartData = [
    { name: "Principal", value: Math.round(amountFinanced) },
    { name: "Interest", value: Math.round(totalInterest) },
  ];

  const fmt = (x: number) => "$" + Math.round(x).toLocaleString("en-US");
  const fmtD = (x: number) => "$" + x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdown = [
    { label: "Mobile Home Price", value: fmt(inp.homePrice) },
    { label: "Down Payment (" + inp.downPct + "%)", value: fmt(downPayment) },
    { label: "Amount Financed", value: fmt(amountFinanced) },
    { label: "APR", value: inp.apr + "%" },
    { label: "Loan Term", value: inp.termYears + " years" },
    { label: "Monthly Payment (P&I)", value: fmtD(monthlyPi), highlight: true },
    { label: "Lot Rent / Land Lease", value: fmtD(inp.lotRent) + "/mo" },
    { label: "Property Insurance", value: fmtD(monthlyInsurance) + "/mo" },
    { label: "Total Monthly Housing", value: fmtD(monthlyHousing), isTotal: true, highlight: true },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost of Home", value: fmt(totalCost), isTotal: true },
  ];

  const summaryStats = [
    { label: "Amount Financed", value: fmt(amountFinanced) },
    { label: "Monthly Payment (P&I)", value: fmtD(monthlyPi) },
    { label: "Lot Rent / Land Lease", value: fmtD(inp.lotRent) + "/mo" },
    { label: "Property Insurance", value: fmtD(monthlyInsurance) + "/mo" },
    { label: "Total Monthly Housing", value: fmtD(monthlyHousing) },
    { label: "Total Interest", value: fmt(totalInterest) },
    { label: "Total Cost of Home", value: fmt(totalCost) },
  ];

  return { downPayment, amountFinanced, monthlyPi, totalInterest, totalCost, monthlyLotRent: inp.lotRent, monthlyInsurance, monthlyHousing, chartData, breakdown, summaryStats };
}

const DEFAULTS: Inputs = { homePrice: 75000, downPct: 10, apr: 8.5, termYears: 20, lotRent: 350, annualInsurance: 900 };

const COLORS = ["#2563eb", "#f59e0b"];

export default function MobileHomeLoanCalculator() {
  const [homePrice, setHomePrice] = useState(String(DEFAULTS.homePrice));
  const [downPct, setDownPct] = useState(String(DEFAULTS.downPct));
  const [apr, setApr] = useState(String(DEFAULTS.apr));
  const [termYears, setTermYears] = useState(String(DEFAULTS.termYears));
  const [lotRent, setLotRent] = useState(String(DEFAULTS.lotRent));
  const [annualInsurance, setAnnualInsurance] = useState(String(DEFAULTS.annualInsurance));
  const [showAdv, setShowAdv] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const g = (): Inputs => ({
    homePrice: parseFloat(homePrice) || 0,
    downPct: parseFloat(downPct) || 0,
    apr: parseFloat(apr) || 0,
    termYears: parseInt(termYears) || 0,
    lotRent: parseFloat(lotRent) || 0,
    annualInsurance: parseFloat(annualInsurance) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    setHomePrice(String(DEFAULTS.homePrice));
    setDownPct(String(DEFAULTS.downPct));
    setApr(String(DEFAULTS.apr));
    setTermYears(String(DEFAULTS.termYears));
    setLotRent(String(DEFAULTS.lotRent));
    setAnnualInsurance(String(DEFAULTS.annualInsurance));
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const price = parseFloat(homePrice) || 0;
  const down = parseFloat(downPct) || 0;
  const rate = parseFloat(apr) || 0;
  const term = parseInt(termYears) || 0;
  const rent = parseFloat(lotRent) || 0;
  const ins = parseFloat(annualInsurance) || 0;

  const valErrors: Record<string, string> = {};
  if (!homePrice || price <= 0) valErrors.homePrice = "Home price must be greater than $0";
  if (down < 0 || down >= 100) valErrors.downPct = "Down payment must be 0–99%";
  if (!apr || rate <= 0) valErrors.apr = "APR must be greater than 0%";
  else if (rate > 25) valErrors.apr = "APR must be 25% or less";
  if (!termYears || term <= 0) valErrors.termYears = "Term must be greater than 0 years";
  else if (term > 30) valErrors.termYears = "Term must be 30 years or less";
  if (rent < 0) valErrors.lotRent = "Lot rent must be $0 or more";
  if (ins < 0) valErrors.annualInsurance = "Insurance must be $0 or more";
  const hasErrors = Object.keys(valErrors).length > 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Mobile Home Loan Calculator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mobile Home Loan Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">Mobile Home Price ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} className={c} /></div>{valErrors.homePrice && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.homePrice}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Down Payment (%)</label><div className={i}><input type="number" value={downPct} onChange={e => setDownPct(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.downPct && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.downPct}</p>}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium mb-1 block">APR (%)</label><div className={i}><input type="number" value={apr} onChange={e => setApr(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>{valErrors.apr && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.apr}</p>}</div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term (Years)</label><div className={i}><input type="number" value={termYears} onChange={e => setTermYears(e.target.value)} className={c} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>{valErrors.termYears && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.termYears}</p>}</div>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline self-start mt-1">
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdv ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showAdv && (
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Land & Insurance</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium mb-1 block">Lot Rent / Land Lease ($/mo)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={lotRent} onChange={e => setLotRent(e.target.value)} className={c} /></div>{valErrors.lotRent && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.lotRent}</p>}</div>
                  <div><label className="text-sm font-medium mb-1 block">Annual Insurance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={annualInsurance} onChange={e => setAnnualInsurance(e.target.value)} className={c} /></div>{valErrors.annualInsurance && <p className="text-[11px] text-red-500 font-medium mt-1">{valErrors.annualInsurance}</p>}</div>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-1">
            <button type="button" disabled={hasErrors} onClick={calc_} className={`flex-1 flex items-center justify-center gap-2 rounded-md h-10 text-base font-bold transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground"}`}>Calculate</button>
            <button type="button" onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
          </div>
          {hasErrors && <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2 rounded-md">Please fix the highlighted inputs before calculating.</p>}
        </div>
        <div className="flex flex-col gap-4">
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment (P&I)</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.monthlyPi.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</div>
              <div className="text-sm text-muted-foreground mt-1">Plus {result.monthlyLotRent.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo lot rent and {result.monthlyInsurance.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo insurance — {result.monthlyHousing.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}/mo all-in</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Amount Financed", "$" + Math.round(result.amountFinanced).toLocaleString("en-US"), "text-primary"],
                ["Total Interest", "$" + Math.round(result.totalInterest).toLocaleString("en-US"), "text-amber-600"],
                ["All-In Housing", result.monthlyHousing.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + "/mo", "text-emerald-600"],
              ].map(([l, v, color], idx) => (
                <div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className={`text-base font-bold ${color}`}>{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Principal vs Interest Over the Loan</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {result.chartData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [name, "$" + Math.round(v).toLocaleString("en-US")]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
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
                  <div key={idx} className="flex justify-between gap-2"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold text-right">{s.value}</span></div>
                ))}
              </div>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">The Real Cost of a Mobile Home</h2>
          <p>A mobile or manufactured home is often the cheapest path to homeownership — but the financing math is different from a stick-built house. If the home sits on leased land, the loan is usually chattel (personal property) rather than a real-estate mortgage, which pushes rates several points higher and caps terms around 20 years. If you own the land and the home is permanently affixed, you may qualify for conventional or FHA financing at rates close to a standard mortgage. Either way, the monthly number that matters is the all-in figure: principal and interest plus lot rent or land taxes plus insurance. A $75,000 home with 10% down at 8.5% for 20 years costs roughly $590 a month before lot rent — and the lot rent is often the bigger variable, so check it carefully before you fall in love with the home.</p>
        </section>
        <FAQSection faqs={[
          { question: "What is a chattel loan for a mobile home?", answer: "A personal-property loan used when the home isn't attached to land you own. Chattel loans carry higher rates and shorter terms (often 15–20 years) than real-estate mortgages, because the lender's collateral is the home itself, which depreciates." },
          { question: "Can I finance a mobile home like a regular mortgage?", answer: "Yes, if you own the land and the home is permanently affixed to a foundation. FHA Title II and conventional programs then treat it as real property, unlocking 30-year terms and rates close to standard mortgages — usually far cheaper than chattel financing." },
          { question: "Should lot rent be part of my budget?", answer: "Absolutely — it's often $300–$700 a month and can rise every year. This calculator's all-in housing figure adds lot rent and insurance to your payment so you're comparing your true monthly cost, not just the loan." },
        ]} pageUrl="https://racira.com/calculator/mobile-home-loan-calculator" />
        <PopularCalculators exclude="/calculator/mobile-home-loan-calculator" />
      </div>
    </div>
  </>);
}