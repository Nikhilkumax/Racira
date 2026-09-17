"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs { loanAmount: number; interestRate: number; termMonths: number; originationFee: number; monthlyRevenueIncrease: number; }
interface Result { monthlyPayment: number; totalInterest: number; totalCost: number; origFee: number; effectiveRate: number; roi: number; breakdown: {label:string;value:string;highlight?:boolean}[]; summaryStats: {label:string;value:string}[]; chartData: {name:string;value:number}[]; }

function calc(inp: Inputs): Result {
  const r = inp.interestRate / 100 / 12;
  const n = inp.termMonths;
  const P = inp.loanAmount;
  const monthlyPayment = r > 0 ? (P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1) : P/n;
  const totalInterest = monthlyPayment * n - P;
  const origFee = P * (inp.originationFee / 100);
  const totalCost = monthlyPayment * n + origFee;
  const effectiveRate = P > 0 ? ((totalInterest + origFee) / P / (inp.termMonths/12)) * 100 : 0;
  const totalRevenueIncrease = inp.monthlyRevenueIncrease * inp.termMonths;
  const roi = totalCost > 0 ? ((totalRevenueIncrease - totalCost) / totalCost * 100) : 0;
  const fmt = (x:number) => '$'+Math.round(x).toLocaleString('en-US');
  const fmtD = (x:number) => x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const breakdown = [
    {label:'Loan Amount',value:fmt(P)}, {label:'Interest Rate',value:inp.interestRate+'%/yr'},
    {label:'Term',value:inp.termMonths+' months ('+(inp.termMonths/12).toFixed(1)+' years)'},
    {label:'Origination Fee',value:fmt(origFee)+' ('+inp.originationFee+'%)'},
    {label:'Monthly Payment',value:'$'+fmtD(monthlyPayment),highlight:true},
    {label:'Total Interest',value:fmt(totalInterest)}, {label:'Total Cost',value:fmt(totalCost),highlight:true},
    {label:'Revenue Increase (est.)',value:fmt(totalRevenueIncrease)},
    {label:'Net ROI',value:roi.toFixed(1)+'%',highlight:true},
  ];
  const summaryStats = [
    {label:'Monthly Payment',value:'$'+fmtD(monthlyPayment)+'/mo'},{label:'Total Cost',value:fmt(totalCost)},
    {label:'Total Interest',value:fmt(totalInterest)},{label:'Origination Fee',value:fmt(origFee)},
    {label:'Effective APR (est.)',value:effectiveRate.toFixed(2)+'%'},{label:'Net ROI',value:roi.toFixed(1)+'%'},
    {label:'Revenue Increase',value:fmt(totalRevenueIncrease)},{label:'Months',value:String(n)},
  ];
  const chartData = [{name:'Principal',value:Math.round(P)},{name:'Interest',value:Math.round(totalInterest)},{name:'Fees',value:Math.round(origFee)}];
  return {monthlyPayment,totalInterest,totalCost,origFee,effectiveRate,roi,breakdown,summaryStats,chartData};
}
const DEFAULTS: Inputs = {loanAmount:50000,interestRate:8.5,termMonths:24,originationFee:2,monthlyRevenueIncrease:5000};

export default function WorkingCapitalLoanCalculator() {
  const [loanAmount,setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate,setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termMonths,setTermMonths] = useState(String(DEFAULTS.termMonths));
  const [originationFee,setOriginationFee] = useState(String(DEFAULTS.originationFee));
  const [monthlyRevenueIncrease,setMonthlyRevenueIncrease] = useState(String(DEFAULTS.monthlyRevenueIncrease));
  const [result,setResult] = useState<Result|null>(null);
  const g = ():Inputs => ({loanAmount:parseFloat(loanAmount)||0,interestRate:parseFloat(interestRate)||0,termMonths:parseInt(termMonths)||1,originationFee:parseFloat(originationFee)||0,monthlyRevenueIncrease:parseFloat(monthlyRevenueIncrease)||0});
  const calc_ = () => setResult(calc(g()));
  const reset = () => {setLoanAmount(String(DEFAULTS.loanAmount));setInterestRate(String(DEFAULTS.interestRate));setTermMonths(String(DEFAULTS.termMonths));setOriginationFee(String(DEFAULTS.originationFee));setMonthlyRevenueIncrease(String(DEFAULTS.monthlyRevenueIncrease));setResult(calc(DEFAULTS));};
  useEffect(()=>{setResult(calc(DEFAULTS));},[]);
  const faqs = [
    {question:"What is a working capital loan?",answer:"A working capital loan finances day-to-day business operations — inventory purchases, payroll, rent, and other short-term expenses. Unlike equipment loans, working capital loans are general-purpose and typically have shorter terms (6–24 months) with higher rates than secured loans."},
    {question:"How do I calculate ROI on a working capital loan?",answer:"ROI = (Total Revenue Increase − Total Cost) / Total Cost × 100. If borrowing $50K generates $120K in additional revenue over 24 months, and total loan cost is $55K, the ROI is ($120K − $55K) / $55K × 100 = 118%. Always ensure the revenue increase exceeds the total loan cost."},
  ];
  const i="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  return (<>
    <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"Working Capital Loan Calculator"}]}/>
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Working Capital Loan Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e=>setLoanAmount(e.target.value)} className={c}/></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e=>setInterestRate(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Term</label><div className={i}><input type="number" value={termMonths} onChange={e=>setTermMonths(e.target.value)} className={c}/><span className="pr-3 text-muted-foreground text-sm">months</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Origination Fee (%)</label><div className={i}><input type="number" value={originationFee} onChange={e=>setOriginationFee(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Monthly Revenue Increase ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={monthlyRevenueIncrease} onChange={e=>setMonthlyRevenueIncrease(e.target.value)} className={c}/></div></div>
          </div>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4"/></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result&&(<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.monthlyPayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Cost: ${result.totalCost.toLocaleString("en-US",{maximumFractionDigits:0})} · ROI: {result.roi.toFixed(1)}%</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Monthly","$"+result.monthlyPayment.toFixed(2)],["Total Interest","$"+Math.round(result.totalInterest).toLocaleString()],["ROI",result.roi.toFixed(1)+"%"]].map(([l,v],idx)=>(<div key={idx} className={`p-4 text-center ${idx>0?"border-l border-border":""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Loan Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r,i)=>(<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight?"bg-primary/5":""}`}><td className={`py-2.5 ${r.highlight?"font-bold":"text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight?"font-bold":"font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Cost Composition</h3><ResponsiveContainer width="100%" height={180}><BarChart data={result.chartData} margin={{top:5,right:10,left:10,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="name" tick={{fontSize:11}}/><YAxis tick={{fontSize:10}} tickFormatter={v=>'$'+(v/1000).toFixed(0)+'K'}/><Tooltip formatter={(v:number)=>['$'+v.toLocaleString(),'']}/><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s,i)=>(<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10"/><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">Working Capital Loans Explained</h2><p>Working capital loans bridge cash flow gaps in business operations. They're ideal for seasonal businesses, inventory purchases, or covering payroll during slow periods. The key metric is whether the loan generates more revenue than it costs — our ROI calculator helps you evaluate this trade-off.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/working-capital-loan-calculator"/><PopularCalculators exclude="/calculator/working-capital-loan-calculator"/></div>
    </div>
  </>);
}
