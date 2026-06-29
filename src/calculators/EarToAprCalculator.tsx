"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, d = 4) => n.toFixed(d);

function calcEarToApr(ear: number, n: number) {
  const r = ear / 100;
  const apr = n * (Math.pow(1 + r, 1 / n) - 1) * 100;
  const periodicRate = apr / n;
  const continuousApr = Math.log(1 + r) * 100;
  const comparison = [1,2,4,12,26,52,365].map(freq => ({
    freq, label: ["Annual","Semi-Annual","Quarterly","Monthly","Biweekly","Weekly","Daily"][([1,2,4,12,26,52,365].indexOf(freq))],
    apr: (freq * (Math.pow(1 + r, 1/freq) - 1)) * 100,
  }));
  return { apr, periodicRate, continuousApr, comparison };
}

const TTip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2 rounded-lg shadow text-xs">
    <p className="font-bold mb-1">{label}</p>
    <p className="text-primary font-semibold">APR: {payload[0]?.value?.toFixed(4)}%</p>
  </div>
) : null;

const FREQ_LABELS = ["Annual","Semi-Annual","Quarterly","Monthly","Biweekly","Weekly","Daily"];
const FREQ_VALS = ["1","2","4","12","26","52","365"];

export default function EarToAprCalculator() {
  const [ear, setEar] = useState("8.2999");
  const [freq, setFreq] = useState("12");
  const [res, setRes] = useState<ReturnType<typeof calcEarToApr>|null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); run(); }, []);
  const run = () => setRes(calcEarToApr(parseFloat(ear)||8.2999, parseInt(freq)||12));
  const reset = () => { setEar("8.2999"); setFreq("12"); setRes(calcEarToApr(8.2999,12)); };

  const faqs = [
    { question: "What is the EAR to APR formula?", answer: "APR = n × [(1 + EAR)^(1/n) − 1], where n is compounding frequency per year. For EAR = 8.2999% monthly: APR = 12 × [(1.082999)^(1/12) − 1] = 12 × 0.006667 = 8.00%." },
    { question: "Why convert EAR to APR?", answer: "Banks and lenders typically disclose APR (required by law), but savings accounts and investments often advertise APY/EAR. Converting EAR back to APR lets you normalize different financial products to a common basis for comparison." },
    { question: "Is EAR always higher than APR?", answer: "Yes, for compounding frequencies greater than 1. With annual compounding (n=1), APR = EAR. With monthly, quarterly, or daily compounding, EAR > APR. The more frequent the compounding, the larger the gap between the two." },
    { question: "What is the continuous equivalent APR?", answer: "The continuously compounded APR equivalent is ln(1 + EAR) × 100. For EAR of 8.2999%, continuous APR = ln(1.082999) = 7.969%. This is always the lowest possible APR for a given EAR." },
    { question: "When do I use EAR vs APR?", answer: "Use APR when comparing loan products or regulatory disclosures. Use EAR when comparing savings accounts, CDs, or investment returns — because EAR reflects the true annual return including the compounding effect. APY and EAR are mathematically the same thing." },
  ];

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Financial",href:"/calculator#financial"},{label:"EAR to APR Calculator"}]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">EAR to APR Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Rate Conversion</h2>
            <CompactInput id="ear" label="Effective Annual Rate (EAR / APY)" value={ear} onChange={setEar} suffix="%" />
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-1">Target Compounding Frequency</label>
              <select value={freq} onChange={e => setFreq(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-background text-foreground text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                {FREQ_VALS.map((v,i) => <option key={v} value={v}>{FREQ_LABELS[i]}</option>)}
              </select>
            </div>
            <div className="p-3 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground">
              Formula: APR = n × [(1 + EAR)^(1/n) − 1]. Converts EAR/APY back to nominal APR at the specified compounding frequency.
            </div>
            <div className="flex gap-2.5">
              <button onClick={run} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border hover:bg-secondary h-9 transition-colors flex items-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Conversion Results</h2>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Nominal APR ({FREQ_LABELS[FREQ_VALS.indexOf(freq)]} compounding)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{fmt(res.apr)}%</div>
                  <div className="text-sm text-muted-foreground mt-1">Periodic Rate: {fmt(res.periodicRate)}% · Continuous APR: {fmt(res.continuousApr)}%</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase">
                      <th className="p-2.5 pl-3">Rate Type</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        {label:`EAR / APY (input)`,value:`${ear}%`,bold:true},
                        {label:`APR (${FREQ_LABELS[FREQ_VALS.indexOf(freq)]} compounding)`,value:`${fmt(res.apr)}%`,bold:true},
                        {label:"Periodic Rate",value:`${fmt(res.periodicRate)}%`},
                        {label:"Continuous APR equiv.",value:`${fmt(res.continuousApr)}%`},
                        {label:"EAR − APR spread",value:`${fmt(parseFloat(ear)-(res.apr))}%`},
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold?"font-bold bg-secondary/30":""}`}>
                          <td className="p-2.5 pl-3 font-semibold">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <h3 className="text-sm font-bold mb-3">APR by Compounding Frequency (same EAR)</h3>
                  {mounted && (<>

                    <ResponsiveContainer width="100%" height={195}>
                      <BarChart data={res.comparison} margin={{top:4,right:8,left:0,bottom:40}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" tick={{fontSize:9}} angle={-30} textAnchor="end" interval={0} />
                        <YAxis tick={{fontSize:11}} tickFormatter={v=>`${v.toFixed(2)}%`} domain={["auto","auto"]} />
                        <Tooltip content={<TTip />} />
                        <Bar dataKey="apr" radius={[4,4,0,0]} name="APR">
                          {res.comparison.map((_,i) => <Cell key={i} fill={`hsl(var(--primary) / ${0.4 + i/res.comparison.length*0.6})`} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  
</>)}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border">
                  {[
                    {label:"Input EAR",value:`${ear}%`},
                    {label:"Compounding",value:`${freq}×/year`},
                    {label:"Calculated APR",value:`${fmt(res.apr)}%`},
                    {label:"Periodic Rate",value:`${fmt(res.periodicRate)}%`},
                    {label:"Annual compounding APR",value:`${fmt(res.comparison[0].apr)}%`},
                    {label:"Daily compounding APR",value:`${fmt(res.comparison[6].apr)}%`},
                  ].map(item => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the EAR to APR Calculator?</h2>
            <p>This calculator performs the reverse of the standard APR-to-EAR conversion: given an Effective Annual Rate (EAR) or Annual Percentage Yield (APY), it finds the equivalent nominal APR at any compounding frequency. The formula is APR = n × [(1 + EAR)^(1/n) − 1], where n is the number of compounding periods per year.</p>
            <p>This conversion is essential when you need to compare a savings account's APY to a loan's APR, when issuing bonds that must disclose a nominal coupon rate, or when converting investment returns to the rate convention used in your market. Financial professionals working across different markets use this constantly since countries and institutions use different rate quoting conventions.</p>
            <h2>EAR vs APY: Are They the Same?</h2>
            <p>Yes — APY (Annual Percentage Yield) and EAR (Effective Annual Rate) are mathematically identical. Both represent the true annual return or cost after accounting for intra-year compounding. The US Truth in Savings Act requires banks to disclose APY for deposit accounts, which is why you see APY on savings accounts and CDs. The relationship to APR depends on how frequently the bank compounds interest.</p>
            <h2>Practical Applications</h2>
            <p>Bond traders converting between yield conventions (semi-annual US bonds vs. annual European bonds), mortgage lenders comparing quotes from different markets, corporate treasurers benchmarking investment returns against their borrowing costs, and financial analysts normalizing data across international markets all rely on EAR-to-APR conversion daily. Understanding both sides of this conversion is fundamental to financial mathematics.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ear-to-apr-calculator" />
          <PopularCalculators exclude="/calculator/ear-to-apr-calculator" />
        </div>
      </div>
    </>
  );
}
