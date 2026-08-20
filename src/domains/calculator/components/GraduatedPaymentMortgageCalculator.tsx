"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs { loanAmount: number; initialRate: number; annualIncrease: number; adjustEvery: number; term: number; maxRate: number; }
interface Result { initialPayment: number; finalPayment: number; totalInterest: number; totalCost: number; schedule: {year:number;payment:number;interest:number;principal:number;balance:number}[]; breakdown: {label:string;value:string;highlight?:boolean}[]; summaryStats: {label:string;value:string}[]; chartData: {year:number;payment:number;balance:number}[]; }

function calc(inp: Inputs): Result {
  const n = inp.term * 12;
  let balance = inp.loanAmount;
  let currentRate = inp.initialRate;
  let totalInterest = 0;
  const r0 = inp.initialRate / 100 / 12;
  const initialPayment = r0 > 0 ? (inp.loanAmount * r0 * Math.pow(1+r0,n)) / (Math.pow(1+r0,n)-1) : inp.loanAmount/n;
  let monthlyPayment = initialPayment;
  let finalPayment = initialPayment;
  const schedule: Result["schedule"] = [];
  const chartData: Result["chartData"] = [];
  const years = inp.term;
  const adjustsPerYear = Math.max(1, Math.round(12 / inp.adjustEvery));

  for (let yr = 1; yr <= years; yr++) {
    let yearInterest = 0; let yearPrincipal = 0;
    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      if (yr > 1 && m === 0 && (yr - 1) % Math.max(1, Math.round(inp.adjustEvery / 12)) === 0) {
        currentRate = Math.min(currentRate + inp.annualIncrease, inp.maxRate);
        const rm = currentRate / 100 / 12;
        const remaining = n - ((yr-1)*12 + m);
        monthlyPayment = rm > 0 && remaining > 0 ? (balance * rm * Math.pow(1+rm,remaining)) / (Math.pow(1+rm,remaining)-1) : balance / remaining;
      }
      const intPart = balance * (currentRate / 100 / 12);
      const prinPart = Math.min(monthlyPayment - intPart, balance);
      yearInterest += intPart; yearPrincipal += prinPart;
      totalInterest += intPart; balance -= prinPart;
    }
    finalPayment = monthlyPayment;
    schedule.push({year:yr, payment:Math.round(monthlyPayment), interest:Math.round(yearInterest), principal:Math.round(yearPrincipal), balance:Math.max(0,Math.round(balance))});
    chartData.push({year:yr, payment:Math.round(monthlyPayment), balance:Math.max(0,Math.round(balance))});
  }

  const totalCost = inp.loanAmount + totalInterest;
  const fmt = (x:number) => '$'+Math.round(x).toLocaleString('en-US');
  const fmtD = (x:number) => x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const breakdown = [
    {label:'Loan Amount',value:fmt(inp.loanAmount)}, {label:'Initial Rate',value:inp.initialRate+'%'},
    {label:'Annual Rate Increase',value:inp.annualIncrease+'%'}, {label:'Max Rate Cap',value:inp.maxRate+'%'},
    {label:'Initial Monthly Payment',value:'$'+fmtD(initialPayment),highlight:true},
    {label:'Final Monthly Payment',value:'$'+fmtD(finalPayment),highlight:true},
    {label:'Payment Increase',value:fmtD(finalPayment-initialPayment)+'/mo ('+((finalPayment/initialPayment-1)*100).toFixed(0)+'%)'},
    {label:'Total Interest',value:fmt(totalInterest)}, {label:'Total Cost',value:fmt(totalCost),highlight:true},
  ];
  const summaryStats = [
    {label:'Initial Payment',value:'$'+fmtD(initialPayment)+'/mo'},{label:'Final Payment',value:'$'+fmtD(finalPayment)+'/mo'},
    {label:'Payment Increase',value:((finalPayment/initialPayment-1)*100).toFixed(0)+'%'},{label:'Total Interest',value:fmt(totalInterest)},
    {label:'Total Cost',value:fmt(totalCost)},{label:'Final Rate',value:Math.min(currentRate,inp.maxRate).toFixed(2)+'%'},
    {label:'Term',value:inp.term+' years'},{label:'Cost per $1000',value:'$'+fmtD(totalCost/inp.loanAmount*1000)},
  ];
  return {initialPayment,finalPayment,totalInterest,totalCost,schedule,breakdown,summaryStats,chartData};
}

const DEFAULTS: Inputs = {loanAmount:300000,initialRate:4.0,annualIncrease:0.5,adjustEvery:12,term:30,maxRate:7.5};

export default function GraduatedPaymentMortgageCalculator() {
  const [loanAmount,setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [initialRate,setInitialRate] = useState(String(DEFAULTS.initialRate));
  const [annualIncrease,setAnnualIncrease] = useState(String(DEFAULTS.annualIncrease));
  const [adjustEvery,setAdjustEvery] = useState(String(DEFAULTS.adjustEvery));
  const [term,setTerm] = useState(String(DEFAULTS.term));
  const [maxRate,setMaxRate] = useState(String(DEFAULTS.maxRate));
  const [result,setResult] = useState<Result|null>(null);
  const g = ():Inputs => ({loanAmount:parseFloat(loanAmount)||0,initialRate:parseFloat(initialRate)||0,annualIncrease:parseFloat(annualIncrease)||0,adjustEvery:parseInt(adjustEvery)||12,term:parseInt(term)||30,maxRate:parseFloat(maxRate)||10});
  const calc_ = () => setResult(calc(g()));
  const reset = () => {setLoanAmount(String(DEFAULTS.loanAmount));setInitialRate(String(DEFAULTS.initialRate));setAnnualIncrease(String(DEFAULTS.annualIncrease));setAdjustEvery(String(DEFAULTS.adjustEvery));setTerm(String(DEFAULTS.term));setMaxRate(String(DEFAULTS.maxRate));setResult(calc(DEFAULTS));};
  useEffect(()=>{setResult(calc(DEFAULTS));},[]);
  const faqs = [
    {question:"What is a graduated payment mortgage?",answer:"A graduated payment mortgage (GPM) starts with below-market payments that increase annually over 5–10 years. This makes homeownership accessible to buyers expecting rising income. The trade-off: you may initially owe more than you pay (negative amortization) if payments don't cover interest."},
    {question:"When should I use a GPM?",answer:"GPMs work best when you expect significant income growth — new doctors, lawyers, or professionals in their first years. They're less suitable if your income is stable or uncertain. Always ensure the final payment is affordable at the maximum rate cap."},
  ];
  const i="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  return (<>
    <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"Graduated Payment Mortgage Calculator"}]}/>
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Graduated Payment Mortgage Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e=>setLoanAmount(e.target.value)} className={c}/></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Initial Interest Rate (%)</label><div className={i}><input type="number" value={initialRate} onChange={e=>setInitialRate(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Annual Rate Increase (%)</label><div className={i}><input type="number" value={annualIncrease} onChange={e=>setAnnualIncrease(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={term} onChange={e=>setTerm(e.target.value)} className={c}/><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Max Rate Cap (%)</label><div className={i}><input type="number" value={maxRate} onChange={e=>setMaxRate(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4"/></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result&&(<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Initial Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.initialPayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              <div className="text-sm text-muted-foreground mt-1">Graduates to ${result.finalPayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}/mo · Total Cost: ${result.totalCost.toLocaleString("en-US",{maximumFractionDigits:0})}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Initial","$"+result.initialPayment.toFixed(2)],["Final","$"+result.finalPayment.toFixed(2)],["Increase",((result.finalPayment/result.initialPayment-1)*100).toFixed(0)+"%"]].map(([l,v],idx)=>(<div key={idx} className={`p-4 text-center ${idx>0?"border-l border-border":""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Payment Schedule</h3><ResponsiveContainer width="100%" height={200}><LineChart data={result.chartData} margin={{top:5,right:10,left:10,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis yAxisId="left" tick={{fontSize:10}} tickFormatter={v=>'$'+(v/1000).toFixed(0)+'K'}/><YAxis yAxisId="right" orientation="right" tick={{fontSize:10}} tickFormatter={v=>'$'+(v/1000).toFixed(0)+'K'}/><Tooltip formatter={(v:number)=>['$'+v.toLocaleString(),'']}/><Legend wrapperStyle={{fontSize:11}}/><Line yAxisId="left" type="monotone" dataKey="payment" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Monthly Payment"/><Line yAxisId="right" type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="5 5" name="Remaining Balance"/></LineChart></ResponsiveContainer></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Year-by-Year Breakdown</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase"><th className="py-2 text-left">Year</th><th className="py-2 text-right">Payment</th><th className="py-2 text-right">Interest</th><th className="py-2 text-right">Principal</th><th className="py-2 text-right">Balance</th></tr></thead><tbody>{result.schedule.slice(0,10).map(r=>(<tr key={r.year} className="border-b border-border/50"><td className="py-2 text-muted-foreground">{r.year}</td><td className="py-2 text-right font-semibold">${r.payment.toLocaleString()}</td><td className="py-2 text-right">${r.interest.toLocaleString()}</td><td className="py-2 text-right">${r.principal.toLocaleString()}</td><td className="py-2 text-right">${r.balance.toLocaleString()}</td></tr>))}{result.schedule.length>10&&<tr><td colSpan={5} className="py-2 text-center text-muted-foreground text-xs">... {result.schedule.length-10} more years</td></tr>}</tbody></table></div></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s,i)=>(<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10"/><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">How Graduated Payment Mortgages Work</h2><p>A graduated payment mortgage (GPM) starts with below-market payments that increase annually over5–10 years. This makes homeownership accessible to buyers expecting rising income. The trade-off: initial payments may not fully cover interest, leading to negative amortization.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/graduated-payment-mortgage-calculator"/><PopularCalculators exclude="/calculator/graduated-payment-mortgage-calculator"/></div>
    </div>
  </>);
}
