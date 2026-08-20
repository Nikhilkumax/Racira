"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

interface Debt { name: string; balance: number; rate: number; payment: number; }
interface Inputs { debts: Debt[]; consolidationRate: number; consolidationTerm: number; }
interface Result { currentTotalPayment: number; currentTotalBalance: number; currentWeightedRate: number; consolPayment: number; consolTotalCost: number; currentTotalCost: number; monthlySavings: number; totalSavings: number; payoffMonthsSaved: number; breakdown: {label:string;value:string;highlight?:boolean}[]; summaryStats: {label:string;value:string}[]; chartData: {name:string;current:number;consolidated:number}[]; }

function calc(inp: Inputs): Result {
  const currentTotalPayment = inp.debts.reduce((s,d)=>s+d.payment, 0);
  const currentTotalBalance = inp.debts.reduce((s,d)=>s+d.balance, 0);
  const currentWeightedRate = currentTotalBalance > 0 ? inp.debts.reduce((s,d)=>s+d.balance*(d.rate/100), 0) / currentTotalBalance * 100 : 0;
  const r = inp.consolidationRate / 100 / 12;
  const n = inp.consolidationTerm * 12;
  const consolPayment = r > 0 ? (currentTotalBalance*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1) : currentTotalBalance/n;
  const consolTotalCost = consolPayment * n;
  // Rough current total cost: sum of (payment * months to payoff at current rate)
  const currentTotalCost = inp.debts.reduce((s,d) => {
    const cr = d.rate / 100 / 12;
    const months = cr > 0 ? -Math.log(1 - d.balance * cr / d.payment) / Math.log(1 + cr) : d.balance / d.payment;
    return s + d.payment * Math.max(1, Math.min(isFinite(months) ? months : 60, 120));
  }, 0);
  const monthlySavings = currentTotalPayment - consolPayment;
  const totalSavings = currentTotalCost - consolTotalCost;
  const avgPayoffMonths = inp.debts.reduce((s,d) => {
    const cr = d.rate / 100 / 12;
    const months = cr > 0 ? -Math.log(1 - d.balance * cr / d.payment) / Math.log(1 + cr) : d.balance / d.payment;
    return s + Math.max(1, Math.min(isFinite(months) ? months : 60, 120));
  }, 0) / Math.max(1, inp.debts.length);
  const payoffMonthsSaved = Math.max(0, avgPayoffMonths - n);
  const fmt = (x:number) => '$'+Math.round(x).toLocaleString('en-US');
  const fmtD = (x:number) => x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const breakdown = [
    {label:'Current Total Debt',value:fmt(currentTotalBalance)},
    {label:'Weighted Average Rate',value:currentWeightedRate.toFixed(2)+'%'},
    {label:'Current Monthly Payment',value:'$'+fmtD(currentTotalPayment)+'/mo'},
    {label:'Consolidation Rate',value:inp.consolidationRate+'%'},
    {label:'Consolidation Term',value:inp.consolidationTerm+' years ('+n+' months)'},
    {label:'New Monthly Payment',value:'$'+fmtD(consolPayment)+'/mo',highlight:true},
    {label:'Monthly Savings',value:monthlySavings>0?'$'+fmtD(monthlySavings):'N/A',highlight:monthlySavings>0},
    {label:'Total Savings',value:totalSavings>0?fmt(totalSavings):'N/A',highlight:totalSavings>0},
  ];
  const summaryStats = [
    {label:'New Payment',value:'$'+fmtD(consolPayment)+'/mo'},{label:'Current Payment',value:'$'+fmtD(currentTotalPayment)+'/mo'},
    {label:'Monthly Savings',value:monthlySavings>0?'$'+fmtD(monthlySavings):'N/A'},{label:'Total Savings',value:totalSavings>0?fmt(totalSavings):'N/A'},
    {label:'Consolidation Rate',value:inp.consolidationRate+'%'},{label:'Current Weighted Rate',value:currentWeightedRate.toFixed(2)+'%'},
    {label:'Total Debt',value:fmt(currentTotalBalance)},{label:'Payoff Months Saved',value:payoffMonthsSaved>0?Math.round(payoffMonthsSaved)+' mo':'N/A'},
  ];
  const chartData = inp.debts.filter(d=>d.payment>0).map(d=>({name:d.name.substring(0,15),current:Math.round(d.payment),consolidated:0}));
  if (chartData.length > 0) chartData.push({name:'Consolidated',current:0,consolidated:Math.round(consolPayment)});
  return {currentTotalPayment,currentTotalBalance,currentWeightedRate,consolPayment,consolTotalCost,currentTotalCost,monthlySavings,totalSavings,payoffMonthsSaved,breakdown,summaryStats,chartData};
}

const DEFAULTS: Inputs = { debts: [
  {name:'Credit Card 1',balance:5000,rate:19.99,payment:150},
  {name:'Credit Card 2',balance:3500,rate:22.49,payment:100},
  {name:'Personal Loan',balance:8000,rate:11.5,payment:200},
], consolidationRate: 8.5, consolidationTerm: 4 };

export default function ConsolidationLoanRateCalculator() {
  const [debts,setDebts] = useState(DEFAULTS.debts.map(d=>({...d})));
  const [consolidationRate,setConsolidationRate] = useState(String(DEFAULTS.consolidationRate));
  const [consolidationTerm,setConsolidationTerm] = useState(String(DEFAULTS.consolidationTerm));
  const [result,setResult] = useState<Result|null>(null);
  const g = ():Inputs => ({debts:debts.map(d=>({...d,balance:parseFloat(String(d.balance))||0,rate:parseFloat(String(d.rate))||0,payment:parseFloat(String(d.payment))||0})),consolidationRate:parseFloat(consolidationRate)||0,consolidationTerm:parseInt(consolidationTerm)||1});
  const calc_ = () => setResult(calc(g()));
  const reset = () => {setDebts(DEFAULTS.debts.map(d=>({...d})));setConsolidationRate(String(DEFAULTS.consolidationRate));setConsolidationTerm(String(DEFAULTS.consolidationTerm));setResult(calc(DEFAULTS));};
  const updateDebt = (i:number, field:keyof Debt, value:string) => {const nd=[...debts];(nd[i] as any)[field]=field==='name'?value:parseFloat(value)||0;setDebts(nd);};
  useEffect(()=>{setResult(calc(DEFAULTS));},[]);
  const faqs = [
    {question:"What is debt consolidation?",answer:"Debt consolidation combines multiple debts into a single loan with one monthly payment. The goal is to secure a lower interest rate than the weighted average of your current debts, reducing total interest paid and simplifying your payment schedule."},
    {question:"When does consolidation save money?",answer:"Consolidation saves money when the new rate is lower than your weighted average rate AND the total interest over the new term is less than what you'd pay individually. Beware: lower monthly payments from a longer term may mean paying more total interest."},
    {question:"Does consolidation affect my credit score?",answer:"Applying for a consolidation loan creates a hard inquiry (temporarily lowers score by 5–10 points). However, if you pay off credit cards, your utilization ratio drops significantly, which can boost your score by 20–50 points within 1–2 months."},
  ];
  const i="flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const c="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  return (<>
    <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Finance",href:"/calculator#finance"},{label:"Consolidation Loan Rate Calculator"}]}/>
    <div className="racira-page-container py-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Debt Consolidation Loan Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">Your Current Debts</div>
          {debts.map((d,i)=>(
            <div key={i} className="grid grid-cols-3 gap-2 p-2 rounded border border-border bg-secondary/10">
              <input value={d.name} onChange={e=>updateDebt(i,'name',e.target.value)} className="col-span-3 h-8 px-2 text-sm rounded border border-input bg-background text-foreground"/>
              <div><label className="text-[10px] text-muted-foreground">Balance</label><div className="flex items-center h-8 rounded border border-input bg-background"><span className="pl-1 text-muted-foreground text-xs">$</span><input type="number" value={d.balance} onChange={e=>updateDebt(i,'balance',e.target.value)} className="w-full h-full px-1 text-sm bg-transparent outline-none text-foreground"/></div></div>
              <div><label className="text-[10px] text-muted-foreground">Rate %</label><div className="flex items-center h-8 rounded border border-input bg-background"><input type="number" value={d.rate} onChange={e=>updateDebt(i,'rate',e.target.value)} step="0.1" className="w-full h-full px-1 text-sm bg-transparent outline-none text-foreground"/><span className="pr-1 text-muted-foreground text-xs">%</span></div></div>
              <div><label className="text-[10px] text-muted-foreground">Payment</label><div className="flex items-center h-8 rounded border border-input bg-background"><span className="pl-1 text-muted-foreground text-xs">$</span><input type="number" value={d.payment} onChange={e=>updateDebt(i,'payment',e.target.value)} className="w-full h-full px-1 text-sm bg-transparent outline-none text-foreground"/></div></div>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Consolidation Rate (%)</label><div className={i}><input type="number" value={consolidationRate} onChange={e=>setConsolidationRate(e.target.value)} step="0.1" className={c}/><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div><label className="text-sm font-medium mb-1 block">Consolidation Term</label><div className={i}><input type="number" value={consolidationTerm} onChange={e=>setConsolidationTerm(e.target.value)} className={c}/><span className="pr-3 text-muted-foreground text-sm">years</span></div></div>
          </div>
          <div className="flex gap-3 mt-1"><button onClick={calc_} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button><button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4"/></button></div>
        </div>
        <div className="flex flex-col gap-4">
          {result&&(<>
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{result.monthlySavings>0?'You Save':'New Payment'}</div>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{result.monthlySavings>0?'$'+result.monthlySavings.toFixed(2)+'/mo saved':'$'+result.consolPayment.toFixed(2)+'/mo'}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.totalSavings>0?'Total savings: $'+Math.round(result.totalSavings).toLocaleString():'Consolidation rate may be too high'}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Current","$"+result.currentTotalPayment.toFixed(2)],["New","$"+result.consolPayment.toFixed(2)],["Savings",result.monthlySavings>0?"$"+result.monthlySavings.toFixed(2):"N/A"]].map(([l,v],idx)=>(<div key={idx} className={`p-4 text-center ${idx>0?"border-l border-border":""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Consolidation Comparison</h3><table className="w-full text-base"><tbody>{result.breakdown.map((r,i)=>(<tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight?"bg-primary/5":""}`}><td className={`py-2.5 ${r.highlight?"font-bold":"text-muted-foreground"}`}>{r.label}</td><td className={`py-2.5 text-right ${r.highlight?"font-bold":"font-semibold"}`}>{r.value}</td></tr>))}</tbody></table></div>
            <div className="card-calculator !p-5 border border-border bg-card"><h3 className="text-base font-bold mb-4">Payment Comparison</h3><ResponsiveContainer width="100%" height={200}><BarChart data={result.chartData} margin={{top:5,right:10,left:10,bottom:5}} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis type="number" tick={{fontSize:10}} tickFormatter={v=>'$'+v}/><YAxis type="category" dataKey="name" tick={{fontSize:10}} width={100}/><Tooltip formatter={(v:number)=>['$'+v.toLocaleString()+'/mo','']}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="current" fill="#ef4444" name="Current" radius={[0,4,4,0]}/><Bar dataKey="consolidated" fill="hsl(var(--primary))" name="Consolidated" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div>
            <div className="bg-muted/30 rounded-lg p-5"><h3 className="text-base font-bold mb-4">Summary Statistics</h3><div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s,i)=>(<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div></div>
          </>)}
        </div>
      </div>
      <div className="max-w-[1180px] mt-8"><AdPlaceholder className="mb-10"/><section className="prose-finance text-[15.75px]"><h2 className="text-2xl font-bold mb-3">Is Debt Consolidation Right for You?</h2><p>Debt consolidation works best when you can secure a lower interest rate than your current weighted average AND maintain or reduce your payoff timeline. Enter all your debts above to see whether consolidating saves you money — or whether a debt avalanche strategy might be better.</p></section><FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/consolidation-loan-rate-calculator"/><PopularCalculators exclude="/calculator/consolidation-loan-rate-calculator"/></div>
    </div>
  </>);
}
