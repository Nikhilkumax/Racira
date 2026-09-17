"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function fmtUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const DEFAULTS = { years: "25", salary: "90000", accrual: "1.5", cola: "2", retireAge: "65", lifeExp: "88", lumpRate: "5" };

export default function PensionCalculator() {
  const [years, setYears] = useState(DEFAULTS.years);
  const [salary, setSalary] = useState(DEFAULTS.salary);
  const [accrual, setAccrual] = useState(DEFAULTS.accrual);
  const [cola, setCola] = useState(DEFAULTS.cola);
  const [retireAge, setRetireAge] = useState(DEFAULTS.retireAge);
  const [lifeExp, setLifeExp] = useState(DEFAULTS.lifeExp);
  const [lumpRate, setLumpRate] = useState(DEFAULTS.lumpRate);
  const [calculated, setCalculated] = useState(false);

  const y = Math.max(0, parseFloat(years) || 0);
  const s = Math.max(0, parseFloat(salary) || 0);
  const a = Math.max(0, Math.min(10, parseFloat(accrual) || 0)) / 100;
  const c = Math.max(0, Math.min(10, parseFloat(cola) || 0)) / 100;
  const ra = Math.max(45, Math.min(75, parseFloat(retireAge) || 65));
  const le = Math.max(ra + 1, Math.min(100, parseFloat(lifeExp) || 88));
  const r = Math.max(0, Math.min(15, parseFloat(lumpRate) || 0)) / 100;

  const annualPension = y * a * s;
  const monthly = annualPension / 12;
  const yearsInPayout = le - ra;
  // lump-sum PV of a growing annuity (COLA) discounted at the lump rate
  const g = c;
  const lumpPV = r === g
    ? annualPension * yearsInPayout / (1 + r)
    : annualPension * (1 - Math.pow((1 + g) / (1 + r), yearsInPayout)) / (r - g);
  const nominalTotal = annualPension * yearsInPayout;

  const chartData = Array.from({ length: yearsInPayout }, (_, i) => ({
    name: `${ra + i}`,
    annual: Math.round(annualPension * Math.pow(1 + c, i)),
  }));

  const calc = () => setCalculated(true);
  useEffect(() => { if (calculated) setCalculated(true); }, [calculated]);

  const reset = () => { setYears(DEFAULTS.years); setSalary(DEFAULTS.salary); setAccrual(DEFAULTS.accrual); setCola(DEFAULTS.cola); setRetireAge(DEFAULTS.retireAge); setLifeExp(DEFAULTS.lifeExp); setLumpRate(DEFAULTS.lumpRate); setCalculated(false); };

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How is the pension calculated?", answer: "Most defined-benefit plans use years of service × accrual rate × final average salary. This calculator uses that formula with a 1.5% default accrual — many plans pay 1.5–2% per year of service, and some use an average of your last 3–5 years of salary instead of a single final figure." },
    { question: "What does the lump-sum value mean?", answer: "It is the present value of the expected payout stream, discounted at your chosen rate. Plans often offer a real lump-sum option at retirement; comparing it against this present value tells you whether the offer is fair. Higher discount rates shrink the lump sum." },
    { question: "How does COLA affect the payout?", answer: "A 2% cost-of-living adjustment compounds the annual payment each year. Over a 23-year payout that is a large difference — the later years' checks are far bigger in nominal dollars, which is exactly what a retiree needs to preserve purchasing power." },
    { question: "Should I take the lump sum or the annuity?", answer: "Rule of thumb: if the plan's lump-sum offer is close to the present value at a reasonable discount rate, take the annuity for guaranteed income. If you have a strong investment plan and need flexibility, the lump sum can win — run the comparison here first." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Pension Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Pension Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Years of service</label>
                <input type="number" min={0} value={years} onChange={e => setYears(e.target.value)} className={inp} placeholder="25" />
              </div>
              <div>
                <label className={lbl}>Final average salary</label>
                <input type="number" min={0} value={salary} onChange={e => setSalary(e.target.value)} className={inp} placeholder="90000" />
              </div>
              <div>
                <label className={lbl}>Accrual rate % per year</label>
                <input type="number" min={0} max={10} step={0.1} value={accrual} onChange={e => setAccrual(e.target.value)} className={inp} placeholder="1.5" />
              </div>
              <div>
                <label className={lbl}>COLA % per year</label>
                <input type="number" min={0} max={10} step={0.1} value={cola} onChange={e => setCola(e.target.value)} className={inp} placeholder="2" />
              </div>
              <div>
                <label className={lbl}>Retirement age</label>
                <input type="number" min={45} max={75} value={retireAge} onChange={e => setRetireAge(e.target.value)} className={inp} placeholder="65" />
              </div>
              <div>
                <label className={lbl}>Life expectancy</label>
                <input type="number" min={46} max={100} value={lifeExp} onChange={e => setLifeExp(e.target.value)} className={inp} placeholder="88" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Lump-sum discount rate %</label>
                <input type="number" min={0} max={15} step={0.1} value={lumpRate} onChange={e => setLumpRate(e.target.value)} className={inp} placeholder="5" />
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calc} className="flex-1 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {calculated && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Annual Pension at Retirement</div>
                <div className="text-3xl font-extrabold tracking-tight">{fmtUSD(annualPension)}/yr</div>
                <div className="text-sm text-muted-foreground mt-1">{fmtUSD(monthly)}/month · {y} yrs × {a * 100}% × {fmtUSD(s)}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Lump-sum value", fmtUSD(lumpPV), `${lumpRate}% discount`], ["Nominal total paid", fmtUSD(nominalTotal), `${yearsInPayout} yrs of checks`], ["First check (COLA)", fmtUSD(annualPension), `${c * 100}%/yr growth`]].map(([l, v, s], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Payout Stream with COLA</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v: number) => [fmtUSD(Number(v)), "Annual payout"]} />
                    <Bar dataKey="annual" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Each bar shows that year's check — COLA compounds, so later years pay more</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Plan Summary</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  <div className="flex justify-between"><span className="text-muted-foreground">Years of service:</span><span className="font-semibold">{y} yrs</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Accrual rate:</span><span className="font-semibold">{a * 100}%/yr</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Final avg salary:</span><span className="font-semibold">{fmtUSD(s)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">COLA:</span><span className="font-semibold">{c * 100}%/yr</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Years in payout:</span><span className="font-semibold">{yearsInPayout}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Lump-sum PV:</span><span className="font-semibold">{fmtUSD(lumpPV)}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Defined-Benefit Formula</h2>
            <p>Traditional pensions pay a guaranteed stream: years of service times an accrual rate times your final average salary. This <strong>pension calculator</strong> applies that formula and then values the result two ways — as an annuity with cost-of-living adjustments, and as the lump-sum present value.</p>
            <h2 className="text-2xl font-bold mb-3">COLA Changes Everything</h2>
            <p>A 2% adjustment may sound small, but compounded over a 20+ year retirement it is the difference between a check that buys less every year and one that holds its purchasing power. The chart shows the payout stream rising year over year.</p>
            <h2 className="text-2xl font-bold mb-3">Lump Sum vs. Annuity</h2>
            <p>When a plan offers a lump sum, compare it to the present value at a discount rate that reflects how you would actually invest it. If the offer is at or above the present value, taking the cash can be reasonable; if it is well below, the annuity is usually the better deal.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pension-calculator" />
          <PopularCalculators exclude="/calculator/pension-calculator" />
        </div>
      </div>
    </>
  );
}
