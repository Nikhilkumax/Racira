"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Inputs { boatPrice: number; downPayment: number; interestRate: number; termYears: number; insurance: number; }
interface Result { monthlyPayment: number; totalInterest: number; totalCost: number; loanAmount: number; breakdown: {label:string;value:string;highlight?:boolean}[]; summaryStats: {label:string;value:string}[]; chartData: {year:number;balance:number;equity:number}[]; }

function calc(inp: Inputs): Result {
  const P = inp.boatPrice - inp.downPayment;
  const r = inp.interestRate / 100 / 12;
  const n = inp.termYears * 12;
  const monthlyPayment = r > 0 ? (P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1) : P/n;
  const totalInterest = monthlyPayment * n - P;
  const totalCost = monthlyPayment * n + inp.downPayment + inp.insurance * inp.termYears;
  const fmt = (x:number) => '$'+Math.round(x).toLocaleString('en-US');
  const fmtD = (x:number) => x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const breakdown = [
    {label:'Boat Price',value:fmt(inp.boatPrice)}, {label:'Down Payment',value:fmt(inp.downPayment)+' ('+((inp.downPayment/inp.boatPrice)*100).toFixed(0)+'%)'},
    {label:'Loan Amount',value:fmt(P)}, {label:'Interest Rate',value:inp.interestRate+'%/yr'},
    {label:'Term',value:inp.termYears+' years'}, {label:'Marine Insurance',value:fmt(inp.insurance)+'/yr'},
    {label:'Monthly Payment',value:'$'+fmtD(monthlyPayment),highlight:true},
    {label:'Total Interest',value:fmt(totalInterest)}, {label:'Total Cost',value:fmt(totalCost),highlight:true},
  ];
  const summaryStats = [
    {label:'Monthly Payment',value:'$'+fmtD(monthlyPayment)+'/mo'},{label:'Total Interest',value:fmt(totalInterest)},
    {label:'Total Cost',value:fmt(totalCost)},{label:'Down Payment',value:fmt(inp.downPayment)},
    {label:'Loan Amount',value:fmt(P)},{label:'Insurance Total',value:fmt(inp.insurance*inp.termYears)},
    {label:'Cost of Credit',value:((totalInterest/P)*100).toFixed(1)+'%'},{label:'Monthly w/ Insurance',value:'$'+fmtD(monthlyPayment+inp.insurance/12)+'/mo'},
  ];
  const chartData: Result["chartData"] = [];
  let bal = P;
  for (let yr = 1; yr <= inp.termYears; yr++) {
    for (let m = 0; m < 12; m++) { if (bal <= 0) break; bal -= (monthlyPayment - bal * r); }
    const equity = inp.boatPrice - Math.max(0, bal);
    chartData.push({year:yr, balance:Math.max(0,Math.round(bal)), equity:Math.round(equity)});
  }
  return {monthlyPayment,totalInterest,totalCost,loanAmount:P,breakdown,summaryStats,chartData};
}
const DEFAULTS: Inputs = {boatPrice:45000,downPayment:9000,interestRate:6.9,termYears:10,insurance:1200};

export default function BoatLoanPaymentCalculator() {
  const [boatPrice,setBoatPrice] = useState(String(DEFAULTS.boatPrice));
  const [downPayment,setDownPayment] = useState(String(DEFAULTS.downPayment));
  const [interestRate,setInterestRate] = useState(String(DEFAULTS.interestRate));
  const [termYears,setTermYears] = useState(String(DEFAULTS.termYears));
  const [insurance,setInsurance] = useState(String(DEFAULTS.insurance));
  const [result,setResult] = useState<Result|null>(null);
  const g = ():Inputs => ({boatPrice:parseFloat(boatPrice)||0,downPayment:parseFloat(downPayment)||0,interestRate:parseFloat(interestRate)||0,termYears:parseInt(termYears)||1,insurance:parseFloat(insurance)||0});
  const calc_ = () => setResult(calc(g()));
  const reset = () => {setBoatPrice(String(DEFAULTS.boatPrice));setDownPayment(String(DEFAULTS.downPayment));setInterestRate(String(DEFAULTS.interestRate));setTermYears(String(DEFAULTS.termYears));setInsurance(String(DEFAULTS.insurance));setResult(calc(DEFAULTS));};
  useEffect(()=>{setResult(calc(DEFAULTS));},[]);
  const faqs = [
    {question:"What credit score do I need for a boat loan?",answer:"Most marine lenders require a credit score of 680+ for the best rates. Scores below 680 may qualify but at higher rates (1–3% above prime). Some lenders work with scores as low as 600, but with significantly higher interest rates and larger down payment requirements."},
    {question:"How much should I put down on a boat?",answer:"Most lenders require 10–20% down for new boats and 15–25% for used boats. Larger down payments (20%+) secure better interest rates and avoid being 'upside down' (owing more than the boat is worth) as boats depreciate 5–10% annually in the first few years."},
    {question:"What does boat insurance cost?",answer:"Boat insurance typically costs 1.5–3% of the boat's value annually. A $45,000 boat might cost $675–$1,350/year. Coverage includes liability, collision, comprehensive, and sometimes towing. Insurance is often required by lenders and marinas."},
  ];
  const i="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  return (<>
    <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"Boat Loan Payment Calculator"}]}/>
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Boat Loan Payment Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div><label className="text-sm font-medium mb-1 block">Boat Price ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={boatPrice} onChange={e=>setBoatPrice(e.target.value)} className={c}/></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Down Payment ($)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={downPayment} onChange={e=>setDownPayment(e.target.value)} className={c}/></div></div>
            <div><label className="text-sm font-medium mb-1 block">Interest Rate (%)</label><div className={i}><input type="number" value={interestRate} onChange={e=>setInterestRate(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Loan Term</label><div className={i}><input type="number" value={termYears} onChange={e=>setTermYears(e.target.value)} className={c}/><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Marine Insurance ($/yr)</label><div className={i}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={insurance} onChange={e=>setInsurance(e.target.value)} className={c}/></div></div>
          </div>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4"/></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result&&(<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Monthly Payment</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">${result.monthlyPayment.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Cost: ${result.totalCost.toLocaleString("en-US",{maximumFractionDigits:0})} · Loan: ${result.loanAmount.toLocaleString("en-US",{maximumFractionDigits:0})}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Monthly","$"+result.monthlyPayment.toFixed(2)],["Total Interest","$"+Math.round(result.totalInterest).toLocaleString()],["Down Payment","$"+DEFAULTS.downPayment.toLocaleString()]].map(([l,v],idx)=>(<div key={idx} className={`p-4 text-center ${idx>0?"border-l border-border":""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Balance vs Equity</h3><ResponsiveContainer width="100%" height={200}><LineChart data={result.chartData} margin={{top:5,right:10,left:10,bottom:5}}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="year" tick={{fontSize:11}}/><YAxis tick={{fontSize:10}} tickFormatter={v=>'$'+(v/1000).toFixed(0)+'K'}/><Tooltip formatter={(v:number)=>['$'+v.toLocaleString(),'']}/><Legend wrapperStyle={{fontSize:11}}/><Line type="monotone" dataKey="balance" stroke="#ef4444" strokeWidth={2} dot={false} name="Loan Balance"/><Line type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2} dot={false} name="Equity"/></LineChart></ResponsiveContainer></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Loan Breakdown</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r,i)=>(<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight?"bg-primary/5":""}`}><td className={`py-2.5 ${r.highlight?"font-bold":"text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight?"font-bold":"font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s,i)=>(<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10"/><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">How Boat Financing Works</h2><p>Boat loans work similarly to auto loans but with longer terms (10–20 years) and higher rates. Marine lenders consider the boat type, age, and value alongside your credit profile. New boats get the best rates; used boats over 10 years old may require specialty lenders at premium rates.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/boat-loan-payment-calculator"/><PopularCalculators exclude="/calculator/boat-loan-payment-calculator"/></div>
    </div>
  </>);
}
