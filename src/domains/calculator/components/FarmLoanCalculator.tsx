"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

interface Inputs { loanAmount: number; interestRate: number; termYears: number; downPayment: number; seasonalPayment: boolean; }
interface Result { monthlyPayment: number; seasonalPayment: number; totalInterest: number; totalCost: number; amortization: {year:number;principal:number;interest:number;balance:number}[]; breakdown: {label:string;value:string;highlight?:boolean}[]; summaryStats: {label:string;value:string}[]; chartData: {year:number;principal:number;interest:number}[]; }

function calc(inp: Inputs): Result {
  const P = inp.loanAmount - inp.downPayment;
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const monthlyPayment = r > 0 ? (P * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1) : P/n;
  const seasonalPayment = monthlyPayment * 12; // Annual payment for seasonal
  const totalInterest = monthlyPayment * n - P;
  const totalCost = monthlyPayment * n + inp.downPayment;

  let balance = P;
  const amortization: Result["amortization"] = [];
  const chartData: Result["chartData"] = [];
  for (let yr = 1; yr <= inp.termYears; yr++) {
    let yP = 0, yI = 0;
    for (let m = 0; m < 12; m++) {
      if (balance <= 0) break;
      const ip = balance * r;
      const pp = Math.min(monthlyPayment - ip, balance);
      yP += pp; yI += ip; balance -= pp;
    }
    amortization.push({year:yr,principal:Math.round(yP),interest:Math.round(yI),balance:Math.max(0,Math.round(balance))});
    chartData.push({year:yr,principal:Math.round(yP),interest:Math.round(yI)});
  }

  const fmt = (x:number) => '$'+Math.round(x).toLocaleString('en-US');
  const fmtD = (x:number) => x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const breakdown = [
    {label:'Loan Amount',value:fmt(inp.loanAmount)}, {label:'Down Payment',value:fmt(inp.downPayment)},
    {label:'Financed Amount',value:fmt(P)}, {label:'Interest Rate',value:inp.interestRate+'%/yr'},
    {label:'Term',value:inp.termYears+' years'}, {label:'Monthly Payment',value:'$'+fmtD(monthlyPayment),highlight:true},
    {label:'Annual Payment (Seasonal)',value:inp.seasonalPayment?'$'+fmt(seasonalPayment):'N/A'},
    {label:'Total Interest',value:fmt(totalInterest)}, {label:'Total Cost',value:fmt(totalCost),highlight:true},
  ];
  const summaryStats = [
    {label:'Monthly Payment',value:'$'+fmtD(monthlyPayment)+'/mo'},{label:'Annual Payment',value:fmt(seasonalPayment)+'/yr'},
    {label:'Total Interest',value:fmt(totalInterest)},{label:'Total Cost',value:fmt(totalCost)},
    {label:'Cost per Acre (est.)',value:P>0?'$'+fmtD(totalCost/640):'N/A'},{label:'Months',value:String(n)},
    {label:'Down Payment',value:fmt(inp.downPayment)},{label:'Effective Rate',value:((totalInterest/P/inp.termYears)*100).toFixed(2)+'%'},
  ];
  return {monthlyPayment,seasonalPayment,totalInterest,totalCost,amortization,breakdown,summaryStats,chartData};
}

const DEFAULTS: Inputs = {loanAmount:250000,interestRate:6.5,termYears:15,downPayment:50000,seasonalPayment:true};

export default function FarmLoanCalculator() {
  const [loanAmount,setLoanAmount] = useState(String(DEFAULTS.loanAmount));
  const [interestRate,setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears,setTermYears] = useState(String(DEFAULTS.termYears));
  const [downPayment,setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [seasonalPayment,setSeasonalPayment] = useState(DEFAULTS.seasonalPayment);
  const [result,setResult] = useState<Result|null>(null);
  const g = ():Inputs => ({loanAmount:parseFloat(loanAmount)||0,interestRate:parseFloat(interestRate)||0,termYears:parseInt(termYears)||1,downPayment:parseFloat(downPayment)||0,seasonalPayment});
  const calc_ = () => setResult(calc(g()));
  const reset = () => {setLoanAmount(String(DEFAULTS.loanAmount));setInterestRate(String(DEFAULTS.interestRate));setTermYears(String(DEFAULTS.termYears));setDownPayment(String(DEFAULTS.downPayment));setSeasonalPayment(DEFAULTS.seasonalPayment);setResult(calc(DEFAULTS));};
  useEffect(()=>{setResult(calc(DEFAULTS));},[]);
  const faqs = [
    {question:"What is a farm loan?",answer:"Farm loans are specialized agricultural financing products used to purchase farmland, equipment, livestock, or operational supplies. They're offered through the USDA Farm Service Agency (FSA), commercial banks, and Farm Credit System lenders. Rates are typically competitive with conventional mortgages."},
    {question:"What is a seasonal farm loan payment?",answer:"Many farm loans offer seasonal payment structures where you make one annual payment (often after harvest) instead of 12 monthly payments. This aligns cash flow with agricultural income cycles. The annual payment is simply 12× the equivalent monthly payment."},
    {question:"Can I get a USDA farm loan?",answer:"Yes. The USDA FSA offers Direct Farm Ownership loans (up to $600,000) and Operating loans (up to $400,000) with competitive fixed rates. Beginning farmers and socially disadvantaged farmers get priority. Microloans up to $50,000 have simplified applications."},
  ];
  const i="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  return (<>
    <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"Farm Loan Calculator"}]}/>
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Farm Loan Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Loan Amount ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e=>setLoanAmount(e.target.value)} className={c}/></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e=>setInterestRate(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={termYears} onChange={e=>setTermYears(e.target.value)} className={c}/><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Down Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={downPayment} onChange={e=>setDownPayment(e.target.value)} className={c}/></div></div>
            <div className="flex items-end pb-1"><label className="flex items-center gap-2 text-sm font-medium cursor-pointer"><input type="checkbox" checked={seasonalPayment} onChange={e=>setSeasonalPayment(e.target.checked)} className="rounded border-input"/>Seasonal (annual) payment</label></div>
          </div>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4"/></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result&&(<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{seasonalPayment?'Annual Seasonal Payment':'Monthly Payment'}</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${seasonalPayment?result.seasonalPayment.toLocaleString("en-US",{maximumFractionDigits:0}):result.monthlyPayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Cost: ${result.totalCost.toLocaleString("en-US",{maximumFractionDigits:0})} · Total Interest: ${result.totalInterest.toLocaleString("en-US",{maximumFractionDigits:0})}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Monthly","$"+result.monthlyPayment.toFixed(2)],["Annual","$"+result.seasonalPayment.toLocaleString()],["Total","$"+Math.round(result.totalCost).toLocaleString()]].map(([l,v],idx)=>(<div key={idx} className={`p-4 text-center ${idx>0?"border-l border-border":""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Amortization Schedule</h3><ResponsiveContainer width="100%" height={200}><BarChart data={result.chartData} margin={{top:5,right:10,left:10,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis tick={{fontSize:10}} tickFormatter={v=>'$'+(v/1000).toFixed(0)+'K'}/><Tooltip formatter={(v:number)=>['$'+v.toLocaleString(),'']}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="principal" stackId="a" fill="hsl(var(--primary))" name="Principal"/><Bar dataKey="interest" stackId="a" fill="#f59e0b" name="Interest"/></BarChart></ResponsiveContainer></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s,i)=>(<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10"/><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">Understanding Farm Loans</h2><p>Farm loans finance agricultural operations including land purchase, equipment, livestock, and operating expenses. The USDA Farm Service Agency (FSA) and Farm Credit System offer specialized products with terms designed for agricultural cash flow patterns, including seasonal payment options that align with harvest cycles.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/farm-loan-calculator"/><PopularCalculators exclude="/calculator/farm-loan-calculator"/></div>
    </div>
  </>);
}
