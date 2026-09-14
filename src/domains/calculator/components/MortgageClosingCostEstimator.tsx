"use client";
import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  homePrice: number;
  downPaymentPct: number;
  loanAmount: number;
  originationFeePct: number;
  appraisalFee: number;
  titleInsurance: number;
  attorneyFee: number;
  recordingFee: number;
  transferTaxPct: number;
  prepaidInsurance: number;
  prepaidTaxes: number;
}

interface Result {
  totalClosingCosts: number;
  closingCostPct: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; color: string }[];
}

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const fmtD = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calc(inp: Inputs): Result {
  const originationFee = inp.loanAmount * (inp.originationFeePct / 100);
  const transferTax = inp.homePrice * (inp.transferTaxPct / 100);

  const lenderFees = originationFee + inp.appraisalFee;
  const titleFees = inp.titleInsurance;
  const legalFees = inp.attorneyFee + inp.recordingFee;
  const taxFees = transferTax;
  const prepaids = inp.prepaidInsurance + inp.prepaidTaxes;

  const totalClosingCosts = lenderFees + titleFees + legalFees + taxFees + prepaids;
  const closingCostPct = inp.homePrice > 0 ? (totalClosingCosts / inp.homePrice) * 100 : 0;

  const breakdown = [
    { label: "Origination Fee (" + inp.originationFeePct + "%)", value: fmt(originationFee) },
    { label: "Appraisal Fee", value: fmt(inp.appraisalFee) },
    { label: "Lender Fees Subtotal", value: fmt(lenderFees), highlight: true },
    { label: "Title Insurance", value: fmt(inp.titleInsurance) },
    { label: "Attorney Fee", value: fmt(inp.attorneyFee) },
    { label: "Recording Fee", value: fmt(inp.recordingFee) },
    { label: "Transfer Tax (" + inp.transferTaxPct + "%)", value: fmt(transferTax) },
    { label: "Prepaid Insurance", value: fmt(inp.prepaidInsurance) },
    { label: "Prepaid Taxes (escrow)", value: fmt(inp.prepaidTaxes) },
    { label: "Total Closing Costs", value: fmt(totalClosingCosts), highlight: true },
    { label: "As % of Home Price", value: closingCostPct.toFixed(1) + "%", highlight: true },
  ];

  const summaryStats = [
    { label: "Total Closing Costs", value: fmt(totalClosingCosts) },
    { label: "% of Home Price", value: closingCostPct.toFixed(1) + "%" },
    { label: "Lender Fees", value: fmt(lenderFees) },
    { label: "Title & Legal", value: fmt(titleFees + legalFees) },
    { label: "Taxes & Prepaids", value: fmt(taxFees + prepaids) },
    { label: "Home Price", value: fmt(inp.homePrice) },
    { label: "Loan Amount", value: fmt(inp.loanAmount) },
    { label: "Down Payment", value: fmt(inp.homePrice - inp.loanAmount) },
  ];

  const PIE = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const chartData = [
    { name: "Lender Fees", value: Math.round(lenderFees), color: PIE[0] },
    { name: "Title Insurance", value: Math.round(titleFees), color: PIE[1] },
    { name: "Legal & Recording", value: Math.round(legalFees), color: PIE[2] },
    { name: "Taxes", value: Math.round(taxFees), color: PIE[3] },
    { name: "Prepaids", value: Math.round(prepaids), color: PIE[4] },
  ].filter((d) => d.value > 0);

  return { totalClosingCosts, closingCostPct, breakdown, summaryStats, chartData };
}

const DEFAULTS: Inputs = { homePrice: 400000, downPaymentPct: 20, loanAmount: 320000, originationFeePct: 0.5, appraisalFee: 500, titleInsurance: 1500, attorneyFee: 1000, recordingFee: 125, transferTaxPct: 0.5, prepaidInsurance: 1200, prepaidTaxes: 3600 };

export default function MortgageClosingCostEstimator() {
  const [homePrice, setHomePrice] = useState(String(DEFAULTS.homePrice));
  const [downPaymentPct, setDownPaymentPct] = useState(String(DEFAULTS.downPaymentPct));
  const [loanAmount, setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [originationFeePct, setOriginationFeePct] = useState(String(DEFAULTS.originationFeePct));
  const [appraisalFee, setAppraisalFee] = useState(String(DEFAULTS.appraisalFee));
  const [titleInsurance, setTitleInsurance] = useState(String(DEFAULTS.titleInsurance));
  const [attorneyFee, setAttorneyFee] = useState(String(DEFAULTS.attorneyFee));
  const [recordingFee, setRecordingFee] = useState(String(DEFAULTS.recordingFee));
  const [transferTaxPct, setTransferTaxPct] = useState(String(DEFAULTS.transferTaxPct));
  const [prepaidInsurance, setPrepaidInsurance] = useState(String(DEFAULTS.prepaidInsurance));
  const [prepaidTaxes, setPrepaidTaxes] = useState(String(DEFAULTS.prepaidTaxes));
  const [result, setResult] = useState<Result | null>(null);
  const [showAdv, setShowAdv] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const g = (): Inputs => ({
    homePrice: parseFloat(homePrice) || 0,
    downPaymentPct: parseFloat(downPaymentPct) || 0,
    loanAmount: parseFloat(loanAmount) || 0,
    originationFeePct: parseFloat(originationFeePct) || 0,
    appraisalFee: parseFloat(appraisalFee) || 0,
    titleInsurance: parseFloat(titleInsurance) || 0,
    attorneyFee: parseFloat(attorneyFee) || 0,
    recordingFee: parseFloat(recordingFee) || 0,
    transferTaxPct: parseFloat(transferTaxPct) || 0,
    prepaidInsurance: parseFloat(prepaidInsurance) || 0,
    prepaidTaxes: parseFloat(prepaidTaxes) || 0,
  });

  const calc_ = () => setResult(calc(g()));
  const reset = () => {
    Object.entries(DEFAULTS).forEach(([k, v]) => {
      const setter = { homePrice: setHomePrice, downPaymentPct: setDownPaymentPct, loanAmount: setLoanAmount, originationFeePct: setOriginationFeePct, appraisalFee: setAppraisalFee, titleInsurance: setTitleInsurance, attorneyFee: setAttorneyFee, recordingFee: setRecordingFee, transferTaxPct: setTransferTaxPct, prepaidInsurance: setPrepaidInsurance, prepaidTaxes: setPrepaidTaxes }[k];
      if (setter) setter(String(v));
    });
    setResult(calc(DEFAULTS));
  };

  useEffect(() => { setResult(calc(DEFAULTS)); }, []);

  const v = (s: string) => parseFloat(s) || 0;
  const hasErrors = v(homePrice) <= 0;

  const i = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const c = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (<>
    <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Mortgage Closing Cost Estimator" }]} />
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Closing Cost Estimator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Home Price ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Down Payment (%)</label><div className={i}><input type="number" value={downPaymentPct} onChange={e => setDownPaymentPct(e.target.value)} step="1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className={c} /></div></div>
            <div><label className="text-sm font-medium mb-1 block">Origination Fee (%)</label><div className={i}><input type="number" value={originationFeePct} onChange={e => setOriginationFeePct(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>

          <div>
            <button type="button" onClick={() => setShowAdv(!showAdv)} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none">
              Advanced Options <span className={`text-xs transition-transform ${showAdv ? "rotate-180" : ""}`}>▼</span>
            </button>
            {showAdv && (
              <div className="mt-3 flex flex-col gap-3 border border-border rounded-lg p-3 bg-secondary/20">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Third-Party Fees</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1 block">Appraisal Fee</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={appraisalFee} onChange={e => setAppraisalFee(e.target.value)} className={c} /></div></div>
                  <div><label className="text-sm font-medium mb-1 block">Title Insurance</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={titleInsurance} onChange={e => setTitleInsurance(e.target.value)} className={c} /></div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1 block">Attorney Fee</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={attorneyFee} onChange={e => setAttorneyFee(e.target.value)} className={c} /></div></div>
                  <div><label className="text-sm font-medium mb-1 block">Recording Fee</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={recordingFee} onChange={e => setRecordingFee(e.target.value)} className={c} /></div></div>
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold mt-2">Taxes & Prepaids</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1 block">Transfer Tax (%)</label><div className={i}><input type="number" value={transferTaxPct} onChange={e => setTransferTaxPct(e.target.value)} step="0.1" className={c} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
                  <div><label className="text-sm font-medium mb-1 block">Prepaid Insurance ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={prepaidInsurance} onChange={e => setPrepaidInsurance(e.target.value)} className={c} /></div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1 block">Prepaid Taxes ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={prepaidTaxes} onChange={e => setPrepaidTaxes(e.target.value)} className={c} /></div></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-1">
            <button onClick={calc_} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>Calculate</button>
            <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start" ref={printRef}>
          {result && (<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3"><button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"><Printer className="h-3.5 w-3.5" /> Print</button></div>
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Closing Costs</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${fmt(result.totalClosingCosts)}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.closingCostPct.toFixed(1)}% of home price · Home: ${fmt(v(homePrice))}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Total", fmt(result.totalClosingCosts)], ["% of Price", result.closingCostPct.toFixed(1) + "%"], ["Lender Fees", fmt(result.chartData.find(d => d.name === "Lender Fees")?.value || 0)]].map(([l, v], idx) => (<div key={idx} className={`p-4 text-center ${idx > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border bg-card">
              <div className="shrink-0"><div className="w-[160px] h-[160px] relative"><ResponsiveContainer width="100%" height="100%"><RPie><Pie data={result.chartData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={2} dataKey="value">{result.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip formatter={(v: number) => ["$" + v.toLocaleString(), ""]} /></RPie></ResponsiveContainer></div></div>
              <div className="flex-1 flex flex-col gap-2"><h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Cost Split</h4>{result.chartData.map(item => (<div key={item.name} className="flex items-center justify-between text-[13px]"><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} /><span className="font-semibold text-muted-foreground">{item.name}</span></div><span className="font-bold text-foreground">${item.value.toLocaleString()}</span></div>))}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Full Breakdown</h3>
              <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}><td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td></tr>))}</tbody></table>
            </div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8">
        <section className="prose-finance text-[15.75px]">
          <h2 className="text-2xl font-bold mb-3">Understanding Closing Costs</h2>
          <p>Closing costs are fees charged when you finalize your mortgage, typically ranging from 2-5% of the home price. They include lender fees (origination, appraisal), third-party fees (title, attorney), government fees (recording, transfer tax), and prepaids (insurance, taxes). Some costs are negotiable — always ask your lender for a Loan Estimate to compare.</p>
        </section>
        <PopularCalculators exclude="/calculator/mortgage-closing-cost-estimator" />
      </div>
    </div>
  </>);
}
