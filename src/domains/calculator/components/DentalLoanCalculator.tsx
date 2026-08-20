"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Inputs { loanAmount: number; interestRate: number; termYears: number; downPayment: number; }
interface Result { monthlyPayment: number; totalInterest: number; totalCost: number; principal: number; breakdown: {label:string;value:string;highlight?:boolean}[]; summaryStats: {label:string;value:string}[]; chartData: {name:string;value:number;color:string}[]; }

function calc(inp: Inputs): Result {
  const P = inp.loanAmount - inp.downPayment;
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const monthlyPayment = r > 0 ? (P * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1) : P/n;
  const totalInterest = monthlyPayment * n - P;
  const totalCost = monthlyPayment * n + inp.downPayment;
  const fmt = (x:number) => '$'+Math.round(x).toLocaleString('en-US');
  const fmtD = (x:number) => x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const breakdown = [
    {label:'Loan Amount',value:fmt(inp.loanAmount)}, {label:'Down Payment',value:fmt(inp.downPayment)},
    {label:'Financed Amount',value:fmt(P)}, {label:'Interest Rate',value:inp.interestRate+'%/yr'},
    {label:'Term',value:inp.termYears+' years ('+n+' months)'}, {label:'Monthly Payment',value:'$'+fmtD(monthlyPayment),highlight:true},
    {label:'Total Interest',value:fmt(totalInterest)}, {label:'Total Cost',value:fmt(totalCost),highlight:true},
  ];
  const summaryStats = [
    {label:'Monthly Payment',value:'$'+fmtD(monthlyPayment)}, {label:'Total Interest',value:fmt(totalInterest)},
    {label:'Total Cost',value:fmt(totalCost)}, {label:'Down Payment',value:fmt(inp.downPayment)},
    {label:'Effective Rate (est.)',value:((totalInterest/P/inp.termYears)*100).toFixed(2)+'%'},
    {label:'Loan-to-Cost',value:((P/inp.loanAmount)*100).toFixed(1)+'%'},
    {label:'Cost per Month',value:'$'+fmtD(totalCost/n)}, {label:'Months',value:String(n)},
  ];
  const PIE = ['hsl(var(--primary))','#10b981','#f59e0b'];
  const chartData = [{name:'Principal',value:Math.round(P),color:PIE[0]},{name:'Interest',value:Math.round(totalInterest),color:PIE[1]},{name:'Down Payment',value:Math.round(inp.downPayment),color:PIE[2]}].filter(d=>d.value>0);
  return {monthlyPayment,totalInterest,totalCost,principal:P,breakdown,summaryStats,chartData};
}

const DEFAULTS: Inputs = {loanAmount:15000,interestRate:8.5,termYears:3,downPayment:0};

export default function DentalLoanCalculator() {
  const [loanAmount,setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate,setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears,setTermYears] = useState(String(DEFAULTS.termYears));
  const [downPayment,setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [result,setResult] = useState<Result|null>(null);
  const g = ():Inputs => ({loanAmount:parseFloat(loanAmount)||0,interestRate:parseFloat(interestRate)||0,termYears:parseInt(termYears)||1,downPayment:parseFloat(downPayment)||0});
  const calc_ = () => setResult(calc(g()));
  const reset = () => {setLoanAmount(String(DEFAULTS.loanAmount));setInterestRate(String(DEFAULTS.interestRate));setTermYears(String(DEFAULTS.termYears));setDownPayment(String(DEFAULTS.downPayment));setResult(calc(DEFAULTS));};
  useEffect(()=>{setResult(calc(DEFAULTS));},[]);
  const faqs = [
    {question:"What is a dental loan?",answer:"A dental loan is a personal or medical loan used to pay for dental procedures not covered by insurance. Typical procedures include implants ($3,000–$6,000), braces ($3,000–$7,000), and root canals ($700–$1,500). Interest rates range from 6%–36% depending on credit score and lender."},
    {question:"Should I use a dental credit card instead?",answer:"Dental credit cards like CareCredit offer 0% promotional periods (6–24 months), but charge deferred interest if not paid in full. A fixed-rate dental loan is safer if you can't guarantee full payoff within the promotional window. Our calculator helps compare the true cost."},
  ];
  const i="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  return (<>
    <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"Dental Loan Calculator"}]}/>
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dental Loan Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e=>setLoanAmount(e.target.value)} className={c}/></div></div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e=>setInterestRate(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={termYears} onChange={e=>setTermYears(e.target.value)} className={c}/><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Down Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={downPayment} onChange={e=>setDownPayment(e.target.value)} className={c}/></div></div>
          </div>
          <div className="flex gap-3 mt-1">
            <button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
            <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4"/></button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {result&&(<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.monthlyPayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Cost: ${result.totalCost.toLocaleString("en-US",{maximumFractionDigits:0})} · Total Interest: ${result.totalInterest.toLocaleString("en-US",{maximumFractionDigits:0})}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Monthly","$"+result.monthlyPayment.toFixed(2)],["Total Interest","$"+Math.round(result.totalInterest).toLocaleString()],["Total Cost","$"+Math.round(result.totalCost).toLocaleString()]].map(([l,v],i)=>(<div key={i} className={`p-4 text-center ${i>0?"border-l border-border":""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Loan Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r,i)=>(<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight?"bg-primary/5":""}`}><td className={`py-2.5 ${r.highlight?"font-bold":"text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight?"font-bold":"font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border bg-card">
              <div className="shrink-0"><div className="w-[160px] h-[160px] relative"><ResponsiveContainer width="100%" height="100%"><RPie><Pie data={result.chartData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={2} dataKey="value">{result.chartData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={(v:number)=>[`$${v.toLocaleString()}`,""]}/></RPie></ResponsiveContainer></div></div>
              <div className="flex-1 flex flex-col gap-2"><h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Cost Split</h4>{result.chartData.map(item=>(<div key={item.name} className="flex items-center justify-between text-[13px]"><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor:item.color}}/><span className="font-semibold text-muted-foreground">{item.name}</span></div><span className="font-bold text-foreground">${item.value.toLocaleString()}</span></div>))}</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s,i)=>(<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10"/><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">How Dental Financing Works</h2><p>Dental procedures can cost thousands of dollars. A dental loan lets you spread the cost over fixed monthly payments at a predictable interest rate. Unlike credit cards, dental loans have a fixed payoff date and won't tempt you with revolving debt.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dental-loan-calculator"/><PopularCalculators exclude="/calculator/dental-loan-calculator"/></div>
    </div>
  </>);
}
